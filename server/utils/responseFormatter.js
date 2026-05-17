/**
 * Standardized API Response Formatter
 * Wraps outgoing data into a consistent enterprise format.
 */
export const apiResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data
  });
};
