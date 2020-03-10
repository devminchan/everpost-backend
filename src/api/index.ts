import Router from '@koa/router';

import userRouter from './users';
import authRouter from './auth';

const router = new Router();

router.use(authRouter.allowedMethods());
router.use(authRouter.routes());

router.use(userRouter.allowedMethods());
router.use(userRouter.routes());

export default router;
