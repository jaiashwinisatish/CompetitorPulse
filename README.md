<div align="center">

# 🎯 CompetitorPulse

### *Stay Ahead of Your Competition with AI-Powered Intelligence*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

*Created by [Xenonesis](https://github.com/Xenonesis)*

</div>

---

## 🚀 Overview

**CompetitorPulse** is a cutting-edge competitor intelligence platform that automatically monitors, analyzes, and categorizes your competitors' activities across multiple channels. Powered by AI and designed for modern teams, it transforms raw competitor data into actionable insights.

### ✨ Key Highlights
- **Real-time monitoring** across websites, social media, and app stores
- **AI-powered classification** of competitor updates by impact and category
- **Intelligent notifications** via Slack integration
- **Beautiful, responsive dashboard** built with modern web technologies
- **Zero-config setup** with sensible defaults

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Node.js + Express + TypeScript | RESTful API server |
| **Database** | PostgreSQL + Drizzle ORM | Data persistence |
| **Frontend** | React + TypeScript + Vite | Modern SPA |
| **Styling** | Tailwind CSS + shadcn/ui | Beautiful, responsive UI |
| **AI Engine** | OpenAI GPT-4 | Content classification |
| **Scheduler** | Node-cron | Automated monitoring |
| **Deployment** | Docker + Railway | Production-ready |

### System Design
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Scraper   │───▶│  AI Classifier   │───▶│   Database      │
│   Scheduler     │    │  (OpenAI GPT)    │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Slack Bot     │    │   REST API       │    │   React App     │
│   Notifications │◄───┤   (Express)      │◄───┤   Dashboard     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🎯 Features

### 🔍 **Multi-Channel Monitoring**
- **Website & Changelog Tracking** - Monitor competitor websites and changelog pages
- **Social Media Intelligence** - Track Twitter/X, LinkedIn, and other platforms
- **App Store Monitoring** - Keep tabs on app updates and reviews
- **RSS Feed Aggregation** - Subscribe to competitor blogs and news feeds

### 🤖 **AI-Powered Analysis**
- **Smart Classification** - Automatically categorize updates by type (feature, pricing, marketing, etc.)
- **Impact Assessment** - AI determines the business impact of each change
- **Sentiment Analysis** - Understand the tone and implications of competitor communications
- **Trend Detection** - Identify patterns in competitor behavior over time

### 📊 **Intelligent Dashboard**
- **Real-time Metrics** - Live updates on competitor activities
- **Visual Analytics** - Charts and graphs for easy data interpretation
- **Custom Views** - Filter and sort data by competitor, category, or time period
- **Export Capabilities** - Download reports in various formats

### 🔔 **Smart Notifications**
- **Slack Integration** - Get instant notifications in your team's Slack
- **Customizable Alerts** - Set up rules for different types of updates
- **Digest Emails** - Daily/weekly summaries of all competitor activities
- **Priority Filtering** - Only get notified about high-impact changes

### ⚙️ **Easy Management**
- **Source Management** - Simple UI for adding and configuring monitoring sources
- **Competitor Profiles** - Organize and manage competitor information
- **Bulk Operations** - Update multiple sources at once
- **Team Collaboration** - Share insights with your team

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key
- Slack Bot Token (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Xenonesis/CompetitorPulse.git
cd CompetitorPulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start the development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/competitorpulse"

# OpenAI (Required for AI classification)
OPENAI_API_KEY="your-openai-api-key"

# Slack (Optional)
SLACK_BOT_TOKEN="your-slack-bot-token"
SLACK_CHANNEL_ID="your-slack-channel-id"

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## 📖 Usage Guide

### Adding Your First Competitor
1. **Navigate to the Dashboard** - Open http://localhost:5000
2. **Add a Competitor** - Click "Add Competitor" and enter details
3. **Configure Sources** - Add websites, social media, or RSS feeds to monitor
4. **Set Monitoring Frequency** - Choose how often to check for updates
5. **Enable Notifications** - Connect Slack for real-time alerts

### Understanding the Dashboard
- **Overview Tab**: High-level metrics and recent activities
- **Sources Tab**: Manage all monitoring sources
- **Updates Tab**: Detailed view of all competitor changes
- **Classifications Tab**: AI-categorized insights
- **Settings Tab**: Configure notifications and preferences

### Interpreting AI Classifications
- **Feature Updates**: New product features or enhancements
- **Pricing Changes**: Price modifications, new plans, or discounts
- **Marketing Campaigns**: New marketing initiatives or messaging
- **Team Changes**: Key hires, departures, or organizational changes
- **Partnership Announcements**: New collaborations or integrations

---

## 🛠️ Development

### Project Structure
```
CompetitorPulse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/               # Express backend
│   ├── services/        # Business logic services
│   ├── storage.ts       # Database operations
│   └── routes.ts        # API endpoints
├── shared/              # Shared types and schemas
└── docs/               # Documentation
```

### Available Scripts
```bash
# Development
npm run dev          # Start both frontend and backend
npm run dev:server   # Start only the backend
npm run dev:client   # Start only the frontend

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database with sample data

# Production
npm run build        # Build for production
npm run start        # Start production server
```

### API Documentation
All API endpoints are RESTful and follow standard conventions:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/competitors` | GET, POST | Manage competitors |
| `/api/sources` | GET, POST, PUT, DELETE | Manage monitoring sources |
| `/api/updates` | GET | Fetch competitor updates |
| `/api/classifications` | GET, POST | AI classifications |
| `/api/digests` | GET | Generated digests |
| `/api/system/status` | GET | System health check |

---

## 🐳 Docker Deployment

### Using Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/competitorpulse
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: competitorpulse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Build and Run
```bash
# Build the image
docker build -t competitorpulse .

# Run with Docker Compose
docker-compose up -d
```

---

## 🚢 Production Deployment

### Railway (Recommended)
1. **Connect Repository** - Link your GitHub repo
2. **Add Environment Variables** - Configure in Railway dashboard
3. **Deploy** - Automatic deployments on push to main

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Heroku (Alternative)
```bash
# Install Heroku CLI
npm i -g heroku

# Deploy
heroku create competitorpulse
git push heroku main
```

---

## 🔧 Configuration

### Monitoring Sources
Configure different types of sources:

```javascript
// Example source configuration
{
  type: "website",
  url: "https://competitor.com/changelog",
  frequency: "daily",
  selectors: {
    title: ".post-title",
    content: ".post-content",
    date: ".post-date"
  }
}
```

### AI Classification Rules
Customize how the AI classifies updates:

```javascript
// Custom classification rules
{
  categories: ["feature", "pricing", "marketing", "team", "partnership"],
  impactLevels: ["low", "medium", "high", "critical"],
  keywords: {
    pricing: ["price", "cost", "plan", "subscription", "discount"],
    feature: ["launch", "release", "new", "update", "improvement"]
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests: `npm run test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

---

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Update frequency tracking**
- **Source reliability metrics**
- **Classification accuracy**
- **User engagement analytics**

### Health Checks
```bash
# Check system status
curl http://localhost:5000/api/system/status

# Monitor logs
npm run logs
```

---

## 🔒 Security

### Best Practices
- **Environment variable encryption**
- **API key rotation**
- **Rate limiting** on all endpoints
- **Input validation** and sanitization
- **HTTPS enforcement** in production

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## 📞 Support

### Getting Help
- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/Xenonesis/CompetitorPulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Xenonesis/CompetitorPulse/discussions)
- **Discord**: Join our community server

### Commercial Support
For enterprise features and support, contact: [support@competitorpulse.com](mailto:support@competitorpulse.com)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-powered classification
- **shadcn/ui** for beautiful React components
- **Drizzle ORM** for type-safe database operations
- **Tailwind CSS** for utility-first styling
- **Vercel** for hosting inspiration

---

<div align="center">

**⭐ Star this repo if you find it helpful!
