
'use client';

import React, { useState, useEffect } from 'react';
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine
} from 'recharts';
import { useUser } from '@clerk/nextjs';
import {
	TrendingUp,
	TrendingDown,
	Minus,
	Target,
	Lightbulb,
	AlertTriangle,
	CheckCircle,
	Clock
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '../../components/ui/card';

const PredictiveChart = ({ refresh }) => {
	const { user } = useUser();
	const [predictiveData, setPredictiveData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchPredictiveData();
	}, [user?.id, refresh]);

	const fetchPredictiveData = async () => {
		if (!user?.id) return;

		try {
			setLoading(true);
			setError(null);

			// First, get user's historical data
			const historyResponse = await fetch(`/api/emissions?clerkId=${user.id}`);
			const historyData = await historyResponse.json();

			// Extract monthly data for the last 6 months
			const monthlyData = historyData?.monthlyData || {};
			const historicalEmissions = Object.values(monthlyData).slice(-6);

			// Get current emissions (from latest calculation)
			const currentEmissions = historicalEmissions[historicalEmissions.length - 1] || 1000;

			// Get predictive analytics
			const predictiveResponse = await fetch('/api/predictive_analytics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					clerkId: user.id,
					historicalData: historicalEmissions,
					currentEmissions
				})
			});

			if (!predictiveResponse.ok) {
				throw new Error('Failed to fetch predictive data');
			}

			const data = await predictiveResponse.json();
			setPredictiveData(data);

		} catch (err) {
			console.error('Error fetching predictive data:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const prepareChartData = () => {
		if (!predictiveData) return [];

		const historicalData = predictiveData.historicalData || [];
		const predictions = predictiveData.predictions?.next6Months || [];

		const chartData = [];

		// Add historical data points
		historicalData.forEach((emission, index) => {
			const monthIndex = historicalData.length - index - 1;
			const date = new Date();
			date.setMonth(date.getMonth() - monthIndex);

			chartData.push({
				month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
				emissions: emission,
				type: 'historical',
				actual: emission
			});
		});

		// Add current month
		const currentDate = new Date();
		chartData.push({
			month: currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
			emissions: predictiveData.currentEmissions || 1000,
			type: 'current',
			actual: predictiveData.currentEmissions || 1000
		});

		// Add prediction points
		predictions.forEach((emission, index) => {
			const date = new Date();
			date.setMonth(date.getMonth() + index + 1);

			chartData.push({
				month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
				emissions: emission,
				type: 'predicted',
				predicted: emission,
				confidenceLow: predictiveData.predictions?.confidenceIntervals?.[index]?.low,
				confidenceHigh: predictiveData.predictions?.confidenceIntervals?.[index]?.high
			});
		});

		return chartData;
	};

	const getTrendIcon = (trend) => {
		switch (trend) {
			case 'increasing':
				return <TrendingUp className="w-5 h-5 text-red-500" />;
			case 'decreasing':
				return <TrendingDown className="w-5 h-5 text-green-500" />;
			default:
				return <Minus className="w-5 h-5 text-gray-500" />;
		}
	};

	const getTrendColor = (trend) => {
		switch (trend) {
			case 'increasing':
				return 'text-red-500';
			case 'decreasing':
				return 'text-green-500';
			default:
				return 'text-gray-500';
		}
	};

	const getConfidenceColor = (confidence) => {
		switch (confidence) {
			case 'high':
				return 'text-green-500';
			case 'medium':
				return 'text-yellow-500';
			default:
				return 'text-red-500';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-500">Failed to load predictive analytics</p>
					<p className="text-gray-400 text-sm mt-2">{error}</p>
				</div>
			</div>
		);
	}

	const chartData = prepareChartData();

	return (
		<div className="space-y-6">
			{/* Trend Analysis Cards */}
			{predictiveData?.trendAnalysis && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="bg-slate-800/50 border border-slate-700">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								{getTrendIcon(predictiveData.trendAnalysis.trend)}
								<div>
									<p className="text-sm text-gray-400">Emission Trend</p>
									<p className={`font-bold capitalize ${getTrendColor(predictiveData.trendAnalysis.trend)}`}>
										{predictiveData.trendAnalysis.trend}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-slate-800/50 border border-slate-700">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<Target className="w-5 h-5 text-blue-500" />
								<div>
									<p className="text-sm text-gray-400">Monthly Change</p>
									<p className="font-bold text-white">
										{predictiveData.trendAnalysis.monthlyChange > 0 ? '+' : ''}
										{predictiveData.trendAnalysis.monthlyChange} kg CO₂
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-slate-800/50 border border-slate-700">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<CheckCircle className={`w-5 h-5 ${getConfidenceColor(predictiveData.trendAnalysis.confidence)}`} />
								<div>
									<p className="text-sm text-gray-400">Prediction Confidence</p>
									<p className={`font-bold capitalize ${getConfidenceColor(predictiveData.trendAnalysis.confidence)}`}>
										{predictiveData.trendAnalysis.confidence}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Predictive Chart */}
			<Card className="bg-slate-800/50 border border-slate-700">
				<CardHeader>
					<CardTitle className="text-white flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-emerald-400" />
						Carbon Footprint Forecast
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis
									dataKey="month"
									stroke="#9CA3AF"
									fontSize={12}
								/>
								<YAxis
									stroke="#9CA3AF"
									fontSize={12}
									label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: '#1F2937',
										border: '1px solid #374151',
										borderRadius: '8px',
										color: '#F9FAFB'
									}}
									formatter={(value, name) => [
										`${value} kg CO₂`,
										name === 'emissions' ? 'Emissions' : name
									]}
								/>
								<Area
									type="monotone"
									dataKey="actual"
									stroke="#10B981"
									fill="#10B981"
									fillOpacity={0.3}
									name="Historical"
								/>
								<Area
									type="monotone"
									dataKey="predicted"
									stroke="#3B82F6"
									fill="#3B82F6"
									fillOpacity={0.2}
									name="Predicted"
									strokeDasharray="5 5"
								/>
								<ReferenceLine
									x={new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
									stroke="#F59E0B"
									strokeDasharray="2 2"
									label={{ value: "Today", position: "topRight" }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="flex items-center gap-6 mt-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
							<span className="text-gray-300">Historical Data</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-blue-500 rounded-full opacity-60"></div>
							<span className="text-gray-300">AI Predictions</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-0.5 bg-yellow-500"></div>
							<span className="text-gray-300">Current Month</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* AI Insights */}
			{predictiveData?.insights && (
				<Card className="bg-slate-800/50 border border-slate-700">
					<CardHeader>
						<CardTitle className="text-white flex items-center gap-2">
							<Lightbulb className="w-5 h-5 text-yellow-400" />
							AI-Powered Insights
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{predictiveData.insights.behavioralPatterns && (
							<div>
								<h4 className="text-emerald-400 font-semibold mb-2">Behavioral Patterns</h4>
								<ul className="space-y-1">
									{predictiveData.insights.behavioralPatterns.map((pattern, index) => (
										<li key={index} className="text-gray-300 text-sm flex items-start gap-2">
											<span className="text-emerald-400 mt-1">•</span>
											{pattern}
										</li>
									))}
								</ul>
							</div>
						)}

						{predictiveData.insights.recommendations && (
							<div>
								<h4 className="text-blue-400 font-semibold mb-2">Recommendations</h4>
								<ul className="space-y-1">
									{predictiveData.insights.recommendations.map((rec, index) => (
										<li key={index} className="text-gray-300 text-sm flex items-start gap-2">
											<span className="text-blue-400 mt-1">•</span>
											{rec}
										</li>
									))}
								</ul>
							</div>
						)}

						{predictiveData.insights.motivation && (
							<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
								<p className="text-emerald-300 italic">
									{predictiveData.insights.motivation}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Personalized Goals */}
			{predictiveData?.personalizedGoals && (
				<Card className="bg-slate-800/50 border border-slate-700">
					<CardHeader>
						<CardTitle className="text-white flex items-center gap-2">
							<Target className="w-5 h-5 text-purple-400" />
							Personalized Goals
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Short Term Goals */}
							{predictiveData.personalizedGoals.shortTerm && (
								<div className="space-y-3">
									<h4 className="text-green-400 font-semibold flex items-center gap-2">
										<Clock className="w-4 h-4" />
										Short Term (1-3 months)
									</h4>
									{predictiveData.personalizedGoals.shortTerm.slice(0, 1).map((goal, index) => (
										<div key={index} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
											<h5 className="text-white font-medium text-sm">{goal.title}</h5>
											<p className="text-gray-300 text-xs mt-1">{goal.description}</p>
											<p className="text-green-400 text-xs mt-2">Target: {goal.targetReduction}</p>
										</div>
									))}
								</div>
							)}

							{/* Medium Term Goals */}
							{predictiveData.personalizedGoals.mediumTerm && (
								<div className="space-y-3">
									<h4 className="text-yellow-400 font-semibold flex items-center gap-2">
										<Clock className="w-4 h-4" />
										Medium Term (3-6 months)
									</h4>
									{predictiveData.personalizedGoals.mediumTerm.slice(0, 1).map((goal, index) => (
										<div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
											<h5 className="text-white font-medium text-sm">{goal.title}</h5>
											<p className="text-gray-300 text-xs mt-1">{goal.description}</p>
											<p className="text-yellow-400 text-xs mt-2">Target: {goal.targetReduction}</p>
										</div>
									))}
								</div>
							)}

							{/* Long Term Goals */}
							{predictiveData.personalizedGoals.longTerm && (
								<div className="space-y-3">
									<h4 className="text-blue-400 font-semibold flex items-center gap-2">
										<Clock className="w-4 h-4" />
										Long Term (6-12 months)
									</h4>
									{predictiveData.personalizedGoals.longTerm.slice(0, 1).map((goal, index) => (
										<div key={index} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
											<h5 className="text-white font-medium text-sm">{goal.title}</h5>
											<p className="text-gray-300 text-xs mt-1">{goal.description}</p>
											<p className="text-blue-400 text-xs mt-2">Target: {goal.targetReduction}</p>
										</div>
									))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default PredictiveChart;
