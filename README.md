# HUD UI - System Design & Architecture

## Overview
HUD UI is a modern web application built with Next.js that serves as a personalized information dashboard. It aggregates content from various sources, provides AI-powered summarization, and offers a customizable interface for users to track their areas of interest.

## Tech Stack

### Core Technologies
- **Frontend Framework**: Next.js 15.5.3 with React 19
- **Styling**: Tailwind CSS with custom animations
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: NextAuth.js
- **Database**: MongoDB (via Mongoose ODM)

### AI & External Services
- **Content Processing**: Google Generative AI & GroqCloud
- **Authentication Providers**: Multiple OAuth providers supported
- **Social Media Integration**:
  - X (Twitter) API v2 for real-time tweets
  - HackerNews API for tech news
  - Reddit API for community discussions

## System Architecture

### Data Layer
- **MongoDB**: Primary database
  - Collections:
    - `FeedItem`: Stores aggregated content items (including tweets, news, posts)
    - `User`: Manages user accounts and preferences

### Backend Services
1. **API Routes** (Next.js API Routes)
   - Authentication (NextAuth.js)
   - Content fetching and processing
     - `/api/twitter`: Fetches and processes tweets from X (Twitter)
     - `/api/reddit`: Aggregates posts from Reddit
     - `/api/news`: Fetches HackerNews stories
   - User preferences management
   - Bookmarking system

2. **AI Services**
   - Content summarization
   - Tag generation using Google's Gemini AI & GroqCloud
   - Personalization algorithms

### Frontend Components
1. **Core UI**
   - Responsive layout system
   - Theme management
   - Accessibility features

2. **Feature Modules**
   - Feed aggregation view
   - User preferences panel
   - Authentication flows
   - Content filtering and search

## Data Models

### FeedItem
- `title`: String (required) - Content title or tweet text preview
- `content`: String - Full content for tweets and posts
- `url`: String (required) - Original source URL
- `source`: String (e.g., "HackerNews", "Reddit", "X: @username")
- `popularity`: Number (e.g., points, likes, retweets)
- `tags`: [String] - AI-generated and source-specific tags
- `publishedAt`: Date
- `metadata`: Object - Source-specific data (e.g., author info, engagement metrics)

### User
- Authentication info (email, hashed password, OAuth providers)
- Profile data (name, image)
- Preferences:
  - Focus areas
  - UI settings (auto-scroll speed, blend ratio)
- API keys (e.g., OpenAI)
- Bookmarks (references to FeedItems)

## Key Features

### Current Features
- Multi-provider authentication
- Content aggregation from multiple sources:
  - X (Twitter) with real-time engagement metrics
  - HackerNews top stories
  - Reddit posts from tech communities
- Personalized feed based on user preferences
- Bookmarking system
- Responsive design with source-specific UI (e.g., Twitter cards with engagement metrics)

### Future Considerations
- Real-time updates via WebSockets
- Enhanced AI personalization
- Browser extension integration
- Mobile application
- Advanced analytics

## Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- API keys for external services

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Use these credentials
email - user@user.com
pass - User@1234

## Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
# Twitter API v2 Credentials
X_API_KEY=your_api_key
X_API_KEY_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
# Add other service API keys as needed
```

## Rate Limiting
- The application implements rate limiting for Twitter API v2
- Includes automatic backoff and retry logic
- Processes a limited set of accounts to stay within free tier limits

## Deployment
- Configured for Vercel deployment
- Environment-specific configurations
- Build command: `npm run build`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Specify License]
