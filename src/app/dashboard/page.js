

'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import BarGraph from './barGraph';
import PieChart from './pieChart';
import EquivalenciesTable from './EqvalTable';
import CarbonComparison from './compareChart';
import CarbonGauge from './DounutChart';
import LineChart from './LineChart';
import RadarChart from './RadarChart';
import Leaderboard from './Leaderboard';
import PredictiveChart from './PredictiveChart';
import EnvironmentalWidget from '../../components/EnvironmentalWidget';
import AchievementSystem from '../../components/AchievementSystem';
import ChallengeHub from '../../components/ChallengeHub';
import { Tab } from '@headlessui/react';
import {
	FaLeaf,
	FaChartLine,
	FaChartPie,
	FaTable,
	FaChartBar,
	FaGauge,
	FaRadar,
	FaBalanceScale,
	FaTrophy,
	FaBrain,
	FaCloud,
} from 'react-icons/fa';

Chart.register(CategoryScale);

export default function UserProfile() {
	const { user } = useUser();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [refresh, setRefresh] = useState(false); // 🔄 trigger chart refresh

	useEffect(() => {
		setMounted(true);
	}, []);

	const formattedDate = user?.createdAt
		? new Date(user.createdAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
		  })
		: '';

	if (!mounted) {
		return <div className="text-gray-400 text-center py-10">Loading dashboard…</div>;
	}

	return (
		<div className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen'>
			{/* Background Elements */}
			<div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>
			<div className='absolute top-60 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>
			<div className='absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl'></div>

			<div className='container mx-auto px-4 py-10 md:py-16'>
				{/* Dashboard Header */}
				<div className='mb-10 text-center space-y-3'>
					<div className='inline-block px-4 py-1 bg-emerald-900/50 rounded-full mb-2 backdrop-blur-sm border border-emerald-500/20'>
						<p className='text-xs md:text-sm font-medium text-emerald-400 tracking-wide'>
							YOUR CARBON DASHBOARD
						</p>
					</div>
					<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white'>
						Welcome, <span className='text-emerald-400'>{user?.firstName || 'User'}</span>
					</h1>
					<p className='text-gray-300 text-md max-w-2xl mx-auto leading-relaxed font-light'>
						Tracking your environmental impact since {formattedDate}
					</p>
				</div>

				{/* Dashboard Content */}
				<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className='flex space-x-1 rounded-xl bg-slate-800/50 p-1 mb-6'>
						{['Overview', 'Charts', 'Comparison', 'Leaderboard', 'Predictive', 'Environment', 'Achievements', 'Challenges', 'Analytics', 'AI Tools'].map(
							(category, idx) => (
								<Tab
									key={idx}
									className={({ selected }) =>
										`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-emerald-400
										ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2
										${
											selected
												? 'bg-emerald-900/50 shadow'
												: 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
										}`
									}
								>
									{category}
								</Tab>
							)
						)}
					</Tab.List>

					<Tab.Panels className='mt-2'>
						{/* Overview Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
									<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
											<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
												<FaChartBar />
											</div>
											Carbon Status
										</h2>
										<CarbonGauge clerkId={user?.id} refresh={refresh} />
									</div>

									<div className='lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
											<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
												<FaChartLine />
											</div>
											Carbon Trends
										</h2>
										<LineChart clerkId={user?.id} refresh={refresh} />
										<button
											className='mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600'
											onClick={async () => {
												const month = new Date().toLocaleString("default", { month: "short", year: "numeric" });
												const value = Math.floor(Math.random() * 50) + 1;
												await fetch("/api/addEmission", {
													method: "POST",
													headers: { "Content-Type": "application/json" },
													body: JSON.stringify({ clerkId: user.id, month, value }),
												});
												setRefresh(prev => !prev);
											}}
										>
											Add Random Emission
										</button>
									</div>
								</div>
							</div>
						</Tab.Panel>

						{/* Charts Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
											<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
												<FaChartPie />
											</div>
											Impact by Category
										</h2>
										<PieChart clerkId={user?.id} refresh={refresh} />
									</div>

									<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
											<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
												<FaChartBar />
											</div>
											Category Breakdown
										</h2>
										<RadarChart clerkId={user?.id} refresh={refresh} />
									</div>
								</div>

								<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
									<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
										<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
											<FaChartBar />
										</div>
										Monthly Carbon Footprint
									</h2>
									<BarGraph clerkId={user?.id} refresh={refresh} />
								</div>
							</div>
						</Tab.Panel>

						{/* Comparison Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<h2 className='text-xl font-bold mb-4 text-white flex items-center gap-2'>
											<div className='h-8 w-8 rounded-md bg-emerald-900/50 flex items-center justify-center text-emerald-400'>
												<FaBalanceScale />
											</div>
											National Comparison
										</h2>
										<CarbonComparison clerkId={user?.id} refresh={refresh} />
									</div>

									<div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-xl'>
										<EquivalenciesTable clerkId={user?.id} refresh={refresh} />
									</div>
								</div>
							</div>
						</Tab.Panel>

						{/* Leaderboard Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<Leaderboard clerkId={user?.id} refresh={refresh} />
						</Tab.Panel>

						{/* Predictive Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<PredictiveChart refresh={refresh} />
						</Tab.Panel>

						{/* Environment Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='text-center mb-6'>
									<h2 className='text-2xl font-bold text-white mb-2'>Real-Time Environmental Dashboard</h2>
									<p className='text-gray-400'>Monitor local environmental conditions and their impact on your carbon footprint</p>
								</div>
								<EnvironmentalWidget clerkId={user?.id} />
							</div>
						</Tab.Panel>

						{/* Achievements Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='text-center mb-6'>
									<h2 className='text-2xl font-bold text-white mb-2'>Achievements</h2>
									<p className='text-gray-400'>Track your progress and milestones</p>
								</div>
								<AchievementSystem />
							</div>
						</Tab.Panel>

						{/* Challenges Tab */}
						<Tab.Panel className={`rounded-xl bg-slate-800/50 p-3`}>
							<div className='space-y-6'>
								<div className='text-center mb-6'>
									<h2 className='text-2xl font-bold text-white mb-2'>Community Challenges</h2>
									<p className='text-gray-400'>Join challenges to boost your impact</p>
								</div>
								<ChallengeHub />
							</div>
						</Tab.Panel>
					</Tab.Panels>
				</Tab.Group>
			</div>
		</div>
	);
}
