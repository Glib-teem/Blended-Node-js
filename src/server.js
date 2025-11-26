const express = require('express');
require('dotenv').config();

const connectMongoDB = require('./db/connectMongoDB');
const logger = require('./middleware/logger');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const productsRoutes = require('./routes/productsRoutes');

// ІНІЦІАЛІЗАЦІЯ EXPRESS ДОДАТКУ
const app = express();
const PORT = process.env.PORT || 3000;

// ГЛОБАЛЬНІ MIDDLEWARE
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// РОУТИ (ENDPOINTS)
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    version: '1.0.0',
    endpoints: {
      products: '/products',
    },
  });
});

app.use('/products', productsRoutes);

// MIDDLEWARE ДЛЯ ОБРОБКИ ПОМИЛОК
app.use(notFoundHandler);
app.use(errorHandler);

// ЗАПУСК СЕРВЕРА
const startServer = async () => {
  try {
    await connectMongoDB();
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log('🚀 Server is running!');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 Network: http://0.0.0.0:${PORT}`);
      console.log('');
      console.log('Available routes:');
      console.log(`  GET    /products          - Get all products`);
      console.log(`  GET    /products/:id      - Get product by ID`);
      console.log(`  POST   /products          - Create product`);
      console.log(`  PATCH  /products/:id      - Update product`);
      console.log(`  DELETE /products/:id      - Delete product`);
      console.log('');
      console.log('Press CTRL+C to stop server');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// ОБРОБКА СИСТЕМНИХ СИГНАЛІВ
process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT signal received: closing server gracefully');
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// ЗАПУСК
startServer();

module.exports = app;
