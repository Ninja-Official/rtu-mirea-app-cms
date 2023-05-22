const cronTasks = require("@webbio/strapi-plugin-scheduler/cron-task");

module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("PUBLIC_URL", "https://cms.mirea.ninja"),
  proxy: env.bool("IS_PROXIED", false),
  app: {
    keys: env.array("APP_KEYS", ["testKey1", "testKey2"]),
  },
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
});
