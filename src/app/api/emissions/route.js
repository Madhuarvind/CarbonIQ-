export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

// GET endpoint: fetch all data
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const cursor = db.collection("overall").find();
    const data = await cursor.toArray();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST endpoint: add or update user's monthly data
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const body = await request.json();
    const { clerkId, month, value } = body;

    const userData = await db.collection("overall").findOne({ clerkId });

    if (userData) {
      // Update existing user's monthly data
      const monthlyData = { ...userData.monthlyData };
      monthlyData[month] = (monthlyData[month] || 0) + value;

      await db.collection("overall").updateOne(
        { clerkId },
        { $set: { monthlyData } }
      );
    } else {
      // Insert new user document
      await db.collection("overall").insertOne({
        clerkId,
        monthlyData: { [month]: value },
        categories: {}, // keep structure consistent
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
