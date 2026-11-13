import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal adapter config: every page that reads the database is
// force-dynamic, so no incremental cache (KV/R2) is needed at launch.
// If you later add ISR/static caching, see:
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
