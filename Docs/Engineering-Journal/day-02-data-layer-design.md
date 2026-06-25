# Day 2 - Designing the Data Layer

## Goal

Build the foundation for storing and managing application data.

Rather than jumping straight into CRUD operations, I focused on designing a scalable data model that would support the monitoring platform as it grows.

---

## What I Built

* User schema
* Client schema
* API Key schema
* API Hit schema

I also implemented:

* Password validation
* Schema methods
* MongoDB middleware (pre/post hooks)
* Database indexes
* Response formatter utility
* Custom error handling architecture

---

## Design Decisions

### Why Separate Schemas?

Each schema has a single responsibility.

* Users manage authentication.
* Clients represent monitored applications.
* API Keys authenticate requests.
* API Hits capture monitoring events.

Keeping them separate improves maintainability and allows the system to evolve independently.

---

### Referencing vs Embedding

Instead of embedding everything into a single document, I used references where relationships naturally exist.

This reduces duplication and keeps documents manageable as the dataset grows.

---

### Why Indexing?

Monitoring systems generate a large number of events.

Proper indexes help maintain fast query performance as the volume of data increases.

---

## Key Learnings

A good backend isn't only about writing APIs.

Designing the data model correctly has a significant impact on performance, maintainability, and scalability.

---

## Next Step

Implement authentication and API key management on top of the data layer.
