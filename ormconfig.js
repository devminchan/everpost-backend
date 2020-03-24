module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DBNAME || 'everpost',
  synchronize: true,
  logging: false,
  entities: ['build/entity/**/*.js'],
  migrations: ['build/migration/**/*.js'],
  subscribers: ['build/subscriber/**/*.js'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
