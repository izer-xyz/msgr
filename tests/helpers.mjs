export class MemoryKV {
  constructor() {
    this.values = new Map();
    this.puts = [];
    this.deletes = [];
  }

  async get(key, type) {
    if (Array.isArray(key)) {
      return Promise.all(
        key.map(async (item) => [item, await this.get(item, type)]),
      );
    }

    const value = this.values.get(key) ?? null;
    if (value === null || type !== "json") return value;
    return JSON.parse(value);
  }

  async put(key, value, options = {}) {
    this.puts.push({ key, value, options });
    this.values.set(key, String(value));
  }

  async delete(key) {
    this.deletes.push(key);
    this.values.delete(key);
  }

  async list({ prefix = "" } = {}) {
    return {
      keys: [...this.values.keys()]
        .filter((key) => key.startsWith(prefix))
        .sort()
        .map((name) => ({ name })),
    };
  }
}

export function jsonRequest(url, body, headers = {}) {
  return new Request(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}