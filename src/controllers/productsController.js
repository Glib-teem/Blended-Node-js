// Імпортуємо модель Product для роботи з базою даних
const Product = require('../models/product');

// Імпортуємо createHttpError для створення HTTP помилок зі статус кодами
const createHttpError = require('http-errors');

// КОНТРОЛЕР 1: GET ALL PRODUCTS 3

// Отримати всі продукти з бази даних
// Роут: GET /products - Відповідь: 200 + масив продуктів
// @param {Object} req - Express request об'єкт
// @param {Object} res - Express response об'єкт
// @param {Function} next - Express next middleware function

const getAllProducts = async (req, res, next) => {
  try {
    // Product.find() без параметрів поверне ВСІ документи з колекції - await зупиняє виконання поки запит до БД не завершиться

    const products = await Product.find();

    // Додаткові опції для find():
    //    Product.find()
    //   .select('name price category') // Вибрати тільки певні поля
    //   .sort({ price: -1 }) // Сортування (1 = asc, -1 = desc)
    //   .limit(10) // Обмеження кількості результатів
    //   .skip(0) // Пропустити перші N документів (для пагінації)
    //   .lean() // Повернути простий JS об'єкт замість Mongoose документа (швидше)

    // Відправляю відповідь клієнту - res.status(200) - встановлює HTTP статус код 200 (OK)
    // .json(products) - перетворює масив в JSON і відправляє
    res.status(200).json(products);
  } catch (error) {
    // Якщо виникла помилка (помилка БД, мережі тощо)
    // Передаємо помилку в middleware для обробки помилок - next(error) викликає errorHandler middleware
    next(error);
  }
};

// КОНТРОЛЕР 2: GET PRODUCT BY ID (4)

// Отримати один продукт за його ID - Роут: GET /products/:productId
//Параметри: productId в URL - Відповідь: 200 + об'єкт продукту АБО 404

// @param {Object} req - Request об'єкт (містить params)
// @param {Object} res - Response об'єкт
// @param {Function} next - Next function

const getProductById = async (req, res, next) => {
  try {
    // Отримую productId з параметрів URL - Для роута /products/:productId
    // req.params = { productId: '507f1f77bcf86cd799439011' } - Деструктуризація: витягуємо productId з req.params
    const { productId } = req.params;

    // Додаткова валідація MongoDB ObjectId (опціонально)
    // const mongoose = require('mongoose');
    // if (!mongoose.Types.ObjectId.isValid(productId)) {
    //   throw createHttpError(400, 'Invalid product ID format');
    // }

    // Шукаю продукт за ID в базі даних
    // findById(id) - спеціальний метод Mongoose для пошуку за полем _id
    // Еквівалент: Product.findOne({ _id: productId })
    // Повертає: знайдений документ або null
    const product = await Product.findById(productId);

    // Додаткові опції для findById:
    // Product.findById(productId)
    //   .select('name price') // Вибрати тільки певні поля
    //   .lean() // Повернути простий JS об'єкт

    // Перевіряю чи знайдено продукт
    // Якщо product === null, значить продукт не існує
    if (!product) {
      // Створюю HTTP помилку з кодом 404 (Not Found)
      // createHttpError(statusCode, message) повертає об'єкт помилки
      // throw зупиняє виконання функції і передає помилку в catch блок
      throw createHttpError(404, 'Product not found');
    }

    // Якщо продукт знайдено, відправляю його клієнту
    // Статус 200 (OK)
    res.status(200).json(product);
  } catch (error) {
    // Передаю будь-яку помилку в error handler
    // Може бути:
    // - 404 помилка (продукт не знайдено)
    // - Помилка валідації ObjectId
    // - Помилка бази даних
    next(error);
  }
};

