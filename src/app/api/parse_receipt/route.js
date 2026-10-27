export const dynamic = "force-static";

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import carbonFactors from '../../data/carbonFactors.json';
import weightGuesses from '../../data/weightGuesses.json';

// ---------------------------
// Helpers
// ---------------------------
function flattenFactors(nested) {
  const flat = {};
  for (const [category, items] of Object.entries(nested)) {
    for (const [name, factor] of Object.entries(items)) {
      flat[name.toLowerCase()] = { factor, category };
    }
  }
  return flat;
}

const flatFactors = flattenFactors(carbonFactors);
const flatWeights = flattenFactors(weightGuesses);

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function findClosestKey(name, dict) {
  const normalized = name.toLowerCase();
  let bestMatch = null;
  let bestScore = Infinity;
  for (const key of Object.keys(dict)) {
    const score = levenshtein(normalized, key.toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  return bestScore <= 4 ? dict[bestMatch] : null;
}

function findClosestFactor(itemName) {
  return (
    findClosestKey(itemName, flatFactors) ?? { factor: 2.0, category: "miscellaneous" }
  );
}

function guessWeight(itemName, fallback = 0.25) {
  const w = findClosestKey(itemName, flatWeights);
  return w?.factor ?? fallback;
}

// ---------------------------
// Emission calculation
// ---------------------------
function calculateEmissions(parsedReceipt) {
  let totalKg = 0;
  const categories = {};

  const updatedItems = (parsedReceipt.items || []).map((item) => {
    const factorData = findClosestFactor(item.name);

    // extract factor & category
    let factor =
      typeof factorData === 'number'
        ? factorData
        : factorData?.factor ?? 1;

    let category = factorData?.category ?? 'Miscellaneous';

    const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;

    const weightPerUnit =
      item.weightKg && item.weightKg > 0
        ? item.weightKg
        : guessWeight(item.name);

    const totalWeight = weightPerUnit * quantity;
    const emissions = factor * totalWeight;

    totalKg += emissions;

    // group by category
    if (!categories[category]) categories[category] = 0;
    categories[category] += emissions;

    return {
      ...item,
      quantity,
      weightKg: parseFloat(weightPerUnit.toFixed(2)),  // per-unit weight
      totalWeight: parseFloat(totalWeight.toFixed(2)), // total weight
      factor: parseFloat(factor.toFixed(2)),           // 👈 actual factor value
      emissionKg: parseFloat(emissions.toFixed(2)),
      category,
    };
  });

  // cleanup: round category totals
  Object.keys(categories).forEach(
    (c) => (categories[c] = parseFloat(categories[c].toFixed(2)))
  );

  return {
    items: updatedItems,
    categories,
    totalKg: parseFloat(totalKg.toFixed(2)),
  };
}

// ---------------------------
// AI + API handler
// ---------------------------
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: "No receipt text provided" },
        { status: 400 }
      );
    }

    console.log("Receipt text being sent to Gemini:", text);

    const prompt = `
You are a JSON-only generator for receipts. Parse strictly into this format:
{
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string",
      "quantity": integer,
      "weightKg": number
    }
  ]
}

Rules:
- Quantities must always be integers (≥1). Never decimals or fractions.
- Ignore all prices ($xx.xx) — they are not quantities.
- "weightKg" is per single unit, not multiplied by quantity.
- If unsure, guess reasonable weights: meals=0.25, fruit/veg=0.15, drinks=0.5, desserts=0.3.
- Normalize product names to simple lowercase nouns ("burger", "salad", "soft drink", "pie").
- Never return null, blank, or extra fields.
- Output only valid JSON.

Receipt text:
${text}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();

    console.log("Raw Gemini output:", output);

    output = output.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
      if (!parsed.items || !Array.isArray(parsed.items)) {
        parsed.items = [];
      }

      const emissions = calculateEmissions(parsed);
      parsed.items = emissions.items;
      parsed.categories = emissions.categories;
      parsed.totalKg = emissions.totalKg;
    } catch {
      parsed = {
        merchant: "Unknown",
        date: "N/A",
        items: [],
        totalKg: 0,
        raw: output,
      };
    }

    return NextResponse.json({ parsed, rawOutput: output });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
