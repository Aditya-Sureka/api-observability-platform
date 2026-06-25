/**
 * ResponseFormatter - Utility class for formatting API responses.
 * This class provides methods to format successful responses, error responses, validation errors, and paginated responses.
 */

class ResponseFormatter {
  /**
   * Formats a successful response.
   * @param {any} data - The data to include in the response. (default: null)
   * @param {string} message - The message for the response. ( default: "Success")
   * @param {number} statusCode - The HTTP status code for the response. (default: 200)
   * @returns {Object} - The formatted response object. 
   */
  static success(data = null, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Formats an error response.
   * @param {string} message - The error message. (default: "Error")
   * @param {number} statusCode - The HTTP status code. (default: 500)
   * @param {any} error - Additional error details. (default: null)
   * @returns {Object} - The formatted error response object. ( default = null )
   */
  static error(message = "Error", statusCode = 500, error = null) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Formats a validation error response.
   * @param {any} error - The validation error details. (default: null)
   * @returns {Object} - The formatted validation error response object.
   */
  static validation(error = null) {
    return {
      success: false,
      message: "Validation Error",
      statusCode: 400,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Formats a paginated response.
   * @param {any} data - The data to include in the response. (default: null)
   * @param {number} page - The current page number. (default: 1)
   * @param {number} limit - The number of items per page. (default: 10)
   * @param {number} total - The total number of items. (default: 10)
   * @returns {Object} - The formatted paginated response object.
   */
  static paginated(data = null, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export default ResponseFormatter;