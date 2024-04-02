import IORedis from "ioredis";

export default class Redis {
  readonly client: IORedis;

  constructor() {
    this.client = new IORedis(process.env.REDIS_URL!);
  }

  async exists(key: string) {
    return this.client.exists(key);
  }

  async set(key: string, value: Record<string, any>) {
    await this.client.set(key, JSON.stringify(value));
  }

  async get<T>(key: string) {
    const data = await this.client.get(key);
    if (data) return JSON.parse(data) as T;
    return null;
  }

  static #instance: Redis;

  static get instance() {
    if (!Redis.#instance) Redis.#instance = new Redis();

    return this.#instance;
  }
}
