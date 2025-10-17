class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};


const errorResponse = (res, message, statusCode = 500, data = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(data && { data })
  });
};


export default { AppError, successResponse, errorResponse };


