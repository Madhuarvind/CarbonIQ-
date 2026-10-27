const clientPromise = require('../src/dbConnect');
const nodemailer = require('nodemailer');

// Email configuration (you'll need to set these in environment variables)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const transporter = nodemailer.createTransporter(emailConfig);

async function sendNotifications() {
  console.log('Starting notification delivery...');

  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    const now = new Date();

    // 1. Daily carbon milestone notifications
    await sendDailyMilestoneNotifications(db, now);

    // 2. Weekly progress reports
    if (now.getDay() === 1) { // Monday
      await sendWeeklyProgressReports(db, now);
    }

    // 3. Monthly achievement notifications
    if (now.getDate() === 1) { // First day of month
      await sendMonthlyAchievements(db, now);
    }

    // 4. Streak maintenance notifications
    await sendStreakReminders(db, now);

    // 5. Community challenge updates
    await sendChallengeUpdates(db, now);

    console.log('Notification delivery completed');

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

async function sendDailyMilestoneNotifications(db, now) {
  console.log('Sending daily milestone notifications...');

  try {
    // Get users who logged emissions yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const yesterdayEmissions = Object.entries(user.monthlyData || {})
        .filter(([key]) => key.startsWith(yesterday.toISOString().split('T')[0]))
        .reduce((sum, [, value]) => sum + value, 0);

      if (yesterdayEmissions > 0) {
        const milestone = getCarbonMilestone(yesterdayEmissions);

        if (milestone) {
          await sendEmail({
            to: user.email || `${user.clerkId}@placeholder.com`, // You'll need to store user emails
            subject: `🎯 Carbon Milestone Achieved!`,
            html: generateMilestoneEmail(user, yesterdayEmissions, milestone)
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending daily milestones:', error);
  }
}

async function sendWeeklyProgressReports(db, now) {
  console.log('Sending weekly progress reports...');

  try {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const weeklyEmissions = Object.entries(user.monthlyData || {})
        .filter(([key]) => new Date(key) >= weekAgo)
        .reduce((sum, [, value]) => sum + value, 0);

      if (weeklyEmissions > 0) {
        const insights = await db.collection("insights")
          .find({ clerkId: user.clerkId, createdAt: { $gte: weekAgo } })
          .toArray();

        await sendEmail({
          to: user.email || `${user.clerkId}@placeholder.com`,
          subject: `📊 Your Weekly Carbon Report`,
          html: generateWeeklyReportEmail(user, weeklyEmissions, insights)
        });
      }
    }
  } catch (error) {
    console.error('Error sending weekly reports:', error);
  }
}

async function sendMonthlyAchievements(db, now) {
  console.log('Sending monthly achievement notifications...');

  try {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const monthlyEmissions = Object.entries(user.monthlyData || {})
        .filter(([key]) => new Date(key) >= monthAgo)
        .reduce((sum, [, value]) => sum + value, 0);

      const achievements = getMonthlyAchievements(monthlyEmissions);

      if (achievements.length > 0) {
        await sendEmail({
          to: user.email || `${user.clerkId}@placeholder.com`,
          subject: `🏆 Monthly Carbon Achievements Unlocked!`,
          html: generateAchievementEmail(user, achievements)
        });
      }
    }
  } catch (error) {
    console.error('Error sending monthly achievements:', error);
  }
}

async function sendStreakReminders(db, now) {
  console.log('Sending streak maintenance reminders...');

  try {
    // Find users who haven't logged emissions in 3+ days
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const users = await db.collection("overall").find({}).toArray();

    for (const user of users) {
      const recentEntries = Object.keys(user.monthlyData || {})
        .filter(key => new Date(key) >= threeDaysAgo);

      if (recentEntries.length === 0) {
        // User hasn't logged in 3+ days
        const streak = await calculateCurrentStreak(db, user.clerkId);

        if (streak > 0) {
          await sendEmail({
            to: user.email || `${user.clerkId}@placeholder.com`,
            subject: `🔥 Don't Break Your Carbon Tracking Streak!`,
            html: generateStreakReminderEmail(user, streak)
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending streak reminders:', error);
  }
}

async function sendChallengeUpdates(db, now) {
  console.log('Sending community challenge updates...');

  try {
    // This would be expanded based on your challenge system
    const activeChallenges = await db.collection("challenges")
      .find({ status: "active", endDate: { $gt: now } })
      .toArray();

    for (const challenge of activeChallenges) {
      const participants = await db.collection("challenge_participants")
        .find({ challengeId: challenge._id })
        .toArray();

      for (const participant of participants) {
        const progress = await calculateChallengeProgress(db, challenge, participant.clerkId);

        if (progress.needsUpdate) {
          await sendEmail({
            to: participant.email || `${participant.clerkId}@placeholder.com`,
            subject: `📈 ${challenge.title} - Progress Update`,
            html: generateChallengeUpdateEmail(participant, challenge, progress)
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending challenge updates:', error);
  }
}

// Helper functions
function getCarbonMilestone(emissions) {
  if (emissions <= 5) return { level: 'Excellent', message: 'Outstanding low-emission day!' };
  if (emissions <= 15) return { level: 'Good', message: 'Great job keeping emissions low!' };
  if (emissions <= 30) return { level: 'Average', message: 'Good progress on your carbon goals!' };
  return null;
}

function getMonthlyAchievements(emissions) {
  const achievements = [];
  if (emissions < 100) achievements.push('Low Carbon Champion');
  if (emissions < 50) achievements.push('Carbon Warrior');
  if (emissions < 25) achievements.push('Eco Hero');
  return achievements;
}

async function calculateCurrentStreak(db, clerkId) {
  // Simplified streak calculation
  const user = await db.collection("overall").findOne({ clerkId });
  if (!user?.monthlyData) return 0;

  const entries = Object.keys(user.monthlyData)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < entries.length; i++) {
    const entryDate = entries[i];
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (entryDate === expectedDate.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function calculateChallengeProgress(db, challenge, clerkId) {
  // Placeholder for challenge progress calculation
  return { needsUpdate: false, progress: 0 };
}

async function sendEmail(options) {
  try {
    if (!process.env.SMTP_USER) {
      console.log('SMTP not configured, skipping email send');
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@carbo-tracker.com',
      ...options
    });

    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Email template functions
function generateMilestoneEmail(user, emissions, milestone) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎯 Carbon Milestone Achieved!</h2>
      <p>Hi ${user.firstName || 'there'}!</p>
      <p>You've reached a <strong>${milestone.level}</strong> carbon milestone with ${emissions}kg CO₂ emissions yesterday!</p>
      <p>${milestone.message}</p>
      <p>Keep up the great work reducing your carbon footprint!</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
    </div>
  `;
}

function generateWeeklyReportEmail(user, emissions, insights) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📊 Your Weekly Carbon Report</h2>
      <p>Hi ${user.firstName || 'there'}!</p>
      <p>This week you emitted <strong>${emissions}kg CO₂</strong>.</p>
      ${insights.length > 0 ? '<h3>AI Insights:</h3><ul>' + insights.map(i => `<li>${i.content}</li>`).join('') + '</ul>' : ''}
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a>
    </div>
  `;
}

function generateAchievementEmail(user, achievements) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🏆 New Achievements Unlocked!</h2>
      <p>Congratulations ${user.firstName || 'there'}!</p>
      <p>You've earned these achievements this month:</p>
      <ul>${achievements.map(a => `<li>🏅 ${a}</li>`).join('')}</ul>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Achievements</a>
    </div>
  `;
}

function generateStreakReminderEmail(user, streak) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🔥 Don't Break Your Streak!</h2>
      <p>Hi ${user.firstName || 'there'}!</p>
      <p>You have a <strong>${streak}-day tracking streak</strong> going! Don't let it end - log your emissions today.</p>
      <a href="${process.env.FRONTEND_URL}/calculator" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log Emissions</a>
    </div>
  `;
}

function generateChallengeUpdateEmail(participant, challenge, progress) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📈 Challenge Progress Update</h2>
      <p>Hi ${participant.firstName || 'there'}!</p>
      <p>Here's your progress in "${challenge.title}":</p>
      <p>Current Progress: ${progress.progress}%</p>
      <a href="${process.env.FRONTEND_URL}/challenges" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Challenge</a>
    </div>
  `;
}

// Run notifications if called directly
if (require.main === module) {
  sendNotifications().then(() => process.exit(0));
}

module.exports = { sendNotifications };
