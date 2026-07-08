import { BaseRepository } from "./BaseRepository.js";

export class ApiHitRepository extends BaseRepository {
  constructor({ model, logger: l } = {}) {
    super({ logger: l });
    if (!model) {
      throw new Error("Model is required for ApiHitRepository");
    }
    this.model = model;
  }

  async save(eventData) {
    try {
      const doc = new this.model(eventData);
      await doc.save();

      this.logger.info("API hit saved successfully:", {
        eventId: eventData.eventId,
      });

      return doc;
    } catch (error) {
      if (error && error.code === 11000) {
        // Duplicate key error
        this.logger.warn("Duplicate API hit detected:", {
          eventId: eventData.eventId,
        });
        return null; // or handle as needed
      }
      this.logger.error("Error occurred while saving API hit:", error);
      throw error;
    }
  }

  async find(filters = {}, options = {}) {
    try {
      const { limit = 100, skip = 0, sort = { timestamp: -1 } } = options;
      const hits = await this.model
        .find(filters)
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .lean();

      return hits;
    } catch (error) {
      this.logger.error("Error occurred while finding API hits:", error);
      throw error;
    }
  }

  async count(filters = {}) {
    try {
      const count = await this.model.countDocuments(filters);
      return count;
    } catch (error) {
      this.logger.error("Error occurred while counting API hits:", error);
      throw error;
    }
  }

  async deleteOldHits(beforeDate) {
    try {
      const result = await this.model.deleteMany({
        timestamp: { $lt: beforeDate },
      });
      return result.deletedCount;
    } catch (error) {
      this.logger.error("Error occurred while deleting old API hits:", error);
      throw error;
    }
  }
}
