'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '../../components/ui/card';
import {
	Car,
	Home,
	Sandwich,
	ShoppingBag,
	Droplet,
	Users,
	Package,
	Building,
	Heart,
	Info,
	TreeDeciduous,
	Flame,
	Lightbulb,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import suggestions from './suggestions';
import categories from './categories';
import equivalencies from './equivalencies';

const CarbonFootprintCalculator = () => {
	const [answers, setAnswers] = useState({});
	const [currentCategory, setCurrentCategory] = useState(0);
	const [showResults, setShowResults] = useState(false);
	const [totalEmissions, setTotalEmissions] = useState(0);
	const [categoryEmissions, setCategoryEmissions] = useState({});
	const [showFormula, setShowFormula] = useState(false);

	const [dailySuggestion, setDailySuggestion] = useState(null);
	const [suggestionCategory, setSuggestionCategory] = useState(null);
	const [personalizedPlan, setPersonalizedPlan] = useState(null);
	const [generatingPlan, setGeneratingPlan] = useState(false);

	useEffect(() => {
		if (showResults && Object.keys(categoryEmissions).length > 0) {
			// Find the category with highest emissions
			const highestCategory = Object.entries(categoryEmissions).reduce((a, b) =>
				b[1] > a[1] ? b : a
			)[0];

			setSuggestionCategory(highestCategory);

			// Get random suggestion from that category
			if (suggestions[highestCategory]) {
				const randomSuggestion =
					suggestions[highestCategory][
						Math.floor(Math.random() * suggestions[highestCategory].length)
					];
				setDailySuggestion(randomSuggestion);
			}
		}
	}, [showResults, categoryEmissions]);

	const calculateCategoryEmissions = (categoryId) => {
		const category = categories.find((c) => c.id === categoryId);
		if (!category) return 0;

		return category.questions.reduce((acc, question) => {
			const value = answers[categoryId]?.[question.id] || 0;
			return acc + value * question.factor;
		}, 0);
	};

	useEffect(() => {
		// Calculate emissions for all categories in real-time
		const newCategoryEmissions = {};
		let total = 0;

		categories.forEach((category) => {
			const emission = calculateCategoryEmissions(category.id);
			newCategoryEmissions[category.id] = emission;
			total += emission;
		});

		setCategoryEmissions(newCategoryEmissions);
		setTotalEmissions(total);
	}, [answers]);

	const handleInputChange = (categoryId, questionId, value) => {
		setAnswers((prev) => ({
			...prev,
			[categoryId]: {
				...prev[categoryId],
				[questionId]: parseFloat(value) || 0,
			},
		}));
	};

	const getEquivalencies = (emissions) => {
		return equivalencies.map((eq) => ({
			...eq,
			value: Math.round(emissions / eq.factor),
		}));
	};

	const getEmissionLevel = (emissions) => {
		if (emissions < 1000)
			return {
				text: 'Low Impact',
				color: 'text-emerald-500',
				bg: 'bg-emerald-500/10',
			};
		if (emissions < 5000)
			return {
				text: 'Moderate Impact',
				color: 'text-amber-500',
				bg: 'bg-amber-500/10',
			};
		return { text: 'High Impact', color: 'text-red-500', bg: 'bg-red-500/10' };
	};

	const { user } = useUser();

	const saveData = async () => {
		try {
			const currentMonthIndex = new Date().getMonth(); // 0-based index
			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			const currentMonth = months[currentMonthIndex];

			const data = {
				clerkId: user?.id,
				// Optional profile fields to enrich leaderboard display
				displayName:
					user?.fullName ||
					[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
					undefined,
				firstName: user?.firstName,
				lastName: user?.lastName,
				imageUrl: user?.imageUrl,
				updatedAt: new Date().toISOString(),
				categories: categoryEmissions,
				equivalencies: getEquivalencies(totalEmissions).reduce((acc, eq) => {
					acc[eq.name] = eq.value;
					return acc;
				}, {}),
				monthlyData: {
					[currentMonth]: Math.round(totalEmissions),
				},
			};

			const response = await fetch('/api/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Failed to save data:', errorData);
				return;
			}

			const result = await response.json();
			console.log('Data saved successfully:', result);
		} catch (error) {
			console.error('An error occurred while saving data:', error);
		}
	};

	const generatePersonalizedPlan = async () => {
		if (!user?.id) {
			alert('Please sign in to generate a personalized plan');
			return;
		}

		try {
			setGeneratingPlan(true);
			const response = await fetch('/api/personalized_plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userData: {
						totalEmissions: Math.round(totalEmissions),
					},
					categories: categoryEmissions,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Failed to generate personalized plan');
				return;
			}

			const result = await response.json();
			setPersonalizedPlan(result.personalizedPlan);
		} catch (error) {
			console.error('Error generating personalized plan:', error);
			alert('Failed to generate personalized plan');
		} finally {
			setGeneratingPlan(false);
		}
	};

	return (
		<div className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen'>
			{/* Background Elements - matching homepage */}
			<div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>
			<div className='absolute top-60 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>

			{/* Header Section - Full Width */}
			<div className='w-full px-4 py-12 text-center'>
				<div className='inline-block px-4 py-1 bg-emerald-900/50 rounded-full mb-2 backdrop-blur-sm border border-emerald-500/20'>
					<p className='text-xs md:text-sm font-medium text-emerald-400 tracking-wide'>
						CALCULATE · UNDERSTAND · IMPROVE
					</p>
				</div>
				<h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>
					Your <span className='text-emerald-400'>Carbon Footprint</span>{' '}
					Calculator
				</h1>
				<p className='text-gray-300 max-w-2xl mx-auto'>
					Discover your environmental impact and get personalized suggestions to
					reduce your carbon footprint.
				</p>
			</div>

			{/* Main Content - Full Width */}
			<div className='w-full px-4 md:px-8 pb-12'>
				{/* Heading with Info Button */}
				<div className='flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4 max-w-screen-2xl mx-auto'>
					<h2 className='text-xl font-bold text-white flex items-center gap-2'>
						<TreeDeciduous className='h-5 w-5 text-emerald-400' />
						Carbon Footprint Calculator
					</h2>
					<button
						onClick={() => setShowFormula(!showFormula)}
						className='p-2 rounded-full hover:bg-slate-700/50 transition-colors text-emerald-400'
					>
						<Info className='w-5 h-5' />
					</button>
				</div>

				{/* Main Content Area */}
				<div className='space-y-6 backdrop-blur-sm max-w-screen-2xl mx-auto'>
					{showFormula && (
						<Alert className='mb-6 bg-slate-700/50 border border-emerald-500/20 text-gray-300'>
							<AlertDescription>
								<div className='space-y-2'>
									<p className='font-medium text-white'>
										Calculation Formula (Based on IPCC Guidelines):
									</p>
									<p className='font-mono text-sm text-emerald-400'>
										Total Emissions = Σ (Activity Data × Emission Factor)
									</p>
									<p className='text-sm'>
										Where:
										<br />
										- Activity Data = Your input (e.g., distance driven)
										<br />- Emission Factor = Standard CO₂ equivalent per unit
										(from EPA/IPCC)
									</p>
								</div>
							</AlertDescription>
						</Alert>
					)}

					{!showResults ? (
						<>
							{/* Category Tabs - Full Width Scrollable */}
							<div className='flex overflow-x-auto mb-6 p-3 gap-3 bg-slate-800/30 rounded-xl border border-slate-700/50 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-slate-700/10'>
								{categories.map((category, index) => {
									const Icon = category.icon;
									const emission = categoryEmissions[category.id] || 0;
									return (
										<button
											key={category.id}
											onClick={() => setCurrentCategory(index)}
											className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
												currentCategory === index
													? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'
													: 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-300'
											}`}
										>
											<Icon className='w-5 h-5 mb-1' />
											<span className='text-xs font-medium whitespace-nowrap'>
												{category.title}
											</span>
											<span className='text-xs mt-1 font-light'>
												{emission.toFixed(1)} kg CO₂
											</span>
										</button>
									);
								})}
							</div>

							{/* Questions Section - Full Width */}
							<div className='bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6'>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='text-xl font-bold text-white flex items-center gap-2'>
										{React.createElement(categories[currentCategory].icon, {
											className: 'w-5 h-5 text-emerald-400',
										})}
										{categories[currentCategory].title}
									</h2>
									<span
										className={`px-3 py-1 rounded-full text-sm ${
											getEmissionLevel(
												categoryEmissions[categories[currentCategory].id] || 0
											).bg
										} ${
											getEmissionLevel(
												categoryEmissions[categories[currentCategory].id] || 0
											).color
										}`}
									>
										{(
											categoryEmissions[categories[currentCategory].id] || 0
										).toFixed(1)}{' '}
										kg CO₂
									</span>
								</div>

								<div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
									{categories[currentCategory].questions.map((question) => {
										const value =
											answers[categories[currentCategory].id]?.[question.id] ||
											'';
										const emission = value * question.factor;
										return (
											<div
												key={question.id}
												className='space-y-2 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50'
											>
												<label className='block text-sm font-medium text-white'>
													{question.label}
												</label>
												<div className='flex gap-4 items-center'>
													<input
														type='number'
														className='flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 text-white'
														value={value}
														onChange={(e) =>
															handleInputChange(
																categories[currentCategory].id,
																question.id,
																e.target.value
															)
														}
														min='0'
														step='0.1'
													/>
													<span
														className={`text-sm px-3 py-1 rounded-full ${
															emission > 0
																? 'bg-emerald-500/10 text-emerald-400'
																: 'text-gray-400'
														}`}
													>
														{emission.toFixed(1)} kg CO₂
													</span>
												</div>
												<p className='text-xs text-gray-400'>
													Source: {question.source}
												</p>
											</div>
										);
									})}
								</div>
							</div>

							{/* Navigation Buttons */}
							<div className='flex justify-between mt-6'>
								<button
									onClick={() =>
										setCurrentCategory(Math.max(0, currentCategory - 1))
									}
									disabled={currentCategory === 0}
									className='px-5 py-2 border border-emerald-500/30 text-emerald-400 rounded-md hover:bg-emerald-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
								>
									Previous
								</button>
								{currentCategory === categories.length - 1 ? (
									<button
										onClick={() => {
											setShowResults(true);
											saveData();
										}}
										className='px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md font-medium shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:translate-y-1 flex items-center justify-center gap-2 group'
									>
										View Results
									</button>
								) : (
									<button
										onClick={() => setCurrentCategory(currentCategory + 1)}
										className='px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md font-medium shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:translate-y-1 flex items-center justify-center gap-2 group'
									>
										Next
									</button>
								)}
							</div>
						</>
					) : (
						<div className='space-y-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6'>
							{/* Results Summary - Full Width Grid */}
							<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
								<Card
									className={`col-span-1 bg-slate-800/90 border border-slate-700 shadow-lg overflow-hidden ${
										getEmissionLevel(totalEmissions).bg
									}`}
								>
									<CardContent className='p-6'>
										<h3 className='text-lg font-medium mb-2 text-white'>
											Total Annual Emissions
										</h3>
										<p
											className={`text-3xl font-bold ${
												getEmissionLevel(totalEmissions).color
											}`}
										>
											{totalEmissions.toFixed(1)} kg CO₂
										</p>
										<p
											className={`text-sm mt-2 ${
												getEmissionLevel(totalEmissions).color
											}`}
										>
											{getEmissionLevel(totalEmissions).text}
										</p>
									</CardContent>
								</Card>

								<div className='col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4'>
									{getEquivalencies(totalEmissions).map((eq, index) => (
										<Card
											key={index}
											className='bg-slate-800/90 border border-slate-700 shadow-lg overflow-hidden'
										>
											<CardContent className='p-4'>
												<div className='flex items-center gap-2 mb-2'>
													{React.createElement(eq.icon, {
														className: 'w-4 h-4 text-emerald-400',
													})}
													<h4 className='text-sm font-medium text-white'>
														{eq.name}
													</h4>
												</div>
												<p className='text-2xl font-bold text-emerald-400'>
													{eq.value}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</div>

							{/* Category Breakdowns - Grid Layout */}
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{categories.map((category) => {
									const emission = categoryEmissions[category.id] || 0;
									const percentage = (emission / totalEmissions) * 100;

									return (
										<Card
											key={category.id}
											className='bg-slate-800/90 border border-slate-700 shadow-lg overflow-hidden'
										>
											<CardContent className='p-4'>
												<div className='flex items-center justify-between mb-2'>
													<div className='flex items-center gap-2'>
														{React.createElement(category.icon, {
															className: 'w-5 h-5 text-emerald-400',
														})}
														<h3 className='font-medium text-white'>
															{category.title}
														</h3>
													</div>
													<p className='font-bold text-white'>
														{emission.toFixed(1)} kg CO₂
													</p>
												</div>
												<div className='w-full bg-slate-700 rounded-full h-2 overflow-hidden'>
													<div
														className='bg-emerald-500 h-2 rounded-full'
														style={{ width: `${percentage}%` }}
													/>
												</div>
												<p className='text-sm text-gray-400 mt-1'>
													{percentage.toFixed(1)}% of total
												</p>
											</CardContent>
										</Card>
									);
								})}
							</div>

							{/* Suggestion Card - Full Width */}
							{showResults && dailySuggestion && (
								<Card className='bg-emerald-900/30 border border-emerald-500/30 shadow-lg overflow-hidden'>
									<CardContent className='p-6'>
										<div className='flex items-center gap-2 mb-4'>
											<Lightbulb className='w-6 h-6 text-emerald-400' />
											<h3 className='text-lg font-bold text-emerald-400'>
												Personalized Suggestion
											</h3>
										</div>
										<p className='text-lg mb-2 text-white'>
											{dailySuggestion.text}
										</p>
										<p className='text-sm text-emerald-300'>
											Potential Impact: {dailySuggestion.impact}
										</p>
										<div className='mt-4'>
											<p className='text-sm text-gray-400'>
												Based on your{' '}
												{categories
													.find((c) => c.id === suggestionCategory)
													?.title.toLowerCase()}{' '}
												emissions
											</p>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Action Buttons */}
							<div className='flex flex-col sm:flex-row gap-4'>
								<button
									onClick={() => {
										setShowResults(false);
										setCurrentCategory(0);
										setAnswers({});
									}}
									className='flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md font-medium shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:translate-y-1 flex items-center justify-center gap-2 group'
								>
									Calculate Again
								</button>
								<button
									onClick={generatePersonalizedPlan}
									disabled={generatingPlan}
									className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md font-medium shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{generatingPlan ? 'Generating AI Plan...' : 'Get AI Personalized Plan'}
								</button>
							</div>

							{/* Personalized Plan Display */}
							{personalizedPlan && (
								<Card className='bg-blue-900/30 border border-blue-500/30 shadow-lg overflow-hidden'>
									<CardContent className='p-6'>
										<div className='flex items-center gap-2 mb-6'>
											<Flame className='w-6 h-6 text-blue-400' />
											<h3 className='text-xl font-bold text-blue-400'>
												{personalizedPlan.planTitle}
											</h3>
										</div>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
											<div className='bg-slate-800/50 p-4 rounded-lg'>
												<p className='text-sm text-gray-400'>Potential Reduction</p>
												<p className='text-2xl font-bold text-blue-400'>
													{personalizedPlan.totalReductionPotential} kg CO₂
												</p>
											</div>
											<div className='bg-slate-800/50 p-4 rounded-lg'>
												<p className='text-sm text-gray-400'>Plan Duration</p>
												<p className='text-2xl font-bold text-blue-400'>30 Days</p>
											</div>
										</div>

										<div className='space-y-4 mb-6'>
											<h4 className='text-lg font-semibold text-white'>Weekly Action Plan</h4>
											{personalizedPlan.plan.map((week, index) => (
												<div key={index} className='bg-slate-800/50 p-4 rounded-lg'>
													<h5 className='text-lg font-medium text-blue-400 mb-2'>
														Week {week.week}: {week.focus}
													</h5>
													<p className='text-sm text-gray-300 mb-3'>{week.weeklyGoal}</p>
													<div className='space-y-2'>
														{week.actions.map((action, actionIndex) => (
															<div key={actionIndex} className='flex items-start gap-3 p-3 bg-slate-700/50 rounded-md'>
																<div className={`w-2 h-2 rounded-full mt-2 ${
																	action.difficulty === 'Easy' ? 'bg-green-400' :
																	action.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
																}`}></div>
																<div className='flex-1'>
																	<p className='text-sm text-white font-medium'>{action.action}</p>
																	<p className='text-xs text-gray-400'>
																		Impact: {action.impact} | Category: {action.category}
																	</p>
																</div>
															</div>
														))}
													</div>
												</div>
											))}
										</div>

										{personalizedPlan.longTermRecommendations && personalizedPlan.longTermRecommendations.length > 0 && (
											<div className='mb-6'>
												<h4 className='text-lg font-semibold text-white mb-3'>Long-term Recommendations</h4>
												<ul className='space-y-2'>
													{personalizedPlan.longTermRecommendations.map((rec, index) => (
														<li key={index} className='flex items-start gap-2 text-sm text-gray-300'>
															<span className='text-blue-400 mt-1'>•</span>
															{rec}
														</li>
													))}
												</ul>
											</div>
										)}

										{personalizedPlan.motivationalMessage && (
											<div className='bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg'>
												<p className='text-blue-300 italic text-center'>
													"{personalizedPlan.motivationalMessage}"
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CarbonFootprintCalculator;
