export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

export async function GET(request) {
  try {
    // Wait for the client connection to resolve
    const client = await clientPromise;

    // Access the database
    const db = client.db("carbo");

    // Query the collection
    const cursor = db.collection("overall").find();
    const data = await cursor.toArray();

    // Return the data as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching data:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
