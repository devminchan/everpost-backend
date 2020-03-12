import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import {
  FacebookLoginRequest,
  FacebookLoginResponse,
  GRAPH_API_URL,
} from './users';
import axios from 'axios';
import QueryString from 'query-string';
import JWT from 'jsonwebtoken';

const router = new Router();

router.post('/auth/facebook', async ctx => {
  const facebookUserRepository = getRepository(FacebookUser);
  const { token } = ctx.request.body;

  const loginRequest = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: token,
    fields: 'id,name,email',
  } as FacebookLoginRequest;

  const qs = QueryString.stringify(loginRequest);

  try {
    const response = await axios.get(GRAPH_API_URL + 'me?' + qs);
    const resData = response.data as FacebookLoginResponse;

    const user = await facebookUserRepository.findOne({
      facebookUserId: resData.id,
    });

    if (!user) {
      throw new Error('cannot find user!');
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
      jwt,
    };
  } catch (e) {
    console.error(e);

    // error 구분 필요!
    ctx.throw(401, new Error('등록되지 않은 사용자입니다.'));
  }
});

export default router;
