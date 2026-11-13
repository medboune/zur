// Mock Resend endpoint for local end-to-end verification of team notifications.
// Captures every POST to /tmp/mock-mail.jsonl and returns a fake Resend id.
// Usage: bun scripts/mock-mail-server.ts   (listens on 127.0.0.1:3099)
import { appendFile } from "fs/promises";

const CAPTURE_FILE = "/tmp/mock-mail.jsonl";

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 3099,
  async fetch(req) {
    const auth = req.headers.get("authorization") ?? "(none)";
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = { error: "unparseable body" };
    }
    const record = { at: new Date().toISOString(), auth, body };
    await appendFile(CAPTURE_FILE, JSON.stringify(record) + "\n");
    console.log(`captured: ${JSON.stringify(body.subject ?? "?")}`);
    return Response.json({ id: "mock-email-001" });
  },
});

console.log(`mock mail server listening on http://${server.hostname}:${server.port}`);
