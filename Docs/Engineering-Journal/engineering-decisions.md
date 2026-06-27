# Engineering Decisions

## Why RabbitMQ?

Monitoring operations generate asynchronous workloads.

RabbitMQ allows the API service to publish jobs while worker services process them independently.

Benefits:

* Decoupled architecture
* Improved scalability
* Better fault tolerance

---

## Why PostgreSQL?

Application metadata is relational in nature.

Examples:

* Users
* Monitors
* Configurations

PostgreSQL provides strong consistency and relational modeling.

---

## Why MongoDB?

Monitoring logs can become high-volume and semi-structured.

MongoDB provides flexibility and efficient storage for monitoring results.

---

## Why Docker?

Docker ensures every service runs consistently across development and deployment environments.

Benefits:

* Reproducible setup
* Simplified onboarding
* Infrastructure parity

---

## Why Separate API and Consumer Services?

Separating responsibilities improves maintainability and scalability.

The API service handles requests.

The Consumer service processes monitoring jobs independently.

# Update — Day 2

---

## Why MongoDB for Monitoring Data?

Monitoring events are high-volume and semi-structured.

MongoDB allows flexible schemas while handling large numbers of write operations efficiently.

---

## Why Separate Collections?

Instead of embedding everything into a single document:

User
→ Client
→ API Key
→ API Hit

each entity has its own responsibility.

Benefits:

* Easier maintenance
* Better scalability
* Cleaner relationships

---

## Why Database Indexes Early?

Indexes become increasingly difficult to retrofit after datasets grow.

Adding them during schema design encourages thinking about query patterns from the beginning.

---

## Why Centralized Error Handling?

Every endpoint should return responses in a predictable format.

Centralizing error handling:

* Reduces duplicate code
* Improves debugging
* Makes API responses consistent

---

## Why Response Formatter?

Clients consuming the API should always receive responses with a consistent structure.

Instead of:

```json
{ "message": "Success" }
```

and

```json
{ "status": true }
```

every endpoint follows one standard response format.

This makes frontend integration simpler and keeps the API predictable.

-----------------------------------------------------

# Update — Day 3

---

## Why Graceful Shutdown?

Applications rarely stop unexpectedly by choice.

Graceful shutdown allows the server to:

* Finish in-flight requests
* Close database connections
* Close RabbitMQ channels
* Prevent data corruption

This becomes increasingly important in containerized and production environments.

---

## Why Centralized Error Handling?

Instead of handling errors in every route independently, the application uses a single middleware responsible for formatting and returning errors consistently.

Benefits:

* Cleaner route handlers
* Consistent API responses
* Easier debugging
* Better maintainability

---

## Why Dockerize the Application?

Running the application inside Docker ensures the same runtime environment across local development and deployment.

It also simplifies onboarding and infrastructure management.

---

## Why Initialize Services During Startup?

Instead of connecting to databases on every request, external services are initialized during application startup.

Benefits:

* Faster request handling
* Early detection of configuration issues
* Centralized lifecycle management
