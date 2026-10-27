'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';

export default function NewsSection() {
	const router = useRouter();
	const sliderRef = useRef(null);
	const [newsItems, setNewsItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchNews();
	}, []);

	const fetchNews = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/news');
			if (!response.ok) {
				throw new Error('Failed to fetch news');
			}
			const data = await response.json();

			// Format the news items for display
			const formattedItems = data.items.slice(0, 8).map((item, index) => ({
				id: index + 1,
				image: item.enclosure?.url || 'https://images.unsplash.com/photo-1569163139394-de44cb3c4c8c?auto=format&fit=crop&q=80&w=400&h=300',
				title: item.title,
				date: new Date(item.pubDate).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}),
				excerpt: item.contentSnippet || 'Read more about this climate news...',
				tag: getTagFromTitle(item.title),
				link: item.link,
				source: item.sourceName
			}));

			setNewsItems(formattedItems);
		} catch (err) {
			console.error('Error fetching news:', err);
			setError('Failed to load latest news');
			// Fallback to mock data if API fails
			setNewsItems(getFallbackNews());
		} finally {
			setLoading(false);
		}
	};

	const getTagFromTitle = (title) => {
		const titleLower = title.toLowerCase();
		if (titleLower.includes('temperature') || titleLower.includes('heat') || titleLower.includes('warm')) {
			return 'Temperature';
		} else if (titleLower.includes('carbon') || titleLower.includes('emission')) {
			return 'Emissions';
		} else if (titleLower.includes('renewable') || titleLower.includes('energy')) {
			return 'Energy';
		} else if (titleLower.includes('climate')) {
			return 'Climate';
		} else if (titleLower.includes('weather') || titleLower.includes('storm')) {
			return 'Weather';
		} else {
			return 'Environment';
		}
	};

	const getFallbackNews = () => [
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&q=80&w=400&h=300',
			title: 'Latest Climate Updates',
			date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
			excerpt: 'Stay informed about the latest climate news and environmental developments...',
			tag: 'Climate',
			link: '/news',
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400&h=300',
			title: 'Environmental News',
			date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
			excerpt: 'Discover the latest environmental news and sustainability updates...',
			tag: 'Environment',
			link: '/news',
		}
	];

	const scroll = (direction) => {
		const container = sliderRef.current;
		if (!container) return;

		const scrollAmount = 350; // Fixed scroll amount based on card width
		container.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		});
	};

	if (loading) {
		return (
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="flex justify-center items-center py-20">
						<Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
						<span className="ml-3 text-white">Loading latest climate news...</span>
					</div>
				</div>
			</section>
		);
	}

	if (error && newsItems.length === 0) {
		return (
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Latest <span className="text-emerald-400">Climate</span> News
						</h2>
						<p className="text-gray-400 mb-6">Unable to load news at the moment</p>
						<button
							onClick={fetchNews}
							className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section>
			{/* Simplified background elements */}
			<div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>
			<div className='absolute top-60 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>

			<div className='container mx-auto px-4'>
				<div className='flex justify-between items-center mb-10'>
					<h2 className='text-3xl md:text-4xl font-bold text-white'>
						Latest <span className='text-emerald-400'>Climate</span> News
					</h2>
					<div className='flex gap-3'>
						<button
							onClick={() => scroll('left')}
							className='p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 transition-all duration-300'
							aria-label='Previous news'
						>
							<ArrowLeft className='w-5 h-5' />
						</button>
						<button
							onClick={() => scroll('right')}
							className='p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 transition-all duration-300'
							aria-label='Next news'
						>
							<ArrowRight className='w-5 h-5' />
						</button>
					</div>
				</div>

				{/* Improved News Slider */}
				<div
					ref={sliderRef}
					className='flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory'
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{newsItems.map((item) => (
						<div
							key={item.id}
							className='flex-none w-[320px] bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 flex flex-col snap-center'
						>
							<img
								src={item.image}
								alt={item.title}
								className='w-full h-44 object-cover rounded-t-xl'
								onError={(e) => {
									e.target.src = 'https://images.unsplash.com/photo-1569163139394-de44cb3c4c8c?auto=format&fit=crop&q=80&w=400&h=300';
								}}
							/>
							<div className='p-5 flex flex-col flex-grow'>
								<div className='flex justify-between items-center mb-2'>
									<span className='text-xs text-gray-400'>{item.date}</span>
									<span className='px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded-full text-xs border border-emerald-500/20'>
										{item.tag}
									</span>
								</div>
								<h3 className='text-lg font-semibold mb-2 text-white line-clamp-2'>
									{item.title}
								</h3>
								<p className='text-gray-300 text-sm mb-3 flex-grow line-clamp-3'>
									{item.excerpt}
								</p>
								<div className='flex justify-between items-center'>
									{item.source && (
										<span className='text-xs text-gray-500'>{item.source}</span>
									)}
									<button
										onClick={() => window.open(item.link, '_blank')}
										className='text-emerald-400 font-medium hover:text-emerald-300 transition-colors text-sm flex items-center gap-1'
									>
										Read More
										<ExternalLink className='w-3 h-3' />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className='text-center mt-10'>
					<button
						onClick={() => router.push('/news')}
						className='inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md font-medium shadow hover:shadow-emerald-500/20 transition-all duration-300'
					>
						See All News
						<ExternalLink className='w-4 h-4' />
					</button>
				</div>
			</div>

			{/* CSS to hide scrollbar */}
			<style jsx>{`
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				.line-clamp-2 {
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
				.line-clamp-3 {
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			`}</style>
		</section>
	);
}
