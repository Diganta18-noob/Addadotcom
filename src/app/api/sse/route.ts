import { NextRequest } from "next/server";
import { addSubscriber, removeSubscriber } from "@/lib/sse-emitter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  addSubscriber(writer);

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  // Initial welcome event
  try {
    await writer.write(encoder.encode(`event: welcome\ndata: {"connected":true}\n\n`));
  } catch {
    removeSubscriber(writer);
  }

  // Heartbeat timer every 25s to prevent proxy timeouts
  const heartbeat = setInterval(async () => {
    try {
      await writer.write(encoder.encode(`: heartbeat\n\n`));
    } catch {
      clearInterval(heartbeat);
      removeSubscriber(writer);
    }
  }, 25000);

  req.signal.addEventListener("abort", () => {
    clearInterval(heartbeat);
    removeSubscriber(writer);
    try {
      writer.close();
    } catch {}
  });

  return new Response(stream.readable, { headers });
}
