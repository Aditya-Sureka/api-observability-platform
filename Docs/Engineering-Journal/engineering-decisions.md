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

-----------------------------------------------------------------------------------------------------------------------
# Update — Day 4

---

## Why Repository Pattern?

Repositories isolate database logic from business logic.

Benefits:

- Easier testing
- Cleaner services
- Database implementation can change without affecting business logic

---

## Why Service Layer?

Business rules belong inside services.

Controllers should only coordinate requests and responses.

---

## Why Dependency Injection?

Dependency Injection removes tight coupling between components.

Instead of creating dependencies internally, they are provided externally.

Benefits:

- Better testing
- Easier maintenance
- Loose coupling

---

## Why Middleware?

Authentication, authorization and validation are cross-cutting concerns.

Moving them into middleware keeps controllers focused only on request handling.


-------------------------------------------------------------------------------------------------------

# Update — Day 5

---

## Why Separate Client and User?

Users represent people.

Clients represent applications or services.

One user can own multiple clients, and each client can have its own API keys.

Separating these concepts keeps authentication independent from monitored applications.

---

## Why API Keys?

API keys provide a lightweight way for client applications to authenticate requests without exposing user credentials.

This is especially useful for server-to-server communication.

---

## Why Use `.populate()`?

MongoDB stores relationships using ObjectIds.

Using `.populate()` allows related documents to be fetched without writing multiple manual queries, keeping the code cleaner and easier to maintain.

---

## Why Continue Using Dependency Injection?

As more modules are added, Dependency Injection keeps components loosely coupled and easier to test, while reducing direct dependencies between services.
