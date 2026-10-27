export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

// Build leaderboard scores from the `overall` collection
// Lower total emissions rank higher. We also compute helpful aggregates
// like belowAverageCount (vs national averages) and recentReductionPct.

const nationalAverages = {
  transportation: 250,
  energyUse: 180,
  foodConsumption: 160,
  wasteManagement: 30,
  waterUsage: 15,
  socialActivities: 50,
  shopping: 70,
  buildingMaintenance: 45,
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const docs = await db.collection("overall").find({}).toArray();

    // Map docs to leaderboard entries
    const entries = docs.map((doc) => {
      const categories = doc.categories || {};
      const total = Object.values(categories).reduce(
        (sum, v) => sum + (typeof v === "number" ? v : 0),
        0
      );

      // Count categories under national averages (if present in both)
      const belowAverageCount = Object.keys(categories).reduce((acc, k) => {
        if (nationalAverages[k] !== undefined) {
          const v = typeof categories[k] === "number" ? categories[k] : 0;
          return acc + (v <= nationalAverages[k] ? 1 : 0);
        }
        return acc;
      }, 0);

      // Compute recent reduction % (last month vs previous month)
      const md = doc.monthlyData || {};
      const monthIdxs = months
        .map((m, idx) => ({ idx, val: typeof md[m] === "number" ? md[m] : null }))
        .filter((x) => x.val !== null);

      let recentReductionPct = null;
      if (monthIdxs.length >= 2) {
        const last = monthIdxs[monthIdxs.length - 1].val;
        const prev = monthIdxs[monthIdxs.length - 2].val;
        if (prev > 0) {
          recentReductionPct = Math.round(((prev - last) / prev) * 100);
        } else {
          recentReductionPct = null;
        }
      }

      return {
        clerkId: doc.clerkId,
        displayName: doc.displayName || null,
        imageUrl: doc.imageUrl || null,
        total,
        belowAverageCount,
        recentReductionPct,
        updatedAt: doc.updatedAt || doc.createdAt || null,
        categories,
      };
    });

    // Composite score & ranking
    // Start with 100 - normalize by total using a soft scale; reward belowAverageCount and reductions
    const scored = entries
      .map((e) => {
        // Normalize total: smaller total => higher score contribution
        const totalScore = Math.max(0, 100 - Math.sqrt(Math.max(0, e.total)));

        // Each below-average category +3
        const balanceScore = (e.belowAverageCount || 0) * 3;

        // Recent reduction: +1 per percentage point, cap +20
        const reductionScore = Math.min(20, Math.max(0, e.recentReductionPct || 0));

        const composite = Math.round(totalScore + balanceScore + reductionScore);
        return { ...e, composite };
      })
      .sort((a, b) => b.composite - a.composite || a.total - b.total);

    return new Response(JSON.stringify(scored), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error building leaderboard:", error);
    return new Response(JSON.stringify({ error: "Failed to build leaderboard" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

