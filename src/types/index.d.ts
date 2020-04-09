declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_DBNAME: string;
    DB_PORT: string;
    JWT_SECERT: string;
    PASSWORD_SALT_ROUND: string;
  }
}
