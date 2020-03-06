import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router();

router
  .post('/users', (ctx: Context) => {
    ctx.body = {
      message: 'User created!',
    };
  })
  .put('/users', (ctx: Context) => {
    ctx.body = {
      message: 'Koa god god',
    };
  });

export default router;
