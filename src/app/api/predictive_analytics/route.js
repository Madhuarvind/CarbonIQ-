export const dynamic = "force-static";

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Advanced ML Models for Carbon Prediction
class AdvancedCarbonPredictor {
  constructor() {
    this.models = {
      polynomial: this.polynomialRegression.bind(this),
      exponential: this.exponentialSmoothing.bind(this),
      arima: this.arimaForecasting.bind(this),
      neural: this.neuralNetworkPrediction.bind(this)
    };
  }

  // Polynomial Regression for complex trend analysis
  polynomialRegression(data, degree = 3) {
    if (data.length < degree + 1) return this.simpleLinearRegression(data);

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    // Create design matrix for polynomial regression
    const X = x.map(xi => {
      const row = [];
      for (let d = 0; d <= degree; d++) {
        row.push(Math.pow(xi, d));
      }
      return row;
    });

    // Calculate coefficients using normal equation
    const XT = this.transpose(X);
    const XTX = this.matrixMultiply(XT, X);
    const XTY = this.matrixMultiply(XT, [y]);

    const coefficients = this.solveLinearSystem(XTX, XTY.flat());

    return {
      coefficients,
      predict: (futureX) => {
        let prediction = 0;
        for (let d = 0; d <= degree; d++) {
          prediction += coefficients[d] * Math.pow(futureX, d);
        }
        return prediction;
      },
      rSquared: this.calculateRSquared(y, x.map(xi => {
        let pred = 0;
        for (let d = 0; d <= degree; d++) {
          pred += coefficients[d] * Math.pow(xi, d);
        }
        return pred;
      }))
    };
  }

  // Exponential Smoothing for time series
  exponentialSmoothing(data, alpha = 0.3) {
    const smoothed = [data[0]];
    for (let i = 1; i < data.length; i++) {
      smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
    }
    return smoothed;
  }

  // ARIMA-style forecasting
  arimaForecasting(data, p = 2, d = 1, q = 1) {
    // Simplified ARIMA implementation
    let series = [...data];

    // Differencing for stationarity
    if (d > 0) {
      for (let diff = 0; diff < d; diff++) {
        const differenced = [];
        for (let i = 1; i < series.length; i++) {
          differenced.push(series[i] - series[i - 1]);
        }
        series = differenced;
      }
    }

    // Simple ARMA prediction
    const predictions = [];
    for (let i = p; i < series.length; i++) {
      let prediction = 0;
      // AR component
      for (let j = 1; j <= p; j++) {
        prediction += series[i - j] * (1 / p);
      }
      predictions.push(prediction);
    }

    return predictions;
  }

  // Neural Network style prediction (simplified)
  neuralNetworkPrediction(data) {
    // Simple feedforward neural network simulation
    const weights = data.map((_, i) => Math.sin(i * 0.1) * 0.5 + 0.5);
    const predictions = [];

    for (let i = 3; i < data.length; i++) {
      const input = [data[i-3], data[i-2], data[i-1]];
      let prediction = 0;

      for (let j = 0; j < input.length; j++) {
        prediction += input[j] * weights[j];
      }

      // Activation function (sigmoid)
      prediction = 1 / (1 + Math.exp(-prediction));
      predictions.push(prediction * data[data.length - 1]); // Scale to data range
    }

    return predictions;
  }

