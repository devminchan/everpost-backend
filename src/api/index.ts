import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router();

router.get('/hello', (ctx: Context) => {
  ctx.body = {
    message: 'Hello',
  };
});

export default router;