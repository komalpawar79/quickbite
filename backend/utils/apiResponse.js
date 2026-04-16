/**
 * Standardized API Response Handler
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (res, error, message = 'Error occurred', statusCode = 500) => {
  console.error('[Error]', {
    message: error.message || message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: message || error.message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
};

export const validationErrorResponse = (res, errors) => {
  res.status(400).json({
    success: false,
    statusCode: 400,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  });
};

export const paginatedResponse = (res, data, total, page, limit, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  
  res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords: total,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  });
};

export default ApiResponse;
