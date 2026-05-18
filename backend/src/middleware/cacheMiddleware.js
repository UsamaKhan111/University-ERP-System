const cacheStore = require("../utils/cacheStore");

const cacheResponse = ({ prefix, ttlSeconds = 60 }) => {
  return (req, res, next) => {
    const cacheKey = `${prefix}:${req.originalUrl}`;
    const cachedPayload = cacheStore.get(cacheKey);

    if (cachedPayload) {
      return res.status(200).json(cachedPayload);
    }

    const originalJson = res.json.bind(res);

    res.json = (payload) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(cacheKey, payload, ttlSeconds);
      }

      return originalJson(payload);
    };

    return next();
  };
};

module.exports = {
  cacheResponse
};
