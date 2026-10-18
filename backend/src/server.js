// Server lifecycle: validate production settings, check database readiness, bind the runtime port and close HTTP/database resources on shutdown.
import { createApp } from "./app.js";
import { openDatabase } from "./database.js";
import { pathToFileURL } from "node:url";

export async function startServer({
  env = process.env,
  open = openDatabase,
  signals = true,
} = {}) {
  // Fail before opening a database connection if production origin configuration is invalid.
  if (env.NODE_ENV === "production") {
    let origin;
    try {
      origin = new URL(env.APP_ORIGIN);
    } catch {
      /* reported below */
    }
    if (
      !origin ||
      origin.protocol !== "https:" ||
      origin.origin !== env.APP_ORIGIN
    ) {
      throw Object.assign(
        new Error(
          "Set APP_ORIGIN to the exact HTTPS website origin, without a trailing slash.",
        ),
        { code: "INVALID_CONFIGURATION" },
      );
    }
  }
  // Azure supplies PORT. Local development falls back to 5001, and tests may request port 0.
  const port = Number(env.PORT || 5001);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw Object.assign(new Error("Invalid PORT."), {
      code: "INVALID_CONFIGURATION",
    });
  const db = await open(env);
  try {
    // Readiness, not migration: an empty dogs table is valid; a missing schema is not.
    await db.prepare("SELECT id FROM dogs LIMIT 1").get();
    const app = createApp(db, {
      production: env.NODE_ENV === "production",
      trustProxyHops: env.TRUST_PROXY_HOPS || "0",
    });
    // Resolve startup only once the HTTP listener succeeds. Binding all interfaces permits Azure ingress.
    const server = await new Promise((resolve, reject) => {
      const listener = app.listen(port, "0.0.0.0", (error) =>
        error ? reject(error) : resolve(listener),
      );
      listener.once("error", reject);
    });
    console.log(`CLAW server listening on port ${server.address().port}`);
    // Reuse one shutdown promise if multiple stop requests arrive, avoiding duplicate pool cleanup.
    let stopping;
    const stop = () =>
      (stopping ||= new Promise((resolve, reject) => {
        // Allow active requests up to ten seconds to finish, then force remaining connections closed.
        const timeout = setTimeout(() => server.closeAllConnections(), 10000);
        timeout.unref();
        server.close(async (error) => {
          clearTimeout(timeout);
          try {
            await db.close();
            if (error) reject(error);
            else resolve();
          } catch (failure) {
            reject(failure);
          }
        });
        // Close idle keep-alive connections immediately rather than waiting for their timeout.
        server.closeIdleConnections();
      }));
    // Handle terminal interruption and hosting shutdown through the same cleanup path.
    if (signals)
      for (const signal of ["SIGINT", "SIGTERM"])
        process.once(signal, () => {
          stop().then(
            () => process.exit(0),
            () => process.exit(1),
          );
        });
    return { server, stop };
  // If readiness or HTTP startup fails, release the already-created pool before reporting failure.
  } catch (error) {
    await db.close();
    throw error;
  }
}

// Importing startServer in tests must not automatically launch a live server.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  startServer().catch((error) => {
    const code = /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code || "")
      ? error.code
      : "STARTUP_ERROR";
    console.error(
      `CLAW startup failed (${code}). Check environment settings, MySQL DNS/network/TLS, credentials and explicit schema setup. No database changes were made.`,
    );
    process.exitCode = 1;
  });
}
