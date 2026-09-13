import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 1800, checkperiod: 300 }); // 30 min default

export const cacheMiddleware = (ttlSeconds = 1800) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl || req.url;
  const cachedBody = cache.get(key);

  if (cachedBody) {
    res.setHeader('X-Cache-Lookup', 'HIT');
    return res.json(cachedBody);
  }

  res.setHeader('X-Cache-Lookup', 'MISS');
  const originalSend = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body, ttlSeconds);
    }
    return originalSend(body);
  };
  next();
};