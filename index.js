#!/usr/bin/env node

/**
 * AI-Powered Competitor Intelligence Tracker
 * 
 * A comprehensive system for monitoring competitors, analyzing updates with AI,
 * and delivering strategic insights via Slack and dashboard analytics.
 * 
 * Features:
 * - Real-time competitor monitoring from websites, changelogs, and social media
 * - AI-powered content classification using OpenAI GPT-4o
 * - Automated weekly digest generation and Slack notifications  
 * - Interactive dashboard with analytics and trend visualization
 * - RESTful API for programmatic access to competitive intelligence
 * 
 * Usage:
 *   npm run dev     # Start development server
 *   npm run build   # Build for production
 *   npm start       # Start production server
 * 
 * Architecture:
 * - Backend: Express.js + TypeScript + PostgreSQL with Drizzle ORM
 * - Frontend: React + TanStack Query + Radix UI + Tailwind CSS
 * - AI: OpenAI GPT-4o for content analysis and digest generation
 * - Notifications: Slack Web API for team collaboration
 * - Scheduling: Node-cron for automated scraping and reporting
 */

import { createServer } from 'http';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Display startup banner
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           🚀 AI Competitor Intelligence Tracker              ║
║                                                               ║
║  Monitor competitors • Analyze with AI • Strategic insights  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🌟 Features:
   • Real-time competitor monitoring
   • AI-powered content classification  
   • Automated weekly digest generation
   • Slack notifications and reporting
   • Interactive analytics dashboard

🔧 Environment: ${NODE_ENV}
🚪 Port: ${PORT}
📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Connected' : 'Not configured'}  
📢 Slack: ${process.env.SLACK_BOT_TOKEN ? 'Connected' : 'Not configured'}

`);

async function startServer() {
  try {
    // In development, delegate to the existing dev script
    if (NODE_ENV === 'development') {
      console.log('🔄 Delegating to development server...\n');
      const { spawn } = await import('child_process');
      const devProcess = spawn('npm', ['run', 'dev'], { 
        stdio: 'inherit',
        shell: true 
      });
      
      devProcess.on('exit', (code) => {
        process.exit(code);
      });
      
      return;
    }
    
    // Production: Import the compiled server
    const { default: app } = await import('./dist/index.js');
    
    // Create HTTP server
    const server = createServer(app);
    
    // Start listening
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(`📱 Dashboard: http://0.0.0.0:${PORT}`);
      console.log(`🔗 API: http://0.0.0.0:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        console.log(`🛠️  Development mode - Hot reload enabled`);
      }
      
      console.log(`\n⏰ System Status:`);
      console.log(`   • Automated scraping: ${NODE_ENV === 'production' ? 'Active' : 'Development mode'}`);
      console.log(`   • Weekly digests: ${NODE_ENV === 'production' ? 'Scheduled' : 'Manual trigger'}`);
      console.log(`   • Slack notifications: ${process.env.SLACK_BOT_TOKEN ? 'Enabled' : 'Disabled'}`);
      console.log(`\n🎯 Ready to track competitive intelligence!\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🔄 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (process.argv[1] === __filename) {
  startServer();
}

export default startServer;