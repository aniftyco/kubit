import { defineConfig, env } from "kubit";

export default defineConfig({
  name: env("APP_NAME", "Kubit"),

  env: env("APP_ENV", "production"),

  debug: env("APP_DEBUG", false),

  url: env("APP_URL", "http://localhost"),

  timezone: env("APP_TIMEZONE", "UTC"),
});
