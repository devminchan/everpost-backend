let prodEntities = null;
let prodMigs = null;
let prodSubs = null;

if (process.env.NODE_ENV === 'production') {
  prodEntities = ['build/entity/**/*.js'];
  prodMigs = ['build/migration/**/*.js'];
  prodSubs = ['build/subscriber/**/*.js'];
}

module.exports = {
  type: process.env.DB_TYPE || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DBNAME || 'test',
  synchronize: true,
  logging: false,
  entities: prodEntities || ['src/entity/**/*.ts'],
  migrations: prodMigs || ['src/migration/**/*.ts'],
  subscribers: prodSubs || ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
