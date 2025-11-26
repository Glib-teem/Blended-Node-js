// express для створення роутера
const express = require('express');

// Імпортуємо всі контролери з productsController

const {
  getAllProducts, // Контролер для GET /products
  getProductById, // Контролер для GET /products/:productId
  createProduct, // Контролер для POST /products
  updateProduct, // Контролер для PATCH /products/:productId
  deleteProduct, // Контролер для DELETE /products/:productId
} = require('../controllers/productsController');

// СТВОРЕННЯ РОУТЕРА

// Створюю новий екземпляр Express Router - для групування пов'язаних маршрутами та middleware - це модульний підхід до організації роутів
const router = express.Router();

// ВИЗНАЧЕННЯ МАРШРУТІВ

// 3: GET всі продукти - Маршрут: GET /products
router.get('/', getAllProducts);

// 4: GET один продукт за ID - GET /products/:productId
router.get('/:productId', getProductById);
// Статичні роути (без параметрів) мають бути ПЕРЕД динамічними

// 5: POST створити новий продукт - POST /products
router.post('/', createProduct);

// 6: PATCH оновити продукт - PATCH /products/:productId
router.patch('/:productId', updateProduct);

// 7: DELETE видалити продукт - DELETE /products/:productId
router.delete('/:productId', deleteProduct);

// ДОДАТКОВІ ПРИКЛАДИ РОУТІВ

// Пошук продуктів з query параметрами
// GET /products/search?category=electronics&minPrice=100&maxPrice=500
// router.get('/search', searchProducts);
// Отримати статистику
// GET /products/stats
// router.get('/stats', getProductStats);
// Масове видалення (для адміністратора)
// DELETE /products (з масивом ID в body)
// router.delete('/', deleteMultipleProducts);
// Експорт/імпорт продуктів
// GET /products/export → CSV/JSON файл
// router.get('/export', exportProducts);
// POST /products/import → завантажити файл з продуктами
// router.post('/import', uploadMiddleware, importProducts);

// MIDDLEWARE ДЛЯ КОНКРЕТНИХ РОУТІВ
// Аутентифікація тільки для POST, PATCH, DELETE
// router.post('/', authMiddleware, createProduct);
// router.patch('/:productId', authMiddleware, updateProduct);
// router.delete('/:productId', authMiddleware, deleteProduct);
// Валідація даних
// router.post('/', validateProductData, createProduct);
// router.patch('/:productId', validateProductData, updateProduct);
// Логування специфічних дій
// router.delete('/:productId', logDeletion, deleteProduct);

// ГРУПОВИЙ MIDDLEWARE
// Застосувати middleware до ВСІХ роутів в цьому роутері
// router.use(someMiddleware);
// Приклад: логування всіх запитів до /products
// router.use((req, res, next) => {
//   console.log(`${req.method} ${req.originalUrl}`);
//   next();
// });
// Приклад: перевірка аутентифікації для всіх роутів крім GET
// router.use((req, res, next) => {
//   if (req.method !== 'GET' && !req.user) {
//     return res.status(401).json({ message: 'Authentication required' });
//   }
//   next();
// });

module.exports = router;
