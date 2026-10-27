export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";

const challenges = [
  {
    id: 'zero_waste_week',
    title: 'Zero Waste Week',
    description: 'Go completely waste-free for 7 days',
    duration: 7,
    difficulty: 'hard',
    category: 'waste',
    participants: 0,
    maxParticipants: 100,
    reward: 50,
    startDate: null,
    endDate: null,
    status: 'upcoming'
  },
  {
    id: 'bike_to_work',
    title: 'Bike to Work Challenge',
    description: 'Use bicycle or public transport for commuting',
    duration: 14,
    difficulty: 'medium',
    category: 'transport',
    participants: 0,
    maxParticipants: 50,
    reward: 30,
    startDate: null,
    endDate: null,
    status: 'upcoming'
  },
  {
    id: 'plant_based_meals',
    title: 'Plant-Based Meals',
    description: 'Eat only plant-based meals for 10 days',
    duration: 10,
    difficulty: 'medium',
    category: 'food',
    participants: 0,
    maxParticipants: 75,
    reward: 40,
    startDate: null,
    endDate: null,
    status: 'upcoming'
  },
  {
    id: 'energy_saver',
    title: 'Energy Conservation',
    description: 'Reduce home energy usage by 20%',
    duration: 30,
    difficulty: 'easy',
    category: 'energy',
    participants: 0,
    maxParticipants: 200,
    reward: 25,
    startDate: null,
    endDate: null,
    status: 'upcoming'
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

    // Get user's challenge participation
    const userChallenges = await db.collection("user_challenges").findOne({ clerkId });

    // Get active challenges
    const activeChallenges = await db.collection("challenges").find({
      status: { $in: ['active', 'upcoming'] }
    }).toArray();

    // If no challenges in DB, initialize with default challenges
    if (activeChallenges.length === 0) {
      await initializeChallenges(db);
      return GET(request); // Recursive call to get initialized data
    }

    // Add participation status for user
    const challengesWithParticipation = activeChallenges.map(challenge => ({
      ...challenge,
      isParticipating: userChallenges?.participating?.includes(challenge._id.toString()) || false,
      userProgress: userChallenges?.progress?.[challenge._id.toString()] || 0
    }));

    return new Response(JSON.stringify({
      challenges: challengesWithParticipation,
      userStats: {
        totalParticipating: userChallenges?.participating?.length || 0,
        completedChallenges: userChallenges?.completed?.length || 0,
        totalPoints: calculateTotalPoints(userChallenges)
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Challenges error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch challenges' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clerkId, challengeId, action } = body;

    if (!clerkId || !challengeId) {
      return new Response(JSON.stringify({ error: 'Clerk ID and challenge ID required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("carbo");

    if (action === 'join') {
      // Join challenge
      await db.collection("user_challenges").updateOne(
        { clerkId },
        {
          $addToSet: { participating: challengeId },
          $set: {
            [`progress.${challengeId}`]: 0,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      // Update challenge participant count
      await db.collection("challenges").updateOne(
        { _id: challengeId },
        { $inc: { participants: 1 } }
      );

    } else if (action === 'leave') {
      // Leave challenge
      await db.collection("user_challenges").updateOne(
        { clerkId },
        {
          $pull: { participating: challengeId },
          $unset: { [`progress.${challengeId}`]: 1 },
          $set: { lastUpdated: new Date() }
        }
      );

      // Update challenge participant count
      await db.collection("challenges").updateOne(
        { _id: challengeId },
        { $inc: { participants: -1 } }
      );

    } else if (action === 'update_progress') {
      // Update progress
      const { progress } = body;
      await db.collection("user_challenges").updateOne(
        { clerkId },
        {
          $set: {
            [`progress.${challengeId}`]: progress,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      // Check if challenge is completed
      const challenge = await db.collection("challenges").findOne({ _id: challengeId });
      if (progress >= challenge.duration) {
        await db.collection("user_challenges").updateOne(
          { clerkId },
          {
            $pull: { participating: challengeId },
            $addToSet: { completed: challengeId },
            $inc: { totalPoints: challenge.reward }
          }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Challenge action error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process challenge action' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function initializeChallenges(db) {
  const challengeDocs = challenges.map(challenge => ({
    ...challenge,
    _id: challenge.id,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await db.collection("challenges").insertMany(challengeDocs);
}

function calculateTotalPoints(userChallenges) {
  if (!userChallenges) return 0;

  let total = userChallenges.totalPoints || 0;

  // Add points from completed challenges
  if (userChallenges.completed) {
    // This would need to be calculated based on challenge rewards
    // For now, return the stored total
  }

  return total;
}
