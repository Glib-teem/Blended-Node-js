// Mongoose модель для продуктів
// Імпортую Mongoose для створення схеми та моделі

const mongoose = require('mongoose');

// Деструктуризація: витягую Schema з mongoose - конструктор для створення схем документів
const { Schema } = mongoose;

// СТВОРЕННЯ СХЕМИ - Схема визначає:
// - Які поля є в документі
// - Типи даних полів
// - Валідацію полів
// - Значення за замовчуванням
// - Індекси та віртуальні поля

const productSchema = new Schema(
  {
    // ПОЛЕ: name (назва продукту)

    name: {
      // Тип даних: рядок (String)
      type: String,

      // Якщо не передати name при створенні, отримаємо ValidationError - Можна передати масив: [boolean, 'повідомлення про помилку']
      required: [true, 'Product name is required'],

      // trim: true - автоматично видаляє пробіли на початку та в кінці
      // "  Product  " → "Product"
      trim: true,

      // minlength: мінімальна довжина рядка
      minlength: [2, 'Name must be at least 2 characters long'],

      // maxlength: максимальна довжина рядка
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // ПОЛЕ: price (ціна продукту)

    price: {
      // Тип даних: число (Number)
      type: Number,

      // Обов'язкове поле
      required: [true, 'Price is required'],

      // min: мінімальне значення (ціна не може бути від'ємною)
      min: [0, 'Price must be a positive number'],

      // max: максимальне значення (опціонально, для реалістичності)
      max: [1000000, 'Price cannot exceed 1,000,000'],
    },

    // ПОЛЕ: category (категорія продукту)

    category: {
      // Тип даних: рядок
      type: String,

      // Обов'язкове поле
      required: [true, 'Category is required'],

      // enum: поле може мати тільки одне зі вказаних значень

      enum: {
        // Масив дозволених значень
        values: ['books', 'electronics', 'clothing', 'other'],

        // Повідомлення про помилку якщо значення не з списку - {VALUE} буде замінено на фактичне передане значення
        message:
          '{VALUE} is not a valid category. Allowed: books, electronics, clothing, other',
      },

      default: 'other',

      // lowercase: true - конвертує значення в нижній регістр - "BOOKS" → "books"
      lowercase: true,

      // trim: видаляє пробіли
      trim: true,
    },

    // ПОЛЕ: description (опис продукту)

    description: {
      // Тип даних: рядок
      type: String,

      // required: false - поле НЕ обов'язкове (опціональне)

      required: false,

      // trim: видаляє пробіли
      trim: true,

      // maxlength: максимальна довжина опису
      maxlength: [1000, 'Description cannot exceed 1000 characters'],

      // default: значення за замовчуванням для опціональних полів
      default: '',
    },
  },

  // ОПЦІЇ СХЕМИ (другий параметр Schema)

  {
    // timestamps: автоматично додає поля createdAt та updatedAt
    // createdAt - дата створення документа (встановлюється один раз)
    // updatedAt - дата останнього оновлення (оновлюється при save/update)
    timestamps: true,

    // toJSON: налаштування серіалізації в JSON

    toJSON: {
      // virtuals: true - включає віртуальні поля в JSON
      // Віртуальне поле 'id' буде доступне в JSON відповіді
      virtuals: true,

      // versionKey: false - видаляє поле __v з JSON
      // __v - version key, використовується Mongoose для оптимістичної конкурентності
      // Зазвичай не потрібне в API відповідях
      versionKey: false,

      // transform: функція для трансформації документа перед серіалізацією
      // Виконується кожного разу при виклику toJSON()
      // doc - оригінальний Mongoose документ
      // ret - об'єкт що буде повернено (можна модифікувати)
      transform: function (doc, ret) {
        // Видаляємо _id, оскільки використовуємо id (віртуальне поле)
        delete ret._id;

        // Можна додати додаткову логіку:
        // - Видалити чутливі дані
        // - Форматувати дати
        // - Додати обчислені поля

        // Приклад: форматування ціни до 2 знаків після коми
        if (ret.price) {
          ret.price = parseFloat(ret.price.toFixed(2));
        }

        // Повертаємо модифікований об'єкт
        return ret;
      },
    },

    // toObject: налаштування серіалізації в звичайний JS об'єкт

    toObject: {
      virtuals: true,
      versionKey: false,
    },

    // collection: явно вказати назву колекції
    // За замовчуванням Mongoose створює назву з імені моделі (Product → products)
    collection: 'products',

    // strict: true - тільки поля зі схеми можуть бути збережені
    // strict: false - дозволить зберігати будь-які поля (не рекомендується)
    // strict: true, // за замовчуванням
  },
);

// ІНДЕКСИ
// Індекси прискорюють пошук по полях - створюються на рівні MongoDB
// Індекс для пошуку по назві (для автокомпліту) - productSchema.index({ name: 1 }); // 1 = ascending, -1 = descending
// Складений індекс для пошуку по категорії та ціні - productSchema.index({ category: 1, price: -1 });
// Текстовий індекс для full-text пошуку по назві та опису - productSchema.index({ name: 'text', description: 'text' });

// ВІРТУАЛЬНІ ПОЛЯ
// Віртуальні поля не зберігаються в БД, але доступні в об'єкті документа
// Mongoose автоматично створює віртуальне поле 'id' - яке повертає _id у вигляді рядка - активується через virtuals: true в toJSON

// МЕТОДИ ЕКЗЕМПЛЯРА (instance methods)
// Методи які можна викликати на окремому документі - отримати форматований опис продукту

productSchema.methods.getFormattedInfo = function () {
  return `${this.name} - ${this.price} грн (${this.category})`;
};

// застосувати знижку до продукту
productSchema.methods.applyDiscount = function (percentage) {
  // Перевірка валідності percentage
  if (percentage < 0 || percentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }

  // Застосовуємо знижку
  this.price = this.price * (1 - percentage / 100);

  // Округлюємо до 2 знаків
  this.price = parseFloat(this.price.toFixed(2));

  // Повертаємо this для можливості chaining
  return this;
};

// СТАТИЧНІ МЕТОДИ (static methods) - Методи які викликаються на моделі (не на документі)

// знайти продукти за категорією
productSchema.statics.findByCategory = function (category) {
  return this.find({ category: category });
};

// знайти продукти в ціновому діапазоні
productSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    price: {
      $gte: minPrice, // greater than or equal
      $lte: maxPrice, // less than or equal
    },
  });
};

