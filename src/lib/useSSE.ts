"use client";

import { useEffect, useRef } from "react";

export type SSEHandlerMap = Record<string, (data: any) => void>;

export function useSSE(handlers: SSEHandlerMap) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/sse");

      eventSource.onopen = () => {
        // Connected to SSE stream
      };

      Object.keys(handlersRef.current).forEach((eventName) => {
        eventSource?.addEventListener(eventName, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (handlersRef.current[eventName]) {
              handlersRef.current[eventName](data);
            }
          } catch (err) {
            console.error(`Error parsing SSE data for event ${eventName}:`, err);
          }
        });
      });

      eventSource.onerror = (err) => {
        console.warn("SSE connection interrupted, retrying...", err);
      };
    } catch (err) {
      console.error("Failed to establish SSE connection:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
}