// КОНТРОЛЕР 3: CREATE PRODUCT (5)
// Створити новий продукт - Роут: POST /products - Тіло запиту (JSON):
const createProduct = async (req, res, next) => {
  try {
    // Отримую дані з тіла запиту
    // req.body містить дані які клієнт надіслав у форматі JSON
    // Завдяки middleware express.json() в server.js, ці дані автоматично парсяться
    // req.body = { name: 'Laptop', price: 999, category: 'electronics', ... }
    const { name, price, category, description } = req.body;

    // Можна додати додаткову валідацію перед створенням:
    // if (!name || !price || !category) {
    //   throw createHttpError(400, 'Missing required fields: name, price, category');
    // }

    // Створюю новий продукт в базі даних - Product.create(data) виконує:
    // 1. Створює новий документ з переданих даних
    // 2. Валідує документ згідно зі схемою моделі
    // 3. Зберігає документ в колекції 'products'
    // 4. Повертає збережений документ з _id, createdAt, updatedAt
    const newProduct = await Product.create({
      name, // назва продукту (required)
      price, // ціна продукту (required)
      category, // категорія (required, enum)
      description, // опис (optional)
    });

    // Альтернативний спосіб створення:
    // const newProduct = new Product({ name, price, category, description });
    // await newProduct.save();
    // Mongoose автоматично:
    // - Перевірить required поля
    // - Перевірить типи даних
    // - Перевірить enum значення
    // - Застосує trim, lowercase тощо
    // - Додасть createdAt та updatedAt (якщо timestamps: true)
    // - Викличе pre/post save hooks

    // Відправляю відповідь зі статусом 201 (Created)
    // 201 - стандартний HTTP код для успішного створення нового ресурсу
    // Відправляємо створений продукт клієнту
    res.status(201).json(newProduct);

    // Альтернативний варіант:
    // res.status(201).json({
    //   success: true,
    //   message: 'Product created successfully',
    //   data: newProduct
    // });
  } catch (error) {
    // Можливі помилки:
    // 1. ValidationError (від Mongoose)
    // - Відсутнє обов'язкове поле (required)
    // - Невірний тип даних (передали рядок замість числа)
    // - Значення не з enum списку
    // - Не пройшла валідація (min, max, minlength тощо)
    // 2. CastError (від Mongoose)
    // 3. MongoServerError (від MongoDB)
    // Помилки бази даних (дублікат unique індексу тощо)
    // Передаємо помилку в error handler middleware
    // errorHandler оброблятиме різні типи помилок по-різному
    next(error);
  }
};

// КОНТРОЛЕР 4: UPDATE PRODUCT (6)
// Оновити існуючий продукт - Роут: PATCH /products/:productId - PATCH = часткове оновлення (можна передати тільки деякі поля)

const updateProduct = async (req, res, next) => {
  try {
    // Отримую productId з параметрів URL
    const { productId } = req.params;

    // Отримую дані для оновлення з тіла запиту
    // updateData містить ТІЛЬКИ ті поля, які клієнт хоче оновити
    // Інші поля залишаться без змін

    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, // ID документа для пошуку
      updateData, // Об'єкт з новими значеннями полів
      {
        // new: true - повернути ОНОВЛЕНИЙ документ (не старий)
        // За замовчуванням new: false (повертає старий документ)
        new: true,
        runValidators: true,
        context: 'query',
      },
    );

    // Альтернативний метод оновлення:
    // const product = await Product.findById(productId);
    // if (!product) {
    //   throw createHttpError(404, 'Product not found');
    // }
    // Object.assign(product, updateData);
    // await product.save(); // Це викличе pre/post save hooks

    // Перевіряємо чи знайдено продукт
    // findByIdAndUpdate поверне null якщо документ з таким ID не існує
    if (!updatedProduct) {
      throw createHttpError(404, 'Product not found');
    }

    // Відправляємо оновлений продукт клієнту
    // Статус 200 (OK) для успішного оновлення
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Можливі помилки:
    // - 404: продукт не знайдено
    // - ValidationError: невалідні дані (enum, типи, min/max тощо)
    // - CastError: невалідний ObjectId
    // - MongoServerError: помилка БД

    next(error);
  }
};

// КОНТРОЛЕР 5: DELETE PRODUCT (TASK 7)
// Видалити продукт за ID - Роут: DELETE /products/:productId
// Параметри: productId в URL - Відповідь: 200 + видалений продукт АБО 404

const deleteProduct = async (req, res, next) => {
  try {
    // Отримуємо productId з параметрів URL
    const { productId } = req.params;

    // Видаляю продукт з бази даних
    // findByIdAndDelete(id) виконує:
    // 1. Знаходить документ за ID
    // 2. Видаляє його з колекції
    // 3. Повертає видалений документ (або null якщо не знайдено)
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      throw createHttpError(404, 'Product not found');
    }

    // Відправляю видалений продукт клієнту - Статус 200 (OK) для успішного видалення
    // Повертаю видалений продукт, щоб клієнт міг побачити що саме було видалено
    res.status(200).json(deletedProduct);
  } catch (error) {
    // Можливі помилки:
    // - 404: продукт не знайдено
    // - CastError: невалідний ObjectId
    // - MongoServerError: помилка БД

    next(error);
  }
};

// ЕКСПОРТ КОНТРОЛЕРІВ - Експортую всі контролери як named exports

module.exports = {
  getAllProducts, // 3 - GET /products
  getProductById, // 4 - GET /products/:id
  createProduct, // 5 - POST /products
  updateProduct, // 6 - PATCH /products/:id
  deleteProduct, // 7 - DELETE /products/:id
};
