require("dotenv").config();

const shared = {
  dialect: process.env.DB_DIALECT || "mysql",
  host: process.env.DB_HOST || "localhost",
  logging: false,
};

function databaseConfig(database) {
  if (process.env.DATABASE_URL) {
    return { ...shared, use_env_variable: "DATABASE_URL" };
  }

  return {
    ...shared,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database,
  };
}

module.exports = {
  development: databaseConfig(process.env.DB_NAME || "phone_sine"),
  test: databaseConfig(process.env.DB_TEST_NAME || "phone_sine_test"),
  production: databaseConfig(process.env.DB_NAME || "phone_sine"),
};
