
export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const { items } = await req.json();
    if (!items || !items.length) return NextResponse.json({ categorizedItems: [] });

    const prompt = `
You are a helpful assistant. Categorize the following receipt items strictly into these dashboard categories:
- Transportation
- Energy Use
- Food Consumption
- Waste Management
- Water Usage
- Social Activities
- Shopping & Online Purchases
- Building & Home Maintenance

List the items as JSON array with fields:
{ "name": "string", "emissionKg": number, "category": "string" }

Items:
${JSON.stringify(items)}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    let output = result.response.text().trim();
    output = output.replace(/```json|```/g, "").trim();

    let categorizedItems;
    try {
      categorizedItems = JSON.parse(output);
    } catch {
      categorizedItems = items.map(i => ({ ...i, category: "Food Consumption" }));
    }

    return NextResponse.json({ categorizedItems });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
