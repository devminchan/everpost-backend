import 'dotenv/config';

import Koa, { Next, Context } from 'koa';
import apiRouter from './api';
import bodyparser from 'koa-bodyparser';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import koaJwt from 'koa-jwt';

createConnection()
  .then(async () => {
    console.log('Connect to database... OK');
    const app = new Koa();

    // error handler
    app.use(async (ctx: Context, next: Next) => {
      try {
        await next();
      } catch (e) {
        console.error(e);

        ctx.status = e.status || 500;
        ctx.body = {
          message: e.message,
        };
      }
    });

    app.use(bodyparser());
    app.use(
      koaJwt({ secret: process.env.JWT_SECRET }).unless({
        path: [/users\/facebook/, /auth*/],
      }),
    );

    app.use(apiRouter.allowedMethods());
    app.use(apiRouter.routes());

    app.listen(4000, () => {
      console.log('Listening on port 4000');
    });
  })
  .catch(error => console.log(error));
