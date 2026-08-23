const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "GROQ_API_KEY"
];

function validateEnv() {
  const missing = requiredEnv.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = validateEnv;