# Changelog

All notable changes to the CompetitorPulse project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of CompetitorPulse
- Real-time competitor monitoring system
- Automated source tracking and classification
- Slack integration for notifications
- Dashboard with comprehensive analytics
- Source management interface
- Competitor profile management
- Digest generation system

### Features
- **Multi-source monitoring**: Track competitors across websites, social media, app stores, and RSS feeds
- **AI-powered classification**: Automatically categorize updates by type and impact
- **Real-time notifications**: Get instant alerts for important competitor changes
- **Comprehensive dashboard**: Visual overview of all competitor activities
- **Source management**: Easy addition and configuration of monitoring sources
- **Digest system**: Automated daily/weekly summaries of competitor activities
- **Slack integration**: Receive notifications directly in your team's Slack channel

### Technical Stack
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React with TypeScript, Vite
- **AI Integration**: OpenAI GPT for content classification
- **Scheduler**: Node-cron for automated monitoring
- **Styling**: Tailwind CSS with shadcn/ui components

### API Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/updates/recent` - Recent competitor updates
- `GET /api/sources` - Manage monitoring sources
- `GET /api/competitors` - Competitor profiles
- `GET /api/digests/latest` - Latest digest information
- `GET /api/system/status` - System health status

### Configuration
- Environment variables for database connection
- Slack bot token configuration
- OpenAI API key for AI classification
- Configurable monitoring frequencies

## [1.0.0] - 2024-07-21
### Added
- Initial release
- Basic competitor monitoring functionality
- Source management system
- Dashboard with key metrics
- Classification system for updates
- Digest generation
- Slack notifications
- RESTful API
- React frontend with modern UI
