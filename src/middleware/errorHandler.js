// Middleware централізованої обробки помилок в Express
// ОБОВ'ЯЗКОВО має приймати 4 параметри: (err, req, res, next)

const errorHandler = (err, req, res, next) => {
  // Логування помилки
  console.error('❌ Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack trace:', err.stack);

  // Логування додаткової інформації про запит
  console.error('Request:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Визначення статусу
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let statusCode = status;

  // Спеціальна обробка помилок Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation Error: ${errors.join(', ')}`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    if (err.kind === 'ObjectId') {
      message = `Invalid ID format: ${err.value}`;
    }
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate value for field "${field}": ${value} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Визначення середовища
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production mode — приховуємо деталі
    if (statusCode === 500) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(statusCode).json({ message });
  } else {
    // Development mode — показуємо деталі
    res.status(statusCode).json({
      message,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode,
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
    });
  }
};

// Експорт middleware
module.exports = errorHandler;
