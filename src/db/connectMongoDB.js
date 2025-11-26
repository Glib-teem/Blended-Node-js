// Імпортуємо Mongoose - ODM (Object Data Modeling) для MongoDB
const mongoose = require('mongoose');

// ФУНКЦІЯ ПІДКЛЮЧЕННЯ - Асинхронна функція для підключення до MongoDB

const connectMongoDB = async () => {
  try {
    // Отримую URL підключення та назву бази даних зі змінних оточення
    const { MONGODB_URL, MONGODB_DB } = process.env;

    // Перевірка наявності необхідних змінних
    if (!MONGODB_URL || !MONGODB_DB) {
      throw new Error(
        'MONGODB_URL or MONGODB_DB is not defined in environment variables. ' +
          'Please check your .env file.',
      );
    }

    // Логую спробу підключення без паролю в логах
    const safeUrl = MONGODB_URL.replace(/:[^:@]+@/, ':****@');
    console.log('🔄 Connecting to MongoDB (Atlas)...');
    console.log(`📍 Connection URL: ${safeUrl}`);
    console.log(`📍 Database name: ${MONGODB_DB}`);

    // Підключаюсь до MongoDB. Використовуємо опцію dbName для явного вказання бази даних.
    await mongoose.connect(MONGODB_URL, {
      dbName: MONGODB_DB,
    });

    // Якщо підключення успішне, виводжу повідомлення
    // (Повідомлення про успіх дублюється в event listener 'connected')
    // console.log('✅ MongoDB connection established');
  } catch (error) {
    // Якщо виникла помилка при підключенні
    console.error('❌ MongoDB connection error:');
    console.error('Message:', error.message);

    // Додаткова інформація про помилку для відладки
    if (error.name === 'MongooseServerSelectionError') {
      console.error(
        'Server Selection Error - перевірте connection string та IP whitelist в Atlas',
      );
    }

    // Викидаю помилку далі, щоб її обробив startServer() в server.js
    throw error;
  }
};

// --- EVENT LISTENERS ДЛЯ MONGOOSE CONNECTION ---

// Подія 'connected' - спрацьовує при успішному підключенні
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🏠 Host: ${mongoose.connection.host}`);
});

// Подія 'disconnected' - спрацьовує при втраті з'єднання
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
  console.log('Mongoose буде автоматично намагатися перепідключитися...');
});

// Подія 'error' - спрацьовує при помилках після підключення
mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error.message);
});

// Подія 'reconnected' - спрацьовує при автоматичному перепідключенні
mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Подія 'close' - спрацьовує при закритті з'єднання
mongoose.connection.on('close', () => {
  console.log('🔒 Mongoose connection closed');
});

// ЕКСПОРТ - Експортуємо функцію підключення
module.exports = connectMongoDB;
