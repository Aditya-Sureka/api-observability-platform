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
