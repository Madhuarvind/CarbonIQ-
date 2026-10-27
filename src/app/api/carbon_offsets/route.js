export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Get cached carbon offset projects from database
    const cachedOffsets = await db.collection("carbon_offsets")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Format the response to match the expected structure
    const formattedOffsets = cachedOffsets.map(offset => ({
      id: offset.id,
      title: offset.title,
      description: offset.description,
      category: offset.category,
      location: offset.location,
      pricePerTon: offset.pricePerTon,
      totalTons: offset.totalTons,
      soldTons: offset.soldTons,
      impact: offset.impact,
      verification: offset.verification,
      image: offset.image,
      benefits: offset.benefits,
      rating: offset.rating,
      reviews: offset.reviews
    }));

    return new Response(JSON.stringify({ projects: formattedOffsets }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (error) {
    console.error("Error fetching cached carbon offsets:", error);

    // Fallback to empty response if database fails
    return new Response(JSON.stringify({ projects: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
