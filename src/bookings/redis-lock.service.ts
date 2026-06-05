import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisLockService implements OnModuleDestroy {
  private client?: RedisClientType;
  private connectPromise?: Promise<RedisClientType>;

  private readonly releaseScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    end

    return 0
  `;

  async acquire(
    key: string,
    ttlMs = 10000,
  ): Promise<{ key: string; token: string } | null> {
    const token = randomUUID();
    const client = await this.getClient();
    const result = await client.set(key, token, {
      NX: true,
      PX: ttlMs,
    });

    if (result !== 'OK') {
      return null;
    }

    return { key, token };
  }

  async release(lock: { key: string; token: string }): Promise<void> {
    const client = await this.getClient();
    await client.eval(this.releaseScript, {
      keys: [lock.key],
      arguments: [lock.token],
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  private async getClient(): Promise<RedisClientType> {
    if (this.client?.isOpen) {
      return this.client;
    }

    if (!this.connectPromise) {
      this.client = createClient({
        socket: {
          host:
            process.env.TEST_REDIS_HOST ??
            process.env.REDIS_HOST ??
            '127.0.0.1',
          port: Number(
            process.env.TEST_REDIS_PORT ?? process.env.REDIS_PORT ?? 6380,
          ),
        },
      });
      this.client.on('error', (error) => {
        console.error('Redis lock error:', error.message);
      });
      this.connectPromise = this.client.connect().then(() => {
        if (!this.client) {
          throw new Error('Redis lock client was not created');
        }

        return this.client;
      });
    }

    return await this.connectPromise;
  }
}
