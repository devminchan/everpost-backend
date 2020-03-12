import Router from '@koa/router';

import userRouter from './users';
import authRouter from './auth';
import contentRouter from './contents';
import uploadRouter from './upload';

const router = new Router();

router.use(authRouter.allowedMethods());
router.use(authRouter.routes());

router.use(userRouter.allowedMethods());
router.use(userRouter.routes());

router.use(contentRouter.allowedMethods());
router.use(contentRouter.routes());

router.use(uploadRouter.allowedMethods());
router.use(uploadRouter.routes());

export default router;
