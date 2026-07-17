// ─── Real-Time Event Dispatcher ────────────────────────────────────
// Dispatches live updates for kitchen, order tracking, and floor layout

export type EventType = "ORDER_CREATED" | "ORDER_STATUS_CHANGED" | "TABLE_STATUS_CHANGED" | "RESERVATION_CREATED";

export interface SystemEventPayload {
  type: EventType;
  id: string;
  timestamp: number;
  data: any;
}

type EventListener = (payload: SystemEventPayload) => void;

const listeners = new Set<EventListener>();

export class EventHub {
  /**
   * Subscribe to real-time system events.
   */
  static subscribe(listener: EventListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Broadcast an event to all active subscribers.
   */
  static emit(type: EventType, id: string, data: any = {}): void {
    const payload: SystemEventPayload = {
      type,
      id,
      timestamp: Date.now(),
      data,
    };

    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error("Error in event listener:", err);
      }
    });
  }
}
