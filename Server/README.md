# API Monitoring & Alerting System

A real-time API monitoring and alerting system designed for microservices architecture. This project tracks API health, performance metrics, and provides intelligent alerting capabilities with asynchronous message queue processing.

## 📋 Overview

This system monitors API endpoints, collects performance metrics, and triggers alerts based on configurable thresholds. It uses a microservices approach with separate services for request handling and asynchronous processing.

## 🏗️ Architecture

```
┌─────────────────┐
│   API Requests  │
└────────┬────────┘
         │
    ┌────▼────────────────────┐
    │   API Server (Port 5000) │
    │   - Express.js           │
    │   - JWT Auth             │
    │   - Rate Limiting        │
    └────┬────────────┬────────┘
         │            │
    ┌────▼───┐  ┌────▼──────────┐
    │ MongoDB │  │  PostgreSQL   │
    │ (NoSQL) │  │ (Relational)  │
    └─────────┘  └───────────────┘
         │
    ┌────▼──────────────┐
    │   RabbitMQ Queue  │
    │   (api_hits)      │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │  Consumer Service │
    │  (Background Job) │
    └───────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express.js 5.2
- **Language:** JavaScript (ES Modules)

### Databases
- **PostgreSQL 15** - Relational data (structured metrics, configurations)
- **MongoDB 6** - Document storage (flexible schema for events/logs)

### Message Queue
- **RabbitMQ 3** - Asynchronous message processing with dead-letter queue (DLQ)

### Security & Middleware
- **Helmet** - HTTP security headers
- **JWT** - Authentication (jsonwebtoken)
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting per IP

### Logging & Monitoring
- **Winston** - Structured logging
- **pgAdmin** - PostgreSQL web UI
- **RabbitMQ Management UI** - Queue monitoring

### Utilities
- **Mongoose** - MongoDB ODM
- **pg** - PostgreSQL driver
- **amqplib** - RabbitMQ client
- **dotenv** - Environment configuration
- **uuid** - Unique identifier generation

## 📦 Prerequisites

- **Docker & Docker Compose** (for containerized setup)
- **Node.js 22+** (for local development)
- **npm** (Node package manager)
- Git (optional, for version control)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd API-Monitoring/Server
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Or create `.env` with:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Verify services are running**
   - API Server: http://localhost:5000
   - pgAdmin: http://localhost:8080 (admin@pgadmin.org / admin)
   - RabbitMQ UI: http://localhost:15672 (api_user / api_password)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/api_monitoring_db
   MONGO_DB_NAME=api_monitoring_db
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=api_monitoring_db
   PG_USER=postgres
   PG_PASSWORD=password
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   RABBITMQ_QUEUE=api_hits
   JWT_SECRET=secure_jwt
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=1000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start consumer (in another terminal)**
   ```bash
   npm run processor
   ```

## 📁 Project Structure

```
Server/
├── src/
│   ├── server.js                    # Main API server entry point
│   └── shared/
│       └── config/
│           ├── index.js             # Global configuration loader
│           ├── mongo.js             # MongoDB connection manager
│           ├── postgres.js          # PostgreSQL connection manager
│           ├── rabbitmq.js          # RabbitMQ connection & channel setup
│           └── logger.js            # Winston logger configuration
├── scripts/
│   └── init-postgres.sql            # PostgreSQL schema initialization
├── docker-compose.yml               # Service orchestration
├── Dockerfile                       # API server container image
├── Dockerfile.consumer              # Consumer service container image
├── package.json                     # Dependencies & scripts
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## 🔧 Available NPM Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Start consumer/processor service
npm run processor

# Initialize system
npm run init

