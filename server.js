const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Serve frontend
app.use(express.static(path.join(__dirname, "acidic-frontend")));

// Proxy API requests to the backend server (currently implemented in `acidic-backend/uploads/server.js`)
// This prevents the frontend SPA catch-all from hijacking /api/* routes.
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_API_URL,
    changeOrigin: true,
    logLevel: "warn",
  })
);

// Proxy uploads (backend serves them from /uploads)
const BACKEND_UPLOADS_URL = process.env.BACKEND_UPLOADS_URL || "http://localhost:5000";
app.use(
  "/uploads",
  createProxyMiddleware({
    target: BACKEND_UPLOADS_URL,
    changeOrigin: true,
    logLevel: "warn",
  })
);

// SPA catch-all (only for non-API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "acidic-frontend/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  console.log("Proxying /api to:", BACKEND_API_URL);
});
