// Middleware для логування HTTP запитів за допомогою pino-http

// Pino - це швидкий JSON logger для Node.js
// pino-http - middleware для Express, використовує pino - Автоматично логує всі HTTP запити та відповіді
// pino-pretty - форматер для красивого виводу логів в консоль - Перетворює JSON логи в читабельний формат з кольорами

// Імпортуємо pino-http для логування HTTP запитів - створює middleware який автоматично логує запити/відповіді
const pinoHttp = require('pino-http');

// НАЛАШТУВАННЯ LOGGER

// Створюю та налаштовуємо logger middleware - pinoHttp(options) приймає об'єкт з налаштуваннями та повертає middleware функцію для Express

const logger = pinoHttp({
  // TRANSPORT - куди відправляти логи

  transport: {
    // target - модуль для форматування/відправки логів
    // 'pino-pretty' - красиво форматує логи для консолі
    target: 'pino-pretty',

    // options - налаштування для pino-pretty
    options: {
      // colorize: true - кольорові логи в консолі
      // Різні рівні логів (info, warn, error) будуть різних кольорів
      colorize: true,

      // translateTime: формат часу в логах
      // 'SYS:standard' - стандартний системний формат (YYYY-MM-DD HH:mm:ss)
      // Інші варіанти: 'SYS:dd/mm/yyyy', 'UTC:yyyy-mm-dd', 'iso'
      translateTime: 'SYS:standard',

      // ignore - які поля НЕ показувати в логах
      // 'pid' - ID процесу (Process ID)
      // 'hostname' - ім'я хоста (назва комп'ютера)
      // Ці поля зазвичай не потрібні в development
      ignore: 'pid,hostname',
    },
  },
});

module.exports = logger;

// BEST PRACTICES

/*
1. Завжди логувати:
   - HTTP запити та відповіді
   - Помилки з stack trace
   - Важливі бізнес-події

2. НЕ логувати:
   - Паролі та чутливі дані
   - Токени та API ключі
   - Персональну інформацію (відповідно до GDPR)

3. Використовувати різні рівні логів:
   - info - нормальна робота
   - warn - потенційні проблеми
   - error - помилки що вимагають уваги

4. В production:
   - Логуй в JSON форматі (легше парсити)
   - Відправляй логи в централізовану систему
   - Налаштуй алерти на критичні помилки

5. В development:
   - Використовуй pino-pretty для читабельності
   - Логуй детальну інформацію
   - Включи всі рівні логів

6. Налаштуй ротацію логів:
   - Не зберігай логи вічно (займають місце)
   - Ротація по розміру або часу
   - Архівуй старі логи
*/
