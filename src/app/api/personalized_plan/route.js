export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const { userData, categories } = await req.json();

    if (!userData || !categories) {
      return NextResponse.json({ error: "Missing user data or categories" }, { status: 400 });
    }

    const prompt = `
You are an AI carbon footprint advisor. Based on the user's emission data, create a personalized 30-day carbon reduction plan.

User Data:
- Total Annual Emissions: ${userData.totalEmissions} kg CO₂
- Categories: ${JSON.stringify(categories)}

Generate a JSON response with:
{
  "planTitle": "string",
  "totalReductionPotential": number (kg CO₂),
  "plan": [
    {
      "week": number,
      "focus": "string",
      "actions": [
        {
          "action": "string",
          "impact": "string (kg CO₂ reduction)",
          "difficulty": "Easy/Medium/Hard",
          "category": "string"
        }
      ],
      "weeklyGoal": "string"
    }
  ],
  "longTermRecommendations": ["string"],
  "motivationalMessage": "string"
}

Make the plan realistic, actionable, and personalized based on their highest emission categories. Focus on the top 3 emission categories.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    let output = result.response.text().trim();
    output = output.replace(/```json|```/g, "").trim();

    let personalizedPlan;
    try {
      personalizedPlan = JSON.parse(output);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback plan
      personalizedPlan = {
        planTitle: "Your Personalized Carbon Reduction Plan",
        totalReductionPotential: Math.round(userData.totalEmissions * 0.2),
        plan: [
          {
            week: 1,
            focus: "Transportation",
            actions: [
              {
                action: "Try carpooling for work commutes",
                impact: "5-10 kg CO₂/week",
                difficulty: "Easy",
                category: "Transportation"
              }
            ],
            weeklyGoal: "Reduce transportation emissions by 20%"
          }
        ],
        longTermRecommendations: ["Consider electric vehicle", "Use public transport"],
        motivationalMessage: "Every small step counts towards a greener future!"
      };
    }

    return NextResponse.json({ personalizedPlan });
  } catch (err) {
    console.error("Error generating personalized plan:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