# Generate .env configuration
npm run init:env
```

## 🗄️ Services Overview

### API Server (`api-app`)
- Listens on port 5000
- Handles HTTP requests
- Authenticates with JWT
- Applies rate limiting
- Publishes metrics to RabbitMQ queue
- Reads/writes to MongoDB and PostgreSQL

### Consumer Service (`consumer`)
- Background worker process
- Reads messages from RabbitMQ queue `api_hits`
- Processes metrics asynchronously
- Writes to databases
- Handles failed messages via Dead Letter Queue (DLQ)

### PostgreSQL (`postgres`)
- Port: 5432
- User: api_monitoring_user
- Database: api_monitoring_db
- Stores structured data, configurations, and metrics

### MongoDB (`mongo`)
- Port: 27017
- Database: api_monitoring_db
- Stores document-based logs and flexible event data

### RabbitMQ (`rabbitmq`)
- AMQP Port: 5672
- Management UI: http://localhost:15672
- Default credentials: api_user / api_password
- Main queue: `api_hits`
- Dead Letter Queue: `api_hits.dlq`

### pgAdmin (`pgadmin`)
- Web UI: http://localhost:8080
- Admin email: admin@pgadmin.org
- Password: admin
- Manage PostgreSQL databases visually

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment (development/production) |
| PORT | 5000 | API server port |
| MONGO_URI | mongodb://localhost:27017/api_monitoring_db | MongoDB connection string |
| MONGO_DB_NAME | api_monitoring_db | MongoDB database name |
| PG_HOST | localhost | PostgreSQL host |
| PG_PORT | 5432 | PostgreSQL port |
| PG_DATABASE | api_monitoring_db | PostgreSQL database |
| PG_USER | postgres | PostgreSQL user |
| PG_PASSWORD | password | PostgreSQL password |
| RABBITMQ_URL | amqp://localhost:5672 | RabbitMQ connection URL |
| RABBITMQ_QUEUE | api_hits | Queue name for API metrics |
| JWT_SECRET | secure_jwt | Secret key for JWT tokens |
| JWT_EXPIRES_IN | 24h | JWT token expiration |
| RATE_LIMIT_WINDOW_MS | 900000 | Rate limit window in milliseconds |
| RATE_LIMIT_MAX | 1000 | Max requests per window per IP |

## 🔌 Database Schema

### PostgreSQL
Initialize schema by running SQL scripts in `scripts/init-postgres.sql` during container startup.

### MongoDB
Collections are created on-demand by the application.

## 🚢 Deployment

### Docker
The project is fully containerized. Build and run:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api-app

# Stop services
docker-compose down
```

### Health Checks
- API Server: GET /health (port 5000)
- PostgreSQL: Health check via pg_isready
- RabbitMQ: Health check via rabbitmq-diagnostics

## 📝 Logging

Logs are written to the `logs/` directory:
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All logs
- Console output in development mode (with colors)

## 🔐 Security Considerations

- JWT authentication for API requests
- Password hashing with bcryptjs
- Helmet middleware for HTTP security headers
- Rate limiting to prevent abuse
- Environment variables for sensitive data (never commit .env)
- PostgreSQL password protection
- RabbitMQ credentials management

## 📊 Monitoring

- **pgAdmin**: Database management interface (http://localhost:8080)
- **RabbitMQ UI**: Queue monitoring (http://localhost:15672)
- **Application Logs**: `logs/` directory
- **Health Endpoints**: Available on API server

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker containers
docker-compose ps

# View service logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose up --build
```

### Database connection errors
- Verify PostgreSQL is running and credentials match
- Check MongoDB connection string in .env
- Ensure ports 5432, 27017, 5672 are not blocked

### RabbitMQ connection issues
- Access Management UI: http://localhost:15672
- Verify credentials: api_user / api_password
- Check RabbitMQ container logs

## 🤝 Contributing

(To be updated)

## 📚 Next Steps

- [ ] Implement API server routes (src/server.js)
- [ ] Complete PostgreSQL schema (scripts/init-postgres.sql)
- [ ] Implement consumer service logic
- [ ] Add authentication endpoints
- [ ] Create API documentation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline

## 📄 License

ISC

## ✉️ Support

For issues or questions, please open an issue in the repository.

