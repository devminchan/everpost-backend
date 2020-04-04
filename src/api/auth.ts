import Router from '@koa/router';
import { getRepository } from 'typeorm';
import JWT from 'jsonwebtoken';
import { EmailUser } from '@/entity/EmailUser';

const router = new Router();

router.post('/auth/email', async ctx => {
  const emailUserRepository = getRepository(EmailUser);
  const { email, password } = ctx.request.body;

  const user = await emailUserRepository.findOne({
    email,
    password,
  });

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
