import Router from '@koa/router';

import userRouter from './users';
import authRouter from './auth';
import { Context } from 'koa';

const router = new Router();

router.use(authRouter.allowedMethods());
router.use(authRouter.routes());

router.use(userRouter.allowedMethods());
router.use(userRouter.routes());

// test endpoint
router.get('/hello', (ctx: Context) => {
  ctx.body = {
    message: 'Success!!',
  };
});

export default router;
