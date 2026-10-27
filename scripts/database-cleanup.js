const clientPromise = require('../src/dbConnect');

async function cleanupDatabase() {
  console.log('Starting database cleanup...');

  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const now = new Date();

    // 1. Clean old news cache (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newsDeleted = await db.collection("news_cache").deleteMany({
      fetchedAt: { $lt: thirtyDaysAgo }
    });
    console.log(`Cleaned ${newsDeleted.deletedCount} old news items`);

    // 2. Clean old insights (keep last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const insightsDeleted = await db.collection("insights").deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });
    console.log(`Cleaned ${insightsDeleted.deletedCount} old insights`);

    // 3. Clean old predictions (keep last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const predictionsDeleted = await db.collection("predictions").deleteMany({
      generatedAt: { $lt: sixMonthsAgo }
    });
    console.log(`Cleaned ${predictionsDeleted.deletedCount} old predictions`);

    // 4. Clean old daily summaries (keep last 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const summariesDeleted = await db.collection("daily_summary").deleteMany({
      timestamp: { $lt: oneYearAgo }
    });
    console.log(`Cleaned ${summariesDeleted.deletedCount} old daily summaries`);

    // 5. Archive old leaderboard data (keep last 6 months)
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    const leaderboardArchived = await db.collection("leaderboard").updateMany(
      { updatedAt: { $lt: sixMonthsAgo } },
      { $set: { archived: true } }
    );
    console.log(`Archived ${leaderboardArchived.modifiedCount} old leaderboard entries`);

    // 6. Clean up orphaned data
    // Remove bookings for non-existent rides
    const existingRideIds = await db.collection("rides").distinct("_id");
    const bookingsDeleted = await db.collection("bookings").deleteMany({
      rideId: { $nin: existingRideIds }
    });
    console.log(`Cleaned ${bookingsDeleted.deletedCount} orphaned bookings`);

    // 7. Optimize indexes (rebuild if needed)
    console.log('Checking database indexes...');
    const collections = ['overall', 'rides', 'bookings', 'news_cache', 'insights'];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        // Ensure essential indexes exist
        if (collectionName === 'overall' && !indexes.some(idx => idx.name === 'clerkId_1')) {
          await collection.createIndex({ clerkId: 1 });
          console.log(`Created index on ${collectionName}.clerkId`);
        }

        if (collectionName === 'bookings' && !indexes.some(idx => idx.name === 'passengerClerkId_1')) {
          await collection.createIndex({ passengerClerkId: 1 });
          console.log(`Created index on ${collectionName}.passengerClerkId`);
        }
      } catch (error) {
        console.error(`Error checking indexes for ${collectionName}:`, error.message);
      }
    }

    // 8. Generate cleanup report
    const report = {
      timestamp: now,
      newsDeleted: newsDeleted.deletedCount,
      insightsDeleted: insightsDeleted.deletedCount,
      predictionsDeleted: predictionsDeleted.deletedCount,
      summariesDeleted: summariesDeleted.deletedCount,
      leaderboardArchived: leaderboardArchived.modifiedCount,
      bookingsDeleted: bookingsDeleted.deletedCount
    };

    await db.collection("cleanup_reports").insertOne(report);
    console.log('Cleanup report generated and stored');

    console.log('Database cleanup completed successfully');

  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDatabase();
}

module.exports = { cleanupDatabase };
