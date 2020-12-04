const PRODUCTION_ENVIRONMENT = {
  title: "production environment",
};

const DEVELOPMENT_ENVIRONMENT = {
  title: "development environment",
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
