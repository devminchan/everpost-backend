import Router from '@koa/router';

import userRouter from './users';
import authRouter from './auth';
import postRouter from './posts';
import uploadRouter from './upload';

const router = new Router();

router.use(authRouter.allowedMethods());
router.use(authRouter.routes());

router.use(userRouter.allowedMethods());
router.use(userRouter.routes());

router.use(postRouter.allowedMethods());
router.use(postRouter.routes());

router.use(uploadRouter.allowedMethods());
router.use(uploadRouter.routes());

export default router;
