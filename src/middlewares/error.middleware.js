/**
 * Error response structure for consistent API responses
 */
function createErrorResponse(message, code = "INTERNAL_ERROR", status = 500) {
  return {
    ok: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  res.status(404).json(createErrorResponse(message, "NOT_FOUND", 404));
}

/**
 * Global error handler middleware
 * Should be the last middleware
 */
export function errorHandler(error, _req, res, _next) {
  const status = Number(error.status || error.statusCode || 500);
  const isClientError = status >= 400 && status < 500;
  const isTrustedError = error.isTrustedError || false;

  // Determine error message
  let message = error.message || "Something went wrong on the server.";

  // Don't expose internal server errors to clients
  if (status >= 500 && !isClientError) {
    message = "Something went wrong on the server.";
  }

  // Determine error code for frontend error handling
  let code = error.code || "INTERNAL_ERROR";
  if (status === 401) code = "UNAUTHORIZED";
  if (status === 403) code = "FORBIDDEN";
  if (status === 404) code = "NOT_FOUND";
  if (status === 422) code = "VALIDATION_ERROR";
  if (status === 429) code = "RATE_LIMIT_EXCEEDED";

  // Log error details (server-side only)
  if (status >= 500 || !isClientError) {
    console.error("[ERROR]", {
      status,
      code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  res.status(status).json(createErrorResponse(message, code, status));
}

