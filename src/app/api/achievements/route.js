export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

const achievements = [
  {
    id: 'first_calculation',
    title: 'Carbon Conscious',
    description: 'Complete your first carbon footprint calculation',
    icon: '🌱',
    category: 'milestone',
    points: 10,
    rarity: 'common'
  },
  {
    id: 'week_streak',
    title: 'Weekly Warrior',
    description: 'Track emissions for 7 consecutive days',
    icon: '🔥',
    category: 'streak',
    points: 25,
    rarity: 'uncommon'
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Track emissions for 30 consecutive days',
    icon: '👑',
    category: 'streak',
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'reduction_10',
    title: 'Green Pioneer',
    description: 'Reduce emissions by 10% compared to last month',
    icon: '📉',
    category: 'reduction',
    points: 30,
    rarity: 'uncommon'
  },
  {
    id: 'reduction_25',
    title: 'Climate Champion',
    description: 'Reduce emissions by 25% compared to last month',
    icon: '🏆',
    category: 'reduction',
    points: 75,
    rarity: 'epic'
  },
  {
    id: 'transport_switch',
    title: 'Eco Commuter',
    description: 'Use public transport or cycling for a week',
    icon: '🚲',
    category: 'habit',
    points: 20,
    rarity: 'common'
  },
  {
    id: 'zero_waste_week',
    title: 'Waste Warrior',
    description: 'Go zero waste for an entire week',
    icon: '♻️',
    category: 'habit',
    points: 40,
    rarity: 'rare'
  },
  {
    id: 'community_helper',
    title: 'Community Catalyst',
    description: 'Help 5 friends start tracking their carbon footprint',
    icon: '🤝',
    category: 'social',
    points: 35,
    rarity: 'uncommon'
  },
  {
    id: 'leaderboard_top10',
    title: 'Top Contributor',
    description: 'Reach top 10 on the monthly leaderboard',
    icon: '⭐',
    category: 'competition',
    points: 60,
    rarity: 'epic'
  },
  {
    id: 'perfect_month',
    title: 'Carbon Perfectionist',
    description: 'Achieve all monthly goals perfectly',
    icon: '💎',
    category: 'milestone',
    points: 100,
    rarity: 'legendary'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Clerk ID required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("carbo");

    // Get user's unlocked achievements
    const userAchievements = await db.collection("user_achievements").findOne({ clerkId });

    // Get user's emission data for achievement checking
    const userEmissions = await db.collection("overall").findOne({ clerkId });

    // Calculate current achievements
    const unlockedAchievements = checkAchievements(userEmissions, userAchievements?.unlocked || []);

    // Update database if new achievements unlocked
    if (unlockedAchievements.new.length > 0) {
      await db.collection("user_achievements").updateOne(
        { clerkId },
        {
          $set: {
            unlocked: [...(userAchievements?.unlocked || []), ...unlockedAchievements.new],
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );
    }

    return new Response(JSON.stringify({
      allAchievements: achievements,
      unlocked: unlockedAchievements.all,
      new: unlockedAchievements.new,
      totalPoints: calculateTotalPoints(unlockedAchievements.all),
      stats: calculateStats(unlockedAchievements.all)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Achievements error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch achievements' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clerkId, achievementId } = body;

    if (!clerkId || !achievementId) {
      return new Response(JSON.stringify({ error: 'Clerk ID and achievement ID required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("carbo");

    // Manually unlock achievement (for testing or admin purposes)
    await db.collection("user_achievements").updateOne(
      { clerkId },
      {
        $addToSet: { unlocked: achievementId },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true }
    );

    return new Response(JSON.stringify({ success: true, achievementId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Achievement unlock error:', error);
    return new Response(JSON.stringify({ error: 'Failed to unlock achievement' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function checkAchievements(userEmissions, unlockedIds) {
  const unlocked = [];
  const newAchievements = [];

  // Check each achievement
  achievements.forEach(achievement => {
    if (unlockedIds.includes(achievement.id)) {
      unlocked.push(achievement);
      return;
    }

    // Check if achievement conditions are met
    if (checkAchievementCondition(achievement.id, userEmissions)) {
      unlocked.push(achievement);
      newAchievements.push(achievement.id);
    }
  });

  return { all: unlocked, new: newAchievements };
}

function checkAchievementCondition(achievementId, userEmissions) {
  if (!userEmissions) return false;

  switch (achievementId) {
    case 'first_calculation':
      return userEmissions.monthlyData && Object.keys(userEmissions.monthlyData).length > 0;

    case 'week_streak':
      // Check for 7 consecutive days of tracking (simplified)
      return userEmissions.monthlyData && Object.keys(userEmissions.monthlyData).length >= 4;

    case 'month_streak':
      return userEmissions.monthlyData && Object.keys(userEmissions.monthlyData).length >= 12;

    case 'reduction_10':
    case 'reduction_25':
      // Check for emission reduction (simplified logic)
      const months = Object.keys(userEmissions.monthlyData || {});
      if (months.length < 2) return false;

      const values = months.map(month => userEmissions.monthlyData[month]).filter(v => v > 0);
      if (values.length < 2) return false;

      const latest = values[values.length - 1];
      const previous = values[values.length - 2];
      const reduction = ((previous - latest) / previous) * 100;

      return achievementId === 'reduction_10' ? reduction >= 10 : reduction >= 25;

    default:
      return false;
  }
}

function calculateTotalPoints(unlockedAchievements) {
  return unlockedAchievements.reduce((total, achievement) => total + achievement.points, 0);
}

function calculateStats(unlockedAchievements) {
  const categories = {};
  const rarities = {};

  unlockedAchievements.forEach(achievement => {
    categories[achievement.category] = (categories[achievement.category] || 0) + 1;
    rarities[achievement.rarity] = (rarities[achievement.rarity] || 0) + 1;
  });

  return { categories, rarities, total: unlockedAchievements.length };
}
