const Flatted = require('flatted/cjs');

export default class RequestBlockCache {
  constructor(cache, ssrMode) {
    this.rehydrateCache(cache);
    this.ssrMode = ssrMode;
  }

  clear() {
    this.cache.clear();

    return this;
  }

  extract() {
    return Array.from(this.cache.entries());
  }

  has(key) {
    return this.cache.has(key);
  }

  read(key) {
    return this.cache.get(key);
  }

  rehydrateCache(cache) {
    if (cache) {
      if (typeof cache === 'string') {
        const data = Flatted.parse(cache);

        if (Symbol.iterator in Object(data)) {
          this.cache = new Map(data);
          return;
        }
      }
      else if (Array.isArray(cache)) {
        this.cache = new Map(cache);
        return;
      }
    }

    this.cache = new Map();
  }

  restore(cache) {
    this.rehydrateCache(cache);

    return this;
  }

  write(key, value) {
    this.cache.set(key, value);

    return this;
  }
}
