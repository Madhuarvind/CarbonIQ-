const schedule = require('node-schedule');
const clientPromise = require('../src/dbConnect');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Job 1: Daily emissions aggregation and insights generation
const dailyEmissionsJob = schedule.scheduleJob('0 2 * * *', async function() {
  console.log('Running daily emissions aggregation job...');

  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Aggregate daily emissions
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const dailyEmissions = Object.entries(user.monthlyData || {})
        .filter(([key]) => key.includes(yesterdayStr))
        .reduce((sum, [, value]) => sum + value, 0);

      if (dailyEmissions > 0) {
        // Generate AI insights for high emitters
        if (dailyEmissions > 50) {
          await generateDailyInsights(user.clerkId, dailyEmissions);
        }

        // Update daily summary
        await db.collection("daily_summary").updateOne(
          { clerkId: user.clerkId, date: yesterdayStr },
          {
            $set: {
              totalEmissions: dailyEmissions,
              timestamp: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    console.log('Daily emissions aggregation completed');
  } catch (error) {
    console.error('Error in daily emissions job:', error);
  }
});

// Job 2: Weekly leaderboard updates
const weeklyLeaderboardJob = schedule.scheduleJob('0 3 * * 1', async function() {
  console.log('Running weekly leaderboard update job...');

  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Calculate weekly emissions for all users
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await db.collection("overall").find({}).toArray();
    const leaderboard = [];

    for (const user of users) {
      const weeklyEmissions = Object.entries(user.monthlyData || {})
        .filter(([key]) => new Date(key) >= weekAgo)
        .reduce((sum, [, value]) => sum + value, 0);

      leaderboard.push({
        clerkId: user.clerkId,
        weeklyEmissions,
        reduction: calculateWeeklyReduction(user.monthlyData)
      });
    }

    // Sort by emissions (ascending for eco-friendly leaderboard)
    leaderboard.sort((a, b) => a.weeklyEmissions - b.weeklyEmissions);

    // Update leaderboard collection
    await db.collection("leaderboard").replaceOne(
      { type: "weekly" },
      {
        type: "weekly",
        data: leaderboard.slice(0, 50), // Top 50
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log('Weekly leaderboard updated');
  } catch (error) {
    console.error('Error in weekly leaderboard job:', error);
  }
});

// Job 3: Monthly AI predictions refresh
const monthlyPredictionsJob = schedule.scheduleJob('0 4 1 * *', async function() {
  console.log('Running monthly predictions refresh job...');

  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const historicalData = Object.values(user.monthlyData || {});
      if (historicalData.length >= 3) {
        // Generate fresh predictions
        const predictions = await generatePredictions(historicalData);

        await db.collection("predictions").updateOne(
          { clerkId: user.clerkId },
          {
            $set: {
              monthlyPredictions: predictions,
              generatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    console.log('Monthly predictions refreshed');
  } catch (error) {
    console.error('Error in monthly predictions job:', error);
  }
});

// Job 4: Daily news feed updates
const newsUpdateJob = schedule.scheduleJob('0 6 * * *', async function() {
  console.log('Running daily news feed update job...');

  try {
    const RSSParser = require('rss-parser');
    const parser = new RSSParser();

    // Use the same RSS feeds as the API
    const feeds = [
      {
        name: "UN News",
        url: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
      },
      {
        name: "Guardian Environment",
        url: "https://www.theguardian.com/environment/rss",
      },
      {
        name: "WWF Climate",
        url: "https://wwf.panda.org/rss/feeds/publications/"
      },
      {
        name: "ScienceDaily Environment",
        url: "https://www.sciencedaily.com/rss/top/environment.xml",
      },
      {
        name: "UN Climate Change",
        url: "https://unfccc.int/rss.xml",
      },
      {
        name: "NASA Climate",
        url: "https://climate.nasa.gov/news/rss.xml",
      },
      {
        name: "BBC Climate / Environment",
        url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      },
      {
        name: "Yale Environment 360",
        url: "https://e360.yale.edu/feed",
      },
      {
        name: "Mongabay Environment",
        url: "https://news.mongabay.com/feed/",
      },
      {
        name: "WWF News",
        url: "https://wwf.panda.org/rss/feeds/publications/",
      },
    ];

    // Keywords to filter relevant news
    const KEYWORDS = [
      "carbon footprint",
      "eco-friendly",
      "eco friendly",
      "sustainable",
      "renewable",
      "green energy",
      "environment friendly",
      "emissions",
      "net zero",
      "recycling",
      "clean energy",
      "climate change",
      "weather conditions",
    ];

    const client = await clientPromise;
    const db = client.db("carbo");

    let allNewsItems = [];

    for (const feed of feeds) {
      try {
        console.log(`Fetching news from ${feed.name}...`);
        const feedData = await parser.parseURL(feed.url);

        const newsItems = (feedData.items || []).slice(0, 15).map(item => ({
          title: item.title || '',
          link: item.link || '',
          contentSnippet: item.contentSnippet || '',
          pubDate: item.pubDate || new Date().toISOString(),
          enclosure: { url: item.enclosure?.url || null },
          sourceName: feed.name,
          fetchedAt: new Date()
        }));

        allNewsItems.push(...newsItems);
      } catch (feedError) {
        console.error(`Error fetching feed ${feed.name}:`, feedError.message);
      }
    }

    // Filter by keywords
    const filteredItems = allNewsItems.filter((item) => {
      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();
      return KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
    });

    // Sort by date (newest first) and take top 50
    const sortedItems = filteredItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 50);

    if (sortedItems.length > 0) {
      // Clear old news and insert new ones
      await db.collection("news_cache").deleteMany({});
      await db.collection("news_cache").insertMany(sortedItems, { ordered: false });

      console.log(`News feed updated with ${sortedItems.length} items`);
    } else {
      console.log('No relevant news items found');
    }

  } catch (error) {
    console.error('Error in news update job:', error);
  }
});

// Helper functions
async function generateDailyInsights(clerkId, emissions) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a brief, personalized insight for a user who emitted ${emissions}kg CO2 yesterday. Focus on one actionable tip to reduce emissions. Keep it under 100 words.`;

    const result = await model.generateContent(prompt);
    const insight = result.response.text();

    const client = await clientPromise;
    const db = client.db("carbo");

    await db.collection("insights").insertOne({
      clerkId,
      type: "daily",
      content: insight,
      emissions,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error generating daily insights:', error);
  }
}

function calculateWeeklyReduction(monthlyData) {
  // Simple reduction calculation - compare last week to previous week
  const entries = Object.entries(monthlyData).sort(([a], [b]) => new Date(a) - new Date(b));
  if (entries.length < 14) return 0;

  const recent = entries.slice(-7).reduce((sum, [, val]) => sum + val, 0);
  const previous = entries.slice(-14, -7).reduce((sum, [, val]) => sum + val, 0);

  return previous > 0 ? ((previous - recent) / previous) * 100 : 0;
}

async function generatePredictions(historicalData) {
  // Simple prediction logic - can be enhanced with ML models
  const avg = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const trend = historicalData.length > 1 ?
    (historicalData[historicalData.length - 1] - historicalData[0]) / historicalData.length : 0;

  return Array.from({ length: 6 }, (_, i) =>
    Math.max(0, avg + (trend * (i + 1)))
  );
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down scheduled jobs...');
  schedule.gracefulShutdown().then(() => process.exit(0));
});

console.log('Scheduled jobs initialized successfully');
console.log('Jobs scheduled:');
console.log('- Daily emissions aggregation: 2:00 AM daily');
console.log('- Weekly leaderboard: 3:00 AM every Monday');
console.log('- Monthly predictions: 4:00 AM first day of month');
console.log('- News updates: 6:00 AM daily');
