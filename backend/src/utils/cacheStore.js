const store = new Map();

const get = (key) => {
  const entry = store.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

const set = (key, value, ttlSeconds = 60) => {
  store.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    value
  });
};

const clear = (prefix) => {
  if (!prefix) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};

module.exports = {
  clear,
  get,
  set
};
