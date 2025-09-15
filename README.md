# Xeno Mini CRM

A powerful CRM platform for customer segmentation and campaign management.

## Features

- 🔐 Secure REST APIs for data ingestion
- 📊 Dynamic audience segmentation
- 📨 Campaign creation and management
- 🤖 AI-powered features
- 🔒 Google OAuth authentication
- 📈 Real-time campaign analytics

## Tech Stack

- Frontend: Next.js 13+ with TypeScript
- Styling: TailwindCSS
- Backend: Node.js with Express
- Database: MongoDB with Mongoose
- Authentication: NextAuth.js with Google OAuth
- State Management: React Query
- Type Safety: Zod
- AI Integration: OpenAI API

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/xeno-mini-crm.git
```

2. Install dependencies
```bash
cd xeno-mini-crm
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add:
```env
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

The application follows a modern, scalable architecture:

- App Router for server-side rendering and API routes
- MongoDB for flexible document storage
- Pub/sub pattern for asynchronous operations
- AI integration for enhanced features
- Secure authentication flow
- Responsive, mobile-first design

## AI Features

1. Natural Language to Segment Rules
2. AI-Driven Message Suggestions
3. Campaign Performance Summarization
4. Smart Scheduling Suggestions
5. Auto-tagging Campaigns

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when running the development server.

## License

This project is MIT licensed.
