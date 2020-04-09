import Router from '@koa/router';
import JWT from 'jsonwebtoken';
import { User } from '@/entity/User';
import { PasswordAccountAccess } from '@/entity/PasswordAccountAccess';
import bcrypt from 'bcrypt';

const router = new Router();

router.post('/user/auth', async ctx => {
  const { email, password } = ctx.request.body;

  const user = await User.findOneOrFail({
    email,
  });

  const acc = await PasswordAccountAccess.findOneOrFail({
    user,
  });

  // 패스워드 불일치 시
  const isSuccess = await bcrypt.compare(password, acc.password);

  if (!isSuccess) {
    ctx.throw(401, 'Password is wrong');
  }

  const jwt = JWT.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS512',
    },
  );

  ctx.body = {
    token: jwt,
  };
});

export default router;
