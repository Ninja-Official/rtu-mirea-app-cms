# Strapi application

A quick description of your strapi application


# Установка
```bash
# клонируйте репозиторий
$ git clone https://github.com/Ninja-Official/rtu-mirea-app-cms && cd rtu-mirea-app-cms

# установите зависимости
$ yarn install

# запуск в режиме разработки на localhost:1337
$ yarn run develop
```

# Сборка 
```bash
# сборка для production и запуска сервера
$ yarn build
$ yarn start
```

# Конфигурация
Рекомендуется использовать переменные среды для настройки приложения. Пример:

**Путь —** `./config/server.js`.
```javascript
module.exports = ({ env }) => ({
  host: env('APP_HOST', '0.0.0.0'),
  port: env.int('NODE_PORT', 1337),
});
```

**Путь —** `.env`.
```
APP_HOST=10.0.0.1
NODE_PORT=1338
```

## База данных
По умолчанию настроено использование PostgreSQL. Если вам нужно использовать локальную базу данных в виде SQLite, используйте следующую конфигурацию:

**Путь —** `./config/database.js`.
```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

## Загрузка файлов
Проект настроен на загрузку файлов на AWS S3. Если вы хотите использовать локальное хранилище, то воспользуйтесь следующей документацией: https://docs.strapi.io/developer-docs/latest/plugins/upload.html#local-server