export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  const status = Number(error.status || 500);
  const message = status >= 500 && status !== 503 ? "Something went wrong on the server." : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ ok: false, error: message });
}
