import Router from '@koa/router';

import userRouter from './users';

const router = new Router();

router.use(userRouter.allowedMethods());
router.use(userRouter.routes());

export default router;
