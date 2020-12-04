const PRODUCTION_ENVIRONMENT = {
  title: "production environment",
  URL_CLIENT: process.env.URL_CLIENT,
};

const DEVELOPMENT_ENVIRONMENT = {
  title: "development environment",
  URL_CLIENT: "http://localhost:3001",
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

module.exports = { ENVIRONMENT };