  // Anomaly Detection using statistical methods
  detectAnomalies(data, threshold = 2) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    const anomalies = [];
    data.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / std);
      if (zScore > threshold) {
        anomalies.push({
          index,
          value,
          zScore: Math.round(zScore * 100) / 100,
          deviation: value > mean ? 'high' : 'low'
        });
      }
    });

    return {
      anomalies,
      anomalyCount: anomalies.length,
      anomalyPercentage: Math.round((anomalies.length / data.length) * 100),
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100
    };
  }

  // Ensemble prediction combining multiple models
  ensemblePrediction(data, months = 6) {
    const models = ['polynomial', 'exponential', 'arima'];
    const predictions = {};

    models.forEach(modelName => {
      try {
        const model = this.models[modelName];
        const result = model(data);

        if (modelName === 'polynomial') {
          predictions[modelName] = Array.from({ length: months }, (_, i) =>
            result.predict(data.length + i)
          );
        } else if (modelName === 'exponential') {
          // Extend exponential smoothing for future predictions
          const extended = [...result];
          for (let i = 0; i < months; i++) {
            const next = alpha * extended[extended.length - 1] + (1 - alpha) * extended[extended.length - 2];
            extended.push(next);
          }
          predictions[modelName] = extended.slice(-months);
        } else {
          predictions[modelName] = result.slice(-months);
        }
      } catch (error) {
        console.error(`Error in ${modelName} model:`, error);
        predictions[modelName] = Array(months).fill(data[data.length - 1] || 1000);
      }
    });

    // Ensemble: weighted average of predictions
    const ensemblePredictions = [];
    for (let i = 0; i < months; i++) {
      const values = models.map(model => predictions[model][i]).filter(val => !isNaN(val));
      const ensemble = values.length > 0 ?
        values.reduce((sum, val) => sum + val, 0) / values.length : 1000;
      ensemblePredictions.push(Math.round(ensemble));
    }

    return {
      individualPredictions: predictions,
      ensemblePredictions,
      confidence: this.calculateEnsembleConfidence(predictions),
      bestModel: this.selectBestModel(predictions, data)
    };
  }

  // Helper methods
  simpleLinearRegression(data) {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  matrixMultiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  solveLinearSystem(A, b) {
    // Simple Gaussian elimination for small matrices
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const factor = augmented[j][i] / augmented[i][i];
        for (let k = i; k <= n; k++) {
          augmented[j][k] -= factor * augmented[i][k];
        }
      }
    }

    // Back substitution
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }

    return x;
  }

  calculateRSquared(actual, predicted) {
    const mean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return 1 - (ssRes / ssTot);
  }

  calculateEnsembleConfidence(predictions) {
    const models = Object.keys(predictions);
    const variances = [];

    for (let i = 0; i < 6; i++) { // First 6 months
      const values = models.map(model => predictions[model][i]).filter(val => !isNaN(val));
      if (values.length > 1) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        variances.push(variance);
      }
    }

    const avgVariance = variances.reduce((sum, val) => sum + val, 0) / variances.length;
    const confidence = Math.max(0, Math.min(100, 100 - (avgVariance / 10000) * 100));

    return Math.round(confidence);
  }

  selectBestModel(predictions, historicalData) {
    const models = Object.keys(predictions);
    let bestModel = 'ensemble';
    let bestScore = -Infinity;

    models.forEach(model => {
      const predValues = predictions[model].slice(0, Math.min(6, predictions[model].length));
      const actualValues = historicalData.slice(-predValues.length);

      if (predValues.length === actualValues.length) {
        const r2 = this.calculateRSquared(actualValues, predValues);
        if (r2 > bestScore) {
          bestScore = r2;
          bestModel = model;
        }
      }
    });

    return { model: bestModel, score: Math.round(bestScore * 100) / 100 };
  }
}

// Initialize advanced predictor
const advancedPredictor = new AdvancedCarbonPredictor();

