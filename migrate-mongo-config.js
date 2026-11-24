require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || "",
    databaseName: process.env.MONGODB_DB_NAME || "docappoint",
    options: {}
  },
  migrationsDir: "src/migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};
