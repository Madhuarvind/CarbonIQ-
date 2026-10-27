# Carbo-Tracker Project Overview

## Project Description
Carbo-Tracker is a comprehensive carbon footprint tracking application built with Next.js, designed to help users monitor, analyze, and reduce their environmental impact. The platform combines advanced AI analytics, gamification, and community features to make sustainable living engaging and accessible.

## Core Features

### 1. Carbon Footprint Calculator
- Interactive calculator with multiple emission categories (Transportation, Food, Energy, Waste, etc.)
- Real-time emission calculations with personalized suggestions
- AI-powered personalized reduction plans
- Historical tracking and trend analysis

### 2. Advanced Dashboard
- Multi-tab interface with Overview, Charts, Comparison, Leaderboard, Predictive, Environment, Achievements, Challenges, Analytics, and AI Tools
- Real-time data visualization using Chart.js and Recharts
- 3D globe visualization for global impact representation
- Predictive analytics with ML models for future emission forecasting

### 3. AI-Powered Features
- **Personalized Plan Generation**: Google Gemini AI creates customized 30-day reduction plans
- **Predictive Analytics**: Advanced ML models (polynomial regression, exponential smoothing, ARIMA) for emission forecasting
- **Receipt Analysis**: Computer vision for automatic carbon footprint calculation from uploaded receipts
- **Environmental Insights**: AI-generated behavioral patterns and reduction recommendations

### 4. Gamification & Social Features
- Achievement system with badges and milestones
- Community challenges for group carbon reduction
- Leaderboards for competitive engagement
- Social sharing capabilities

### 5. Environmental Monitoring
- Real-time environmental data integration
- Local air quality and weather impact analysis
- Carbon offset marketplace integration
- Eco-commerce recommendations

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI, Headless UI, Lucide React icons
- **Charts**: Chart.js, Recharts, D3.js
- **3D Visualization**: Three.js for globe rendering
- **Animations**: Framer Motion

### Backend
- **APIs**: Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for user management
- **AI Integration**: Google Generative AI (Gemini)
- **OCR**: Tesseract.js for receipt analysis
- **Web Scraping**: Puppeteer for eco-commerce data

### DevOps & Automation
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Monitoring**: Automated health checks and error tracking
- **Scheduled Jobs**: Node-schedule for automated data processing

## Key Technologies & Dependencies

### Core Dependencies
- `next`: ^15.5.3 - React framework
- `react`: ^18.3.1 - UI library
- `@clerk/nextjs`: ^6.32.0 - Authentication
- `mongoose`: ^8.9.2 - MongoDB ODM
- `@google/generative-ai`: ^0.21.0 - AI integration
- `chart.js`: ^4.4.7 - Data visualization
- `three`: ^0.180.0 - 3D graphics

### Development Tools
- `jest`: ^30.1.3 - Testing framework
- `@playwright/test`: ^1.55.0 - E2E testing
- `eslint`: ^8.57.1 - Code linting
- `tailwindcss`: ^3.4.12 - CSS framework

## Project Structure

```
carbo-tracker/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── calculator/        # Carbon calculator page
│   │   ├── dashboard/         # User dashboard
│   │   ├── about/            # About page
│   │   └── ...
│   ├── components/            # Reusable components
│   ├── dbConnect.js          # Database connection
│   └── middleware.js         # Custom middleware
├── public/                    # Static assets
├── scripts/                   # Automation scripts
├── e2e/                      # End-to-end tests
├── src/__tests__/            # Unit and integration tests
├── .github/workflows/        # CI/CD pipelines
└── package.json
```

## API Endpoints

### Core APIs
- `/api/personalized_plan` - Generate AI-powered reduction plans
- `/api/predictive_analytics` - ML-based emission forecasting
- `/api/emissions` - Emission data management
- `/api/achievements` - Achievement system
- `/api/challenges` - Community challenges
- `/api/news` - Climate news aggregation
- `/api/environmental_data` - Real-time environmental data

### AI APIs
- `/api/computer-vision/receipt-analysis` - Receipt OCR and analysis
- `/api/gemini_categorize` - AI-powered categorization
- `/api/parse_receipt` - Receipt parsing

## Database Schema

### Key Collections
- **users**: User profiles and authentication data
- **emissions**: Carbon emission records by category
- **achievements**: User achievements and badges
- **challenges**: Community challenges and participation
- **news**: Cached climate news articles
- **environmental_data**: Real-time environmental metrics

## Automation Features

### Scheduled Jobs
- Daily emissions aggregation (2:00 AM)
- Weekly leaderboard updates (Mondays 3:00 AM)
- Monthly predictions refresh (1st of month 4:00 AM)
- Daily news updates (6:00 AM)

### CI/CD Pipeline
- Automated testing on push/PR
- Code quality checks with ESLint
- Security vulnerability scanning
- Vercel deployment on main branch merges

## Environmental Impact Focus

The application addresses major emission categories:
- **Transportation**: Vehicle usage, public transport, air travel
- **Energy**: Home electricity, heating/cooling
- **Food**: Dietary choices, food waste, local vs. imported
- **Consumption**: Shopping habits, product lifecycle
- **Waste**: Recycling, composting, landfill contributions

## Future Roadmap

### Phase 5: Sustainability Ecosystem
- Carbon offset marketplace integration
- Eco-commerce platform with carbon-aware recommendations
- Satellite imagery analysis for deforestation tracking
- Conversational AI chatbot for carbon advice
- Mobile app development
- Multi-language support

## Performance & Scalability

- Optimized database queries with indexing
- Response caching for API endpoints
- Image optimization and lazy loading
- Progressive Web App capabilities
- Horizontal scaling ready architecture

## Security Measures

- Clerk authentication with secure session management
- Input validation and sanitization
- Rate limiting on API endpoints
- Environment variable encryption
- Regular security audits and updates

## Contributing

The project follows standard development practices:
- Feature branching workflow
- Comprehensive test coverage
- Code review requirements
- Automated deployment pipelines
- Documentation standards

## Deployment

- **Platform**: Vercel for frontend and serverless functions
- **Database**: MongoDB Atlas
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in Vercel analytics and custom health checks

## Repository & Source Control

- **GitHub Repository**: [https://github.com/Madhuarvind/CarbonIQ-.git](https://github.com/Madhuarvind/CarbonIQ-.git)

This comprehensive overview covers all aspects of the Carbo-Tracker project, from technical implementation to environmental impact goals.
