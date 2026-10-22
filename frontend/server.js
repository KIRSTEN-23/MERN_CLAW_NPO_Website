// Local development server: serve browser modules/assets and proxy API requests to the separate Express backend. Production uses Express instead.
import { createServer, request as httpRequest } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Serve the frontend using Node's built-in modules, without installing a server.
const rootDirectory = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  if (request.url.startsWith('/api/') || request.url.startsWith('/public/uploads/')) {
    const upstream=httpRequest(new URL(request.url, process.env.API_URL || 'http://127.0.0.1:5001'), {method:request.method,headers:request.headers}, result=>{
      response.writeHead(result.statusCode,result.headers);result.pipe(response);
    });
    upstream.on('error',()=>{if(!response.headersSent)response.writeHead(503,{'Content-Type':'application/json'});response.end(JSON.stringify({error:'The CLAW service is unavailable. Please try again shortly.'}));});
    request.pipe(upstream);return;
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    // Only expose the entry HTML, source modules and public assets.
    const allowed =
      pathname === "/" ||
      pathname === "/index.html" ||
      pathname === "/worker" || pathname === "/worker.html" ||
      pathname.startsWith("/src/") ||
      pathname.startsWith("/public/");
    const relativePath = pathname === "/" ? "index.html" : pathname === '/worker' ? 'worker.html' : pathname.slice(1);
    const filePath = resolve(rootDirectory, relativePath);

    if (!allowed || !filePath.startsWith(rootDirectory + sep)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    response.writeHead(
      error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 400,
    );
    response.end("Unable to serve this file");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CLAW frontend: http://localhost:${port}`);
  console.log("Refresh your browser after changing frontend files.");
});
