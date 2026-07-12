const { createClient } = require('redis');
const logger = require('../common/logger/winston');

const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URI,
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 3000);
      return delay;
    }
  }
});

let isLimitExceeded = false;

redisClient.on('error', (err) => {
  if (err.message && (
    err.message.includes('max requests limit exceeded') ||
    err.message.includes('TimeoutError') ||
    err.name === 'TimeoutError' ||
    err.message.includes('ETIMEDOUT') ||
    err.message.includes('ECONNREFUSED')
  )) {
    if (!isLimitExceeded) {
      isLimitExceeded = true;
      logger.warn('[REDIS ERROR] Redis connection failed or limit exceeded. Disabling Redis and falling back to in-memory mode.');
    }
  } else {
    logger.error('[REDIS CLIENT ERROR]', err);
  }
});

redisClient.on('connect', () => {
  logger.info('Redis client initiating connection...');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected and ready.');
});

// Proxy client to intercept properties and commands, providing seamless fallback
const clientProxy = new Proxy(redisClient, {
  get(target, prop, receiver) {
    if (prop === 'isLimitExceeded') {
      return isLimitExceeded;
    }
    if (prop === 'setIsLimitExceeded') {
      return (val) => { isLimitExceeded = val; };
    }
    if (prop === 'isOpen') {
      return isLimitExceeded ? false : target.isOpen;
    }
    if (prop === 'isReady') {
      return isLimitExceeded ? false : target.isReady;
    }

    const value = Reflect.get(target, prop, receiver);

    if (typeof value === 'function') {
      return function (...args) {
        if (isLimitExceeded && prop !== 'connect' && prop !== 'disconnect' && prop !== 'quit' && prop !== 'on') {
          throw new Error('Redis client is offline due to rate limit exhaustion');
        }

        if (prop === 'connect') {
          return (async () => {
            try {
              const res = await value.apply(target, args);
              // Run a test command to verify if Upstash is over quota or timing out
              try {
                await Promise.race([
                  target.get('__test_rate_limit__'),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('TimeoutError')), 2000))
                ]);
              } catch (pingErr) {
                if (pingErr.message && (
                  pingErr.message.includes('max requests limit exceeded') ||
                  pingErr.message.includes('TimeoutError') ||
                  pingErr.name === 'TimeoutError' ||
                  pingErr.message.includes('ETIMEDOUT') ||
                  pingErr.message.includes('ECONNREFUSED')
                )) {
                  isLimitExceeded = true;
                  logger.warn('[REDIS] Redis rate limit or timeout during connection test. Falling back to in-memory mode.');
                }
              }
              return res;
            } catch (err) {
              if (err.message && (
                err.message.includes('max requests limit exceeded') ||
                err.message.includes('TimeoutError') ||
                err.name === 'TimeoutError' ||
                err.message.includes('ETIMEDOUT') ||
                err.message.includes('ECONNREFUSED')
              )) {
                isLimitExceeded = true;
                logger.warn('[REDIS] Redis rate limit or timeout during connect. Falling back to in-memory mode.');
              }
              throw err;
            }
          })();
        }

        try {
          const result = value.apply(target, args);
          if (result instanceof Promise) {
            return result.catch((err) => {
              if (err.message && (
                err.message.includes('max requests limit exceeded') ||
                err.message.includes('TimeoutError') ||
                err.name === 'TimeoutError' ||
                err.message.includes('ETIMEDOUT') ||
                err.message.includes('ECONNREFUSED')
              )) {
                if (!isLimitExceeded) {
                  isLimitExceeded = true;
                  logger.warn('[REDIS] Redis rate limit or timeout detected. Falling back to in-memory mode.');
                }
                throw new Error('Redis client is offline due to rate limit exhaustion');
              }
              throw err;
            });
          }
          return result;
        } catch (err) {
          if (err.message && (
            err.message.includes('max requests limit exceeded') ||
            err.message.includes('TimeoutError') ||
            err.name === 'TimeoutError' ||
            err.message.includes('ETIMEDOUT') ||
            err.message.includes('ECONNREFUSED')
          )) {
            if (!isLimitExceeded) {
              isLimitExceeded = true;
              logger.warn('[REDIS] Redis rate limit or timeout detected. Falling back to in-memory mode.');
            }
            throw new Error('Redis client is offline due to rate limit exhaustion');
          }
          throw err;
        }
      };
    }

    return value;
  }
});

module.exports = clientProxy;

