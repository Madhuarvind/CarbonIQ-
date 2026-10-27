const clientPromise = require('../src/dbConnect');
const fetch = require('node-fetch');

async function performHealthCheck() {
  console.log('🔍 Starting comprehensive health check...');

  const results = {
    timestamp: new Date(),
    services: {},
    metrics: {},
    alerts: []
  };

  try {
    // 1. Database Health Check
    console.log('📊 Checking database connectivity...');
    results.services.database = await checkDatabaseHealth();

    // 2. API Endpoints Health Check
    console.log('🌐 Checking API endpoints...');
    results.services.api = await checkAPIHealth();

    // 3. External Services Health Check
    console.log('🔗 Checking external services...');
    results.services.external = await checkExternalServicesHealth();

    // 4. Performance Metrics
    console.log('⚡ Gathering performance metrics...');
    results.metrics = await gatherPerformanceMetrics();

    // 5. Security Checks
    console.log('🔒 Performing security checks...');
    results.security = await performSecurityChecks();

    // 6. Generate Alerts
    results.alerts = generateAlerts(results);

    // 7. Store Results
    await storeHealthCheckResults(results);

    // 8. Send Alerts if Critical
    if (results.alerts.some(alert => alert.severity === 'critical')) {
      await sendCriticalAlerts(results.alerts);
    }

    console.log('✅ Health check completed');
    console.log('📋 Summary:', {
      database: results.services.database.status,
      api: results.services.api.status,
      external: results.services.external.status,
      alerts: results.alerts.length
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    results.error = error.message;
  }

  return results;
}

async function checkDatabaseHealth() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Test basic connectivity
    const pingResult = await client.db("admin").command({ ping: 1 });

    // Check collection counts
    const collections = ['overall', 'rides', 'bookings', 'news_cache'];
    const collectionStats = {};

    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      collectionStats[collectionName] = count;
    }

    // Check recent activity
    const recentActivity = await db.collection("overall")
      .find({})
      .sort({ updatedAt: -1 })
      .limit(1)
      .toArray();

    return {
      status: 'healthy',
      ping: pingResult.ok === 1,
      collections: collectionStats,
      lastActivity: recentActivity[0]?.updatedAt || null
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkAPIHealth() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const endpoints = [
    '/api/emissions',
    '/api/news',
    '/api/leaderboard',
    '/api/predictive_analytics'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        timeout: 10000 // 10 second timeout
      });

      results[endpoint] = {
        status: response.ok ? 'healthy' : 'degraded',
        statusCode: response.status,
        responseTime: Date.now() // Simplified - would need proper timing
      };

    } catch (error) {
      results[endpoint] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  const healthyCount = Object.values(results).filter(r => r.status === 'healthy').length;
  const overallStatus = healthyCount === endpoints.length ? 'healthy' :
                       healthyCount >= endpoints.length * 0.7 ? 'degraded' : 'unhealthy';

  return {
    status: overallStatus,
    endpoints: results,
    healthyPercentage: (healthyCount / endpoints.length) * 100
  };
}

async function checkExternalServicesHealth() {
  const services = {
    'Google AI': 'https://generativelanguage.googleapis.com',
    'Clerk Auth': 'https://api.clerk.com',
    'MongoDB Atlas': process.env.MONGODB_URI ? 'mongodb+srv://test' : null
  };

  const results = {};

  for (const [name, url] of Object.entries(services)) {
    if (!url) {
      results[name] = { status: 'not_configured' };
      continue;
    }

    try {
      if (name === 'MongoDB Atlas') {
        // Special handling for MongoDB
        const client = await clientPromise;
        await client.db("admin").command({ ping: 1 });
        results[name] = { status: 'healthy' };
      } else {
        const response = await fetch(url, { timeout: 5000 });
        results[name] = {
          status: response.ok ? 'healthy' : 'degraded',
          statusCode: response.status
        };
      }
    } catch (error) {
      results[name] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  const healthyCount = Object.values(results).filter(r => r.status === 'healthy').length;
  const overallStatus = healthyCount === Object.keys(services).length ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    services: results
  };
}

async function gatherPerformanceMetrics() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // User activity metrics
    const totalUsers = await db.collection("overall").countDocuments();
    const activeUsers = await db.collection("overall").countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Emissions metrics
    const recentEmissions = await db.collection("overall")
      .aggregate([
        { $unwind: "$monthlyData" },
        {
          $group: {
            _id: null,
            total: { $sum: "$monthlyData" }
          }
        }
      ])
      .toArray();

    // System performance
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    };

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        activityRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
      },
      emissions: {
        totalTracked: recentEmissions[0]?.total || 0
      },
      system: systemMetrics
    };

  } catch (error) {
    return { error: error.message };
  }
}

