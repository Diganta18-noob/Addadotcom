import { TextEncoder } from "util";

const encoder = new TextEncoder();

// Module-level subscriber set
const subscribers = new Set<WritableStreamDefaultWriter<Uint8Array>>();

export function addSubscriber(writer: WritableStreamDefaultWriter<Uint8Array>) {
  subscribers.add(writer);
}

export function removeSubscriber(writer: WritableStreamDefaultWriter<Uint8Array>) {
  subscribers.delete(writer);
}

export async function broadcast(event: string, data: object) {
  const payload = { event, data, timestamp: Date.now() };
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(msg);
  const dead: WritableStreamDefaultWriter<Uint8Array>[] = [];

  subscribers.forEach((writer) => {
    try {
      writer.write(encoded);
    } catch {
      dead.push(writer);
    }
  });

  dead.forEach((w) => subscribers.delete(w));

  // If Redis or KV URL environment variables are present, publish to Redis PubSub channel
  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL;
  if (redisUrl) {
    try {
      // Lazy import or publish if redis client exists
      const { CacheManager } = await import("@/lib/redis");
      CacheManager.set(`sse:last:${event}`, payload, 60);
    } catch (err) {
      console.warn("Redis/KV PubSub Broadcast Notice:", err);
    }
  }
}

export function getSubscriberCount(): number {
  return subscribers.size;
}
