# TaskForge AI

An enterprise-grade, AI-powered project management platform that combines intelligent task automation, real-time collaboration, and predictive analytics.

## 🚀 Features

### Core Features (Phase 1)
- ✅ **User Authentication** - Secure JWT-based auth with refresh tokens
- ✅ **Organizations & Teams** - Multi-tenant architecture
- ✅ **Project Management** - Create and manage projects with custom workflows
- ✅ **Task Management** - Kanban boards, task dependencies, priorities
- ✅ **Comments & Mentions** - Rich text comments with @mentions
- ✅ **File Attachments** - Upload and manage files
- ✅ **Activity Tracking** - Complete audit log

### AI Features (Phase 2)
- 🤖 **AI Task Generation** - Natural language → structured tasks
- 🎯 **Smart Predictions** - Completion dates, risk assessment
- 📊 **Analytics Dashboard** - Burndown charts, velocity tracking
- 💡 **Smart Suggestions** - Assignee recommendations, similar tasks

### Collaboration (Phase 3)
- 👥 **Real-time Presence** - See who's online
- 🖱️ **Live Cursors** - Collaborative editing
- ⚡ **Instant Updates** - WebSocket-powered real-time sync
- 💬 **Typing Indicators** - Know when others are responding

### Advanced Features (Phase 4)
- ⏱️ **Time Tracking** - Automatic and manual time logging
- 🔄 **Custom Workflows** - Visual automation builder
- 🔌 **Integrations** - GitHub, Slack, Google Calendar, Zapier
- 📱 **Mobile Apps** - iOS and Android native apps

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Shadcn/ui
- **State:** Zustand + React Query
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts + D3.js
- **Drag & Drop:** dnd-kit
- **Rich Text:** Tiptap
- **Animations:** Framer Motion

### Backend
- **API Gateway:** Express.js + Kong
- **Services:** Node.js + Express (microservices)
- **AI Engine:** Python + FastAPI
- **Authentication:** Passport.js + JWT
- **Real-time:** Socket.io
- **Queue:** Bull + Redis
- **Validation:** Zod

### Database & Storage
- **Primary DB:** PostgreSQL 15
- **Cache:** Redis 7
- **Vector DB:** Pinecone/Weaviate
- **Search:** Elasticsearch
- **Storage:** AWS S3 / MinIO
- **Time-Series:** TimescaleDB

### Infrastructure
- **Containers:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack
- **Error Tracking:** Sentry

### Mobile
- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **Push:** Firebase Cloud Messaging

## 📁 Project Structure

```
taskforge-ai/
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── mobile/                 # React Native app
│   └── docs/                   # Documentation site
├── services/
│   ├── api-gateway/           # API Gateway (Express)
│   ├── auth-service/          # Authentication service
│   ├── project-service/       # Project management
│   ├── task-service/          # Task management
│   ├── ai-service/            # AI/ML service (Python)
│   ├── collaboration-service/ # Real-time collaboration
│   ├── analytics-service/     # Analytics & reporting
│   └── integration-service/   # Third-party integrations
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── config/                # Shared configs
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Shared utilities
│   └── database/              # Database schemas & migrations
├── infrastructure/
│   ├── docker/                # Docker configs
│   ├── kubernetes/            # K8s manifests
│   └── terraform/             # Infrastructure as Code
├── docs/
│   ├── ARCHITECTURE.md        # System architecture
│   ├── MVP_IMPLEMENTATION_PLAN.md
│   └── API.md                 # API documentation
├── docker-compose.yml         # Local development
├── package.json
├── turbo.json                 # Turborepo config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/taskforge-ai.git
cd taskforge-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start databases with Docker**
```bash
docker-compose up -d postgres redis
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed database (optional)**
```bash
npm run db:seed
```

7. **Start development servers**
```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:4000
- **API Docs:** http://localhost:4000/docs

## 📚 Documentation

- [System Architecture](./ARCHITECTURE.md)
- [MVP Implementation Plan](./MVP_IMPLEMENTATION_PLAN.md)
- [API Documentation](http://localhost:4000/docs)
- [Contributing Guide](./CONTRIBUTING.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Development
```bash
docker-compose up
```

### Staging
```bash
npm run deploy:staging
```

### Production
```bash
npm run deploy:production
```

## 📊 Project Status

### Phase 1: Core Foundation ✅ (Weeks 1-4)
- [x] Authentication
- [x] Organizations & Projects
- [x] Task Management
- [x] Comments & Attachments

### Phase 2: AI Integration ✅ (Weeks 5-8)
- [x] AI Task Generation
- [x] Smart Predictions
- [x] Analytics Dashboard

### Phase 3: Real-time Collaboration ✅ (Weeks 9-12)
- [x] WebSocket Infrastructure
- [x] Live Presence
- [x] Project Chat

### Phase 4: Advanced Features 📅 (Weeks 13-16)
- [ ] Time Tracking
- [ ] Custom Workflows
- [ ] Integrations
- [ ] Mobile Apps

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [OpenAI](https://openai.com/)
- [Socket.io](https://socket.io/)

## 📞 Support

- **Email:** support@taskforge.ai
- **Discord:** [Join our community](https://discord.gg/taskforge)
- **Twitter:** [@taskforgeai](https://twitter.com/taskforgeai)

---

Built with ❤️ by the TaskForge team