async function performSecurityChecks() {
  const checks = {
    environmentVariables: checkEnvironmentVariables(),
    databaseSecurity: await checkDatabaseSecurity(),
    apiSecurity: checkAPISecurity()
  };

  return checks;
}

function checkEnvironmentVariables() {
  const required = ['MONGODB_URI', 'CLERK_SECRET_KEY', 'GOOGLE_AI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  return {
    status: missing.length === 0 ? 'secure' : 'warning',
    missing: missing
  };
}

async function checkDatabaseSecurity() {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    // Check if sensitive data is exposed
    const usersWithSensitiveData = await db.collection("overall")
      .find({ $or: [{ password: { $exists: true } }, { apiKey: { $exists: true } }] })
      .limit(1)
      .toArray();

    return {
      status: usersWithSensitiveData.length === 0 ? 'secure' : 'critical',
      sensitiveDataFound: usersWithSensitiveData.length > 0
    };

  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function checkAPISecurity() {
  // Check for common security headers and configurations
  const issues = [];

  if (!process.env.CORS_ORIGIN) {
    issues.push('CORS_ORIGIN not configured');
  }

  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET not configured');
  }

  return {
    status: issues.length === 0 ? 'secure' : 'warning',
    issues: issues
  };
}

function generateAlerts(results) {
  const alerts = [];

  // Database alerts
  if (results.services.database.status === 'unhealthy') {
    alerts.push({
      type: 'database',
      severity: 'critical',
      message: 'Database connection failed',
      details: results.services.database.error
    });
  }

  // API alerts
  if (results.services.api.status === 'unhealthy') {
    alerts.push({
      type: 'api',
      severity: 'critical',
      message: 'Multiple API endpoints are down',
      details: `Only ${results.services.api.healthyPercentage}% of endpoints are healthy`
    });
  } else if (results.services.api.status === 'degraded') {
    alerts.push({
      type: 'api',
      severity: 'warning',
      message: 'Some API endpoints are degraded',
      details: `${results.services.api.healthyPercentage}% of endpoints are healthy`
    });
  }

  // Performance alerts
  if (results.metrics.users?.activityRate < 10) {
    alerts.push({
      type: 'engagement',
      severity: 'warning',
      message: 'Low user activity detected',
      details: `Only ${results.metrics.users.activityRate}% of users are active`
    });
  }

  // Security alerts
  if (results.security?.databaseSecurity?.status === 'critical') {
    alerts.push({
      type: 'security',
      severity: 'critical',
      message: 'Sensitive data found in database',
      details: 'Database contains exposed sensitive information'
    });
  }

  return alerts;
}

async function storeHealthCheckResults(results) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");

    await db.collection("health_checks").insertOne(results);
    console.log('Health check results stored in database');
  } catch (error) {
    console.error('Failed to store health check results:', error);
  }
}

async function sendCriticalAlerts(alerts) {
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  if (criticalAlerts.length === 0) return;

  // Send email alert (requires email configuration)
  if (process.env.SMTP_USER) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'alerts@carbo-tracker.com',
        to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: '🚨 CRITICAL: Carbo-Tracker Health Check Failed',
        html: `
          <h2>Critical System Alerts</h2>
          <ul>
            ${criticalAlerts.map(alert => `<li><strong>${alert.type}:</strong> ${alert.message}</li>`).join('')}
          </ul>
          <p>Please check the system immediately.</p>
        `
      });

      console.log('Critical alerts sent via email');
    } catch (error) {
      console.error('Failed to send critical alerts:', error);
    }
  }
}

// Run health check if called directly
if (require.main === module) {
  performHealthCheck()
    .then((results) => {
      console.log('Health check completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = { performHealthCheck };