export async function POST(request) {
	try {
		const { clerkId, historicalData, currentEmissions } = await request.json();

		// Calculate trend analysis
		const trendAnalysis = calculateTrend(historicalData);

		// Analyze seasonal patterns
		const seasonalPatterns = analyzeSeasonalPatterns(historicalData);

		// Generate AI predictions
		const predictions = await generateAIPredictions(historicalData, currentEmissions, trendAnalysis);

		// Generate personalized goals
		const personalizedGoals = await generatePersonalizedGoals(currentEmissions, trendAnalysis, seasonalPatterns);

		// Generate deep insights
		const insights = await generateInsights(historicalData, currentEmissions, trendAnalysis);

		return Response.json({
			trendAnalysis,
			seasonalPatterns,
			predictions,
			personalizedGoals,
			insights,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Predictive analytics error:', error);
		return Response.json(
			{ error: 'Failed to generate predictive analytics' },
			{ status: 500 }
		);
	}
}

function calculateTrend(historicalData) {
	if (!historicalData || historicalData.length < 2) {
		return {
			trend: 'insufficient_data',
			slope: 0,
			rSquared: 0,
			confidence: 'low'
		};
	}

	// Simple linear regression for trend analysis
	const n = historicalData.length;
	const sumX = historicalData.reduce((sum, _, i) => sum + i, 0);
	const sumY = historicalData.reduce((sum, val) => sum + val, 0);
	const sumXY = historicalData.reduce((sum, val, i) => sum + val * i, 0);
	const sumXX = historicalData.reduce((sum, _, i) => sum + i * i, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	// Calculate R-squared
	const yMean = sumY / n;
	const ssRes = historicalData.reduce((sum, val, i) => {
		const predicted = slope * i + intercept;
		return sum + Math.pow(val - predicted, 2);
	}, 0);
	const ssTot = historicalData.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
	const rSquared = 1 - (ssRes / ssTot);

	// Determine trend direction and confidence
	let trend, confidence;
	if (Math.abs(slope) < 0.1) {
		trend = 'stable';
		confidence = rSquared > 0.7 ? 'high' : 'medium';
	} else if (slope > 0) {
		trend = 'increasing';
		confidence = rSquared > 0.8 ? 'high' : rSquared > 0.6 ? 'medium' : 'low';
	} else {
		trend = 'decreasing';
		confidence = rSquared > 0.8 ? 'high' : rSquared > 0.6 ? 'medium' : 'low';
	}

	return {
		trend,
		slope: Math.round(slope * 100) / 100,
		rSquared: Math.round(rSquared * 100) / 100,
		confidence,
		monthlyChange: Math.round(slope * 30 * 100) / 100 // Approximate monthly change
	};
}

function analyzeSeasonalPatterns(historicalData) {
	if (!historicalData || historicalData.length < 12) {
		return { hasSeasonalPattern: false, peakMonth: null, lowMonth: null };
	}

	// Simple seasonal analysis - find highest and lowest months
	const monthlyAverages = {};
	for (let i = 0; i < historicalData.length; i++) {
		const month = i % 12;
		if (!monthlyAverages[month]) monthlyAverages[month] = [];
		monthlyAverages[month].push(historicalData[i]);
	}

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const averages = Object.entries(monthlyAverages).map(([month, values]) => ({
		month: parseInt(month),
		average: values.reduce((sum, val) => sum + val, 0) / values.length,
		name: monthNames[parseInt(month)]
	}));

	const sorted = averages.sort((a, b) => b.average - a.average);
	const peakMonth = sorted[0];
	const lowMonth = sorted[sorted.length - 1];

	const seasonalVariation = ((peakMonth.average - lowMonth.average) / lowMonth.average) * 100;

	return {
		hasSeasonalPattern: seasonalVariation > 15, // 15% variation threshold
		peakMonth: peakMonth.name,
		lowMonth: lowMonth.name,
		seasonalVariation: Math.round(seasonalVariation),
		monthlyBreakdown: averages
	};
}

async function generateAIPredictions(historicalData, currentEmissions, trendAnalysis) {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const prompt = `
		Based on the following carbon emission data, predict future emissions for the next 6 months.
		Current monthly emissions: ${currentEmissions} kg CO2
		Trend analysis: ${trendAnalysis.trend} (slope: ${trendAnalysis.slope}, confidence: ${trendAnalysis.confidence})
		Historical data (last ${historicalData?.length || 0} months): ${historicalData?.join(', ') || 'insufficient data'}

		Provide predictions in JSON format with:
		- next6Months: array of predicted emissions for each month
		- confidenceIntervals: high/low ranges for each prediction
		- keyFactors: main drivers affecting the predictions
		- riskLevel: "low", "medium", or "high" uncertainty

		Consider seasonal patterns, lifestyle changes, and external factors like weather or economic conditions.
		`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		// Extract JSON from response
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}

		// Fallback prediction logic
		return generateFallbackPredictions(historicalData, currentEmissions, trendAnalysis);

	} catch (error) {
		console.error('AI prediction error:', error);
		return generateFallbackPredictions(historicalData, currentEmissions, trendAnalysis);
	}
}

function generateFallbackPredictions(historicalData, currentEmissions, trendAnalysis) {
	const predictions = [];
	const baseEmission = currentEmissions || 1000;

	for (let i = 1; i <= 6; i++) {
		// Apply trend with some randomness
		const trendAdjustment = trendAnalysis.slope * i;
		const randomFactor = (Math.random() - 0.5) * 0.2; // ±10% randomness
		const seasonalFactor = Math.sin((i / 12) * 2 * Math.PI) * 0.1; // Seasonal variation

		const predicted = baseEmission + trendAdjustment + (baseEmission * randomFactor) + (baseEmission * seasonalFactor);
		predictions.push(Math.max(0, Math.round(predicted)));
	}

	return {
		next6Months: predictions,
		confidenceIntervals: predictions.map(p => ({
			low: Math.round(p * 0.8),
			high: Math.round(p * 1.2)
		})),
		keyFactors: ['Historical trends', 'Seasonal patterns', 'Random lifestyle variations'],
		riskLevel: trendAnalysis.confidence === 'high' ? 'low' : 'medium'
	};
}

async function generatePersonalizedGoals(currentEmissions, trendAnalysis, seasonalPatterns) {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const prompt = `
		Create personalized carbon reduction goals for a user with:
		Current monthly emissions: ${currentEmissions} kg CO2
		Trend: ${trendAnalysis.trend} (${trendAnalysis.confidence} confidence)
		Seasonal pattern: ${seasonalPatterns.hasSeasonalPattern ? `Peak in ${seasonalPatterns.peakMonth}, low in ${seasonalPatterns.lowMonth}` : 'No significant pattern'}

		Generate 3-5 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) with:
		- shortTerm: 1-3 month goals
		- mediumTerm: 3-6 month goals
		- longTerm: 6-12 month goals

		Each goal should include:
		- title: concise goal name
		- description: detailed explanation
		- targetReduction: percentage or kg CO2 reduction
		- timeframe: specific time period
		- difficulty: "easy", "medium", "hard"
		- impact: expected environmental benefit

		Return in JSON format.
		`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}

		// Fallback goals
		return generateFallbackGoals(currentEmissions);

	} catch (error) {
		console.error('AI goals generation error:', error);
		return generateFallbackGoals(currentEmissions);
	}
}

