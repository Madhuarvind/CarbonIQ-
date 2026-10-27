'use client';
import React, { useState, useEffect } from 'react';
import {
	Star,
	Search,
	Tag,
	ShoppingBag,
	Filter,
	X,
	ExternalLink,
	Heart,
} from 'lucide-react';
import productsData from './products.json';

const ShoppingTracker = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredProducts, setFilteredProducts] = useState(productsData);
	const [showFilters, setShowFilters] = useState(false);
	const [favorites, setFavorites] = useState([]);
	const [priceRange, setPriceRange] = useState('All Prices');
	const [ratingFilter, setRatingFilter] = useState('All Ratings');
	const [storeFilter, setStoreFilter] = useState('All Stores');

	// Filter products when search term or filters change
	useEffect(() => {
		let results = productsData.filter((product) => {
			// Search term filter
			const matchesSearch = product.productName
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			// Price range filter
			const matchesPrice =
				priceRange === 'All Prices' ||
				(priceRange === 'Under ₹500' && parseFloat(product.price) < 500) ||
				(priceRange === '₹500 - ₹1000' &&
					parseFloat(product.price) >= 500 &&
					parseFloat(product.price) <= 1000) ||
				(priceRange === '₹1000 - ₹2000' &&
					parseFloat(product.price) >= 1000 &&
					parseFloat(product.price) <= 2000) ||
				(priceRange === 'Over ₹2000' && parseFloat(product.price) > 2000);

			// Rating filter
			const matchesRating =
				ratingFilter === 'All Ratings' ||
				(ratingFilter === '4★ & Above' && parseFloat(product.rating) >= 4) ||
				(ratingFilter === '3★ & Above' && parseFloat(product.rating) >= 3) ||
				(ratingFilter === '2★ & Above' && parseFloat(product.rating) >= 2);

			// Store filter
			const matchesStore =
				storeFilter === 'All Stores' ||
				(storeFilter === 'Amazon' && product.productUrl.includes('amazon')) ||
				(storeFilter === 'Flipkart' && product.productUrl.includes('flipkart'));

			return matchesSearch && matchesPrice && matchesRating && matchesStore;
		});

		setFilteredProducts(results);
	}, [searchTerm, priceRange, ratingFilter, storeFilter]);

	const RatingStars = ({ rating }) => {
		if (rating === 'N/A' || !rating)
			return <span className='text-gray-400'>No Rating</span>;

		const numRating = parseFloat(rating);
		const fullStars = Math.floor(numRating);
		const hasHalfStar = numRating % 1 >= 0.5;

		return (
			<div className='flex items-center'>
				{[...Array(fullStars)].map((_, i) => (
					<Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
				))}
				{hasHalfStar && (
					<div className='relative w-4 h-4'>
						<Star className='absolute w-4 h-4 text-yellow-400' />
						<div className='absolute w-2 h-4 overflow-hidden'>
							<Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
						</div>
					</div>
				)}
				<span className='ml-1 text-sm text-gray-400'>{rating}</span>
			</div>
		);
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const clearSearch = () => {
		setSearchTerm('');
	};

	const toggleFavorite = (index) => {
		if (favorites.includes(index)) {
			setFavorites(favorites.filter((i) => i !== index));
		} else {
			setFavorites([...favorites, index]);
		}
	};

	return (
		<div className='relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden'>
			{/* Background Elements */}
			<div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>
			<div className='absolute top-60 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl'></div>

			{/* Main Content */}
			<div className='relative z-10 container mx-auto px-4 py-12'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center'>
						<ShoppingBag className='inline-block mr-2 mb-1' size={32} />
						Sustainable Products
					</h1>
					<p className='text-gray-400 max-w-2xl mx-auto'>
						Browse our collection of eco-friendly products to reduce your carbon
						footprint and support sustainable living
					</p>
				</div>

				{/* Search Bar and Filters */}
				<div className='max-w-3xl mx-auto mb-10'>
					<div className='relative flex items-center mb-4'>
						<input
							type='text'
							placeholder='Search sustainable products...'
							value={searchTerm}
							onChange={handleSearchChange}
							className='w-full px-4 py-3 pl-12 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400'
						/>
						<Search className='absolute left-4 text-emerald-400 w-5 h-5' />
						{searchTerm && (
							<button
								onClick={clearSearch}
								className='absolute right-4 text-gray-400 hover:text-emerald-400 transition-colors'
							>
								<X size={18} />
							</button>
						)}
					</div>

					<div className='flex justify-between items-center'>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-500 transition-colors'
						>
							<Filter size={16} className='mr-1' />
							{showFilters ? 'Hide Filters' : 'Show Filters'}
						</button>

						<span className='text-sm text-gray-400'>
							Showing {filteredProducts.length} of {productsData.length}{' '}
							products
						</span>
					</div>

					{/* Filter Options (expandable) */}
					{showFilters && (
						<div className='bg-slate-800/90 backdrop-blur-sm border border-slate-700 p-4 mt-3 rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn'>
							<div>
								<label className='block text-sm font-medium text-gray-400 mb-2'>
									Price Range
								</label>
								<select
									value={priceRange}
									onChange={(e) => setPriceRange(e.target.value)}
									className='w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white'
								>
									<option>All Prices</option>
									<option>Under ₹500</option>
									<option>₹500 - ₹1000</option>
									<option>₹1000 - ₹2000</option>
									<option>Over ₹2000</option>
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-400 mb-2'>
									Rating
								</label>
								<select
									value={ratingFilter}
									onChange={(e) => setRatingFilter(e.target.value)}
									className='w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white'
								>
									<option>All Ratings</option>
									<option>4★ & Above</option>
									<option>3★ & Above</option>
									<option>2★ & Above</option>
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-400 mb-2'>
									Store
								</label>
								<select
									value={storeFilter}
									onChange={(e) => setStoreFilter(e.target.value)}
									className='w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white'
								>
									<option>All Stores</option>
									<option>Amazon</option>
									<option>Flipkart</option>
								</select>
							</div>
						</div>
					)}
				</div>

				{/* Products Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{filteredProducts && filteredProducts.length > 0 ? (
						filteredProducts.map((product, index) => (
							<div
								key={index}
								className='bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300'
							>
								<div className='relative pt-[100%] overflow-hidden group'>
									<img
										src={product.imageUrl || '/api/placeholder/400/320'}
										alt={product.productName || 'Product'}
										className='absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
									/>
									<div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300'></div>

									{/* Favorite Button */}
									<button
										onClick={() => toggleFavorite(index)}
										className='absolute top-2 right-2 p-2 bg-slate-700/50 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300'
									>
										<Heart
											size={18}
											className={`${
												favorites.includes(index)
													? 'fill-red-500 text-red-500'
													: 'text-gray-400'
											}`}
										/>
									</button>
								</div>

								<div className='p-5'>
									{/* Product Source Tag */}
									<div className='mb-2'>
										<span
											className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
												product.productUrl &&
												product.productUrl.includes('amazon')
													? 'bg-orange-500/10 text-orange-400'
													: 'bg-blue-500/10 text-blue-400'
											}`}
										>
											<Tag size={12} className='mr-1' />
											{product.productUrl &&
											product.productUrl.includes('amazon')
												? 'Amazon'
												: 'Flipkart'}
										</span>
									</div>

									{/* Product Name */}
									<h3 className='text-sm font-medium text-white mb-2 line-clamp-2 h-10 group-hover:text-emerald-400'>
										{product.productName || 'Sustainable Product'}
									</h3>

									<div className='flex justify-between items-start mb-3'>
										<span className='text-xl font-bold text-white'>
											₹{product.price}
										</span>
										<RatingStars rating={product.rating} />
									</div>

									<a
										href={product.productUrl || '#'}
										target='_blank'
										rel='noopener noreferrer'
										className='mt-4 flex items-center justify-center w-full text-center bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-300 group'
									>
										<span>View Product</span>
										<ExternalLink
											size={16}
											className='ml-2 transform group-hover:translate-x-1 transition-transform'
										/>
									</a>
								</div>
							</div>
						))
					) : (
						<div className='col-span-full text-center py-12'>
							<div className='max-w-md mx-auto'>
								<div className='bg-slate-800/90 backdrop-blur-sm border border-slate-700 p-8 rounded-lg shadow-2xl'>
									<X size={48} className='mx-auto text-gray-400 mb-4' />
									<h3 className='text-xl font-semibold text-white mb-2'>
										No matching products found
									</h3>
									<p className='text-gray-400 mb-4'>
										Try adjusting your search or filter criteria to find what
										you're looking for.
									</p>
									<button
										onClick={clearSearch}
										className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
									>
										Clear Search
									</button>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Pagination */}
				{filteredProducts.length > 12 && (
					<div className='mt-12 flex justify-center'>
						<nav className='inline-flex rounded-md shadow-sm'>
							<a
								href='#'
								className='px-4 py-2 bg-slate-700/50 text-emerald-400 border border-slate-600 rounded-l-md hover:bg-slate-700/80'
							>
								Previous
							</a>
							<a
								href='#'
								className='px-4 py-2 bg-emerald-500 text-white border border-emerald-500'
							>
								1
							</a>
							<a
								href='#'
								className='px-4 py-2 bg-slate-700/50 text-emerald-400 border border-slate-600 hover:bg-slate-700/80'
							>
								2
							</a>
							<a
								href='#'
								className='px-4 py-2 bg-slate-700/50 text-emerald-400 border border-slate-600 rounded-r-md hover:bg-slate-700/80'
							>
								Next
							</a>
						</nav>
					</div>
				)}
			</div>
		</div>
	);
};

// Add keyframes for fadeIn animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

export default ShoppingTracker;
