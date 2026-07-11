const redisClient = require('../../config/redis');
const logger = require('../logger/winston');

class RedisQueue {
  constructor() {
    this.workers = {};
  }

  /**
   * Enqueue a job to Redis list or local fallback queue
   */
  async enqueue(queueName, jobData) {
    const key = `queue:${queueName}`;
    const payload = {
      id: `${queueName}_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
      data: jobData,
      createdAt: new Date(),
      retryCount: 0
    };

    try {
      if (redisClient.isOpen) {
        await redisClient.lPush(key, JSON.stringify(payload));
        logger.info(`[QUEUE] Job ${payload.id} enqueued to ${queueName}`);
      } else {
        // Fallback to in-memory async processing in local dev if Redis is down
        logger.warn(`[QUEUE] Redis offline. Processing job ${payload.id} immediately in fallback mode.`);
        setImmediate(() => this._executeJobDirectly(queueName, payload));
      }
      return payload.id;
    } catch (err) {
      logger.error(`[QUEUE ERROR] Failed to enqueue job: ${err.message}`);
      throw err;
    }
  }

  async _executeJobDirectly(queueName, payload) {
    const handler = this.workers[queueName];
    if (handler) {
      try {
        await handler(payload.data);
      } catch (err) {
        logger.error(`[QUEUE FALLBACK FAIL] Job ${payload.id} failed: ${err.message}`);
      }
    }
  }

  /**
   * Register and start a background worker loop for a queue
   */
  process(queueName, handler) {
    this.workers[queueName] = handler;

    if (redisClient.isOpen) {
      logger.info(`[QUEUE] Starting Redis queue worker loop for: ${queueName}`);
      this._runWorkerLoop(queueName, handler);
    }
  }

  async _runWorkerLoop(queueName, handler) {
    const key = `queue:${queueName}`;
    
    // Asynchronous loop
    (async () => {
      while (true) {
        try {
          if (!redisClient.isOpen) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }

          // Use RPOP for non-blocking queue polling
          const jobStr = await redisClient.rPop(key);
          if (!jobStr) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          const payload = JSON.parse(jobStr);
          logger.info(`[QUEUE WORKER] Processing job ${payload.id} from ${queueName}`);

          try {
            await handler(payload.data);
            logger.info(`[QUEUE WORKER] Job ${payload.id} completed.`);
          } catch (err) {
            logger.error(`[QUEUE WORKER ERROR] Job ${payload.id} failed: ${err.message}`);
            if (payload.retryCount < 3) {
              payload.retryCount += 1;
              logger.warn(`[QUEUE WORKER] Retrying job ${payload.id} (Attempt ${payload.retryCount})...`);
              await redisClient.lPush(key, JSON.stringify(payload));
            } else {
              logger.error(`[QUEUE WORKER] Job ${payload.id} exceeded max retries. Failed.`);
            }
          }
        } catch (err) {
          logger.error(`[QUEUE WORKER LOOP ERROR] Queue ${queueName}: ${err.message}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    })();
  }
}

module.exports = new RedisQueue();