function generateFallbackGoals(currentEmissions) {
	const baseReduction = Math.min(currentEmissions * 0.1, 200); // 10% or 200kg max

	return {
		shortTerm: [
			{
				title: "Reduce transportation emissions",
				description: "Walk or cycle for short trips and combine errands",
				targetReduction: `${Math.round(baseReduction * 0.3)} kg CO2`,
				timeframe: "1 month",
				difficulty: "easy",
				impact: "Immediate reduction in daily emissions"
			}
		],
		mediumTerm: [
			{
				title: "Optimize energy usage",
				description: "Implement energy-saving habits and LED lighting",
				targetReduction: `${Math.round(baseReduction * 0.5)} kg CO2`,
				timeframe: "3 months",
				difficulty: "medium",
				impact: "Significant monthly savings on energy bills"
			}
		],
		longTerm: [
			{
				title: "Sustainable lifestyle transformation",
				description: "Adopt comprehensive eco-friendly practices across all categories",
				targetReduction: `${Math.round(baseReduction * 2)} kg CO2`,
				timeframe: "6 months",
				difficulty: "hard",
				impact: "Major contribution to climate change mitigation"
			}
		]
	};
}

async function generateInsights(historicalData, currentEmissions, trendAnalysis) {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const prompt = `
		Analyze carbon emission patterns and provide deep behavioral insights:
		Current emissions: ${currentEmissions} kg CO2/month
		Trend: ${trendAnalysis.trend} (confidence: ${trendAnalysis.confidence})
		Historical data: ${historicalData?.slice(-6)?.join(', ') || 'limited data'} (last 6 months)

		Provide insights in JSON format with:
		- behavioralPatterns: array of 3-4 key patterns observed
		- riskFactors: potential factors increasing emissions
		- opportunities: specific areas for improvement
		- recommendations: actionable advice (2-3 items)
		- motivation: encouraging message based on progress

		Focus on actionable insights that help the user understand their carbon footprint better.
		`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}

		// Fallback insights
		return generateFallbackInsights(trendAnalysis);

	} catch (error) {
		console.error('AI insights error:', error);
		return generateFallbackInsights(trendAnalysis);
	}
}

function generateFallbackInsights(trendAnalysis) {
	return {
		behavioralPatterns: [
			"Consistent emission tracking shows commitment to environmental awareness",
			`${trendAnalysis.trend} trend indicates ${trendAnalysis.trend === 'decreasing' ? 'positive progress' : 'areas for improvement'}`,
			"Regular monitoring enables data-driven decision making"
		],
		riskFactors: [
			"Seasonal changes may affect emission patterns",
			"Lifestyle changes could impact long-term trends"
		],
		opportunities: [
			"Focus on high-impact categories for maximum reduction",
			"Implement small daily changes for cumulative benefits"
		],
		recommendations: [
			"Set specific, measurable reduction goals",
			"Track progress weekly to maintain motivation",
			"Share achievements with community for accountability"
		],
		motivation: "Every small action contributes to a larger positive impact. Your consistent tracking already demonstrates environmental consciousness!"
	};
}