// MIDDLEWARE (HOOKS) - Middleware виконуються до або після певних операцій

/**
 * Pre-save middleware - виконується ПЕРЕД збереженням
 * Використовується для:
 * - Валідації даних
 * - Обчислення полів
 * - Хешування паролів (для User моделі)
 */
productSchema.pre('save', function (next) {
  // this вказує на документ що зберігається

  // Приклад: перевірка що ціна кратна 0.01
  this.price = Math.round(this.price * 100) / 100;

  // Приклад: автоматичне створення slug з назви
  // this.slug = this.name.toLowerCase().replace(/\s+/g, '-');

  // Викликаємо next() щоб продовжити збереження
  next();
});

/**
 * Post-save middleware - виконується ПІСЛЯ збереження
 */
productSchema.post('save', function (doc, next) {
  // doc - збережений документ
  console.log(`Product "${doc.name}" was saved successfully`);
  next();
});

// СТВОРЕННЯ МОДЕЛІ
// Створюємо модель Product на основі схеми
// mongoose.model(modelName, schema)
// - modelName: ім'я моделі (в однині, PascalCase)
// - schema: схема документа
//
// Mongoose автоматично:
// - Створить колекцію 'products' (множина, lowercase)
// - Додасть методи CRUD (create, find, update, delete)
// - Застосує всю валідацію зі схеми

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
