import { createApp } from "../dist/app.js";

const app = createApp();

export default function handler(req, res) {
  if (req.url && req.url.startsWith("/api/index.js")) {
    req.url = req.url.replace(/^\/api\/index\.js/, "") || "/";
  } else if (req.url && req.url.startsWith("/api/index")) {
    req.url = req.url.replace(/^\/api\/index/, "") || "/";
  }
  return app(req, res);
}
