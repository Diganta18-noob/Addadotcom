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

export function broadcast(event: string, data: object) {
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
}

export function getSubscriberCount(): number {
  return subscribers.size;
}
