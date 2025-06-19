const { sendResponse } = require('../utils/responseHelper');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendResponse(res, statusCode, message);
};

module.exports = errorMiddleware;
