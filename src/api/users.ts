import Router from '@koa/router';
import { User } from '@/entity/User';
import jwtValidate from '@/middleware/jwt-validate';
import { validateOrReject, MinLength } from 'class-validator';
import { PasswordAccountAccess } from '@/entity/PasswordAccountAccess';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

const router = new Router();

router
  .post('/users', async ctx => {
    interface CreateUserRequest {
      username: string;
      email: string;
      password: string;
    }

    class CreateUserRequestVertify {
      @MinLength(8)
      password: string;

      constructor(req: CreateUserRequest) {
        this.password = req.password;
      }
    }

    const loginRequest = ctx.request.body as CreateUserRequest;

    await validateOrReject(new CreateUserRequestVertify(loginRequest));

    const newUser = User.create({
      ...loginRequest,
    });

    await newUser.save();

    try {
      const newAcc = PasswordAccountAccess.create({
        user: newUser,
        password: loginRequest.password,
      });

      newAcc.password = await bcrypt.hash(
        newAcc.password,
        Number.parseInt(process.env.PASSWORD_SALT_ROUND),
      );

      await newAcc.save();

      ctx.body = {
        ...newUser,
      };
    } catch (e) {
      // AccountAccess 저장 중 오류 발생 시
      // 생성된 newUser 제거
      // TODO: 트랜젝션으로 전환 필요함
      await newUser.remove();
      throw e;
    }
  })
  .post('/users/auth', async ctx => {
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
  })
  .get('/users/me', jwtValidate(), async ctx => {
    const { id } = ctx.state.user;

    const user = await User.findOneOrFail(id); // 발견하지 못하면, error를 발생시킴

    ctx.body = {
      ...user,
    };
  })
  .patch('/users/me', jwtValidate(), async ctx => {
    interface UpdateUserRequest {
      username: string | null;
      email: string | null;
      profileImage: string | null;
    }

    const { id } = ctx.state.user;
    const update = ctx.request.body as UpdateUserRequest;

    const user = await User.findOneOrFail(id); // 발견하지 못하면, error를 발생시킴

    user.username = update.username;
    user.email = update.email || user.email;
    user.profileImage = update.profileImage || user.profileImage;

    await user.save();

    ctx.body = {
      ...user,
    };
  })
  .delete('/users/me', jwtValidate(), async ctx => {
    const { id } = ctx.state.user;

    const result = await User.delete(id);

    if (result.affected > 0) {
      console.log('Removed user: ' + id);

      ctx.body = {
        message: 'delete success',
      };
    } else {
      ctx.throw(404, 'User not found!');
    }
  });

export default router;
