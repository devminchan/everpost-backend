import dotenv from 'dotenv';
dotenv.config();
require('module-alias/register');

if (process.env.NODE_ENV === 'production') {
  console.log('Run with production mode');
} else if (process.env.NODE_ENV === 'development') {
  console.log('Run with development mode');
}

import Koa, { Next, Context } from 'koa';
import apiRouter from './api';
import bodyparser from 'koa-bodyparser';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import cors from 'koa2-cors';

createConnection()
  .then(async () => {
    console.log('Connect to database... OK');
    const app = new Koa();

    app.use(cors());

    // error handler
    app.use(async (ctx: Context, next: Next) => {
      try {
        await next();
      } catch (e) {
        console.log('----- Error Handler Log -----');
        console.error(e);
        console.log('-----------------------------');

        // default status 500
        ctx.status = e.statusCode || e.status || 500;
        ctx.body = {
          message: e.toString() || e.message || 'Unknown error occured',
        };
      }
    });

    app.use(bodyparser());

    // API router
    app.use(apiRouter.allowedMethods());
    app.use(apiRouter.routes());

    app.listen(process.env.PORT || 4000, () => {
      console.log(`Listening on port ${process.env.PORT || 4000}`);
    });
  })
  .catch(error => console.error(error));
