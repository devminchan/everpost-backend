import Router from '@koa/router';
import { EmailUser } from '@/entity/EmailUser';
import { User } from '@/entity/User';
import jwtValidate from '@/middleware/jwt-validate';
import { validateOrReject, MinLength } from 'class-validator';

const router = new Router();

router
  .post('/users/email', async ctx => {
    interface EmailPasswordLoginRequest {
      username: string;
      email: string;
      password: string;
    }

    class LoginRequestVertify {
      @MinLength(8)
      password: string;

      constructor(req: EmailPasswordLoginRequest) {
        this.password = req.password;
      }
    }

    const loginRequest = ctx.request.body as EmailPasswordLoginRequest;

    await validateOrReject(new LoginRequestVertify(loginRequest));

    const newUser = EmailUser.create({
      ...loginRequest,
    });

    await newUser.save();

    delete newUser.password;

    ctx.body = {
      ...newUser,
    };
  })
  .get('/users/me', jwtValidate(), async ctx => {
    const { id } = ctx.state.user;

    const user = await User.findOneOrFail(id); // 발견하지 못하면, error를 발생시킴

    ctx.body = {
      ...user,
    };
  })
  .get('/users/:id', async ctx => {
    const id: number = Number.parseInt(ctx.params.id);

    const user = await User.findOne(id);

    if (user) {
      ctx.body = {
        ...user,
      };
    } else {
      ctx.throw(404, 'User not found');
    }
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
