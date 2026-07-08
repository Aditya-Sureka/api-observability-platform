# 📅 Day 6 — Designing a Fault-Tolerant Backend

## 🎯 Goal

Today's milestone focused on making the backend resilient to failures.

Instead of assuming external services are always available, I implemented patterns commonly used in production systems to handle failures gracefully and improve overall reliability.

---

## ✅ What I Built

### Reliability Patterns

- Circuit Breaker
- Retry Strategy
- Exponential Backoff
- Random Jitter
- Event Producer
- Channel Manager

### Architecture

- Factory Method
- Dependency Injection
- Service Layer
- Controller Layer
- Dependency Container
- Modular Routers

---

## 🧠 Key Concepts Learned

### Circuit Breaker

Stops repeatedly calling an unhealthy dependency after consecutive failures.

Instead of continuously sending failing requests, the system temporarily opens the circuit and allows the dependency time to recover.

---

### Retry Strategy

Some failures are temporary.

Retrying an operation after a delay often succeeds without manual intervention.

---

### Exponential Backoff + Jitter

Retrying immediately can overload struggling services.

Exponential Backoff gradually increases retry intervals, while Jitter introduces randomness to prevent synchronized retry storms.

---

### Event-Driven Architecture

Instead of tightly coupling services together, components communicate through events using RabbitMQ.

This allows services to evolve independently while improving scalability and resilience.

---

### Delivery Guarantees

Messages should never disappear silently.

Using queues allows failed operations to be retried instead of losing critical events.

---

## 💡 Key Learnings

One lesson became very clear today:

Production systems aren't built to avoid failures.

They're built to survive failures.

Reliability isn't achieved by writing perfect code—it's achieved by designing systems that recover gracefully when things inevitably go wrong.

---

## 🚀 Next Step

Start implementing the monitoring pipeline where client requests flow through the resilient event-driven architecture.