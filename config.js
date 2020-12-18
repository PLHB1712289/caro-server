const PRODUCTION_ENVIRONMENT = {
  title: "production environment",
  URL_CLIENT: process.env.URL_CLIENT,
  SECRET_KEY_JWT: process.env.SECRET_KEY_JWT,
  SECRET_KEY_HASH: process.env.SECRET_KEY_HASH,
  MONGO_DB_URL: process.env.MONGO_DB_URL.replace(
    "<username>",
    process.env.MONGO_USERNAME
  )
    .replace("<password>", process.env.MONGO_PASSWORD)
    .replace("<dbname>", process.env.MONGO_MONGO_DBNAME),
};

const DEVELOPMENT_ENVIRONMENT = {
  title: "development environment",
  URL_CLIENT: "http://localhost:3001",
  SECRET_KEY_JWT: "scretkey",
  SECRET_KEY_HASH: 10,
  MONGO_DB_URL:
    "mongodb+srv://car0:car0@cluster0.q9kh1.mongodb.net/car0?retryWrites=true&w=majority",
};

const ENVIRONMENT =
  process.env.ENVIRONMENT === "PRODUCTION"
    ? { ...PRODUCTION_ENVIRONMENT }
    : { ...DEVELOPMENT_ENVIRONMENT };

//
console.log(
  `Run on ${
    process.env.ENVIRONMENT === "PRODUCTION"
      ? "PRODUCTION ENVIRONMENT"
      : "DEVELOPMENT ENVIRONMENT"
  }`
);

module.exports = ENVIRONMENT;
