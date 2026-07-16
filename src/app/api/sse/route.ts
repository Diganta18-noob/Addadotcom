import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Set headers for Server-Sent Events
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  let keepAliveTimer: NodeJS.Timeout;

  const sendEvent = async (data: string, eventName?: string) => {
    try {
      if (eventName) {
        await writer.write(encoder.encode(`event: ${eventName}\n`));
      }
      await writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch (e) {
      cleanup();
    }
  };

  const cleanup = () => {
    clearInterval(keepAliveTimer);
    try {
      writer.close();
    } catch {}
  };

  // Start keep-alive heartbeats (every 15s)
  keepAliveTimer = setInterval(async () => {
    await sendEvent("ping", "heartbeat");
  }, 15000);

  // Send initial connected event
  sendEvent(JSON.stringify({ connected: true }), "welcome");

  // Keep connection open
  return new Response(responseStream.readable, { headers });
}
