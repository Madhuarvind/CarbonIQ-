export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Get cached news from database
    const cachedNews = await db.collection("news_cache")
      .find({})
      .sort({ pubDate: -1 }) // Sort by newest first
      .limit(50) // Limit to 50 items
      .toArray();

    // Format the response to match the expected structure
    const formattedFeed = {
      items: cachedNews.map(item => ({
        title: item.title,
        link: item.link,
        contentSnippet: item.contentSnippet,
        pubDate: item.pubDate,
        enclosure: item.enclosure,
        sourceName: item.sourceName
      }))
    };

    return new Response(JSON.stringify(formattedFeed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" // Cache for 1 hour, serve stale for 24 hours
      },
    });
  } catch (error) {
    console.error("Error fetching cached news:", error);

    // Fallback to empty response if database fails
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
