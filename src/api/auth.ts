import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import {
  FacebookLoginRequest,
  FacebookLoginResponse,
  GRAPH_API_URL,
} from './users';
import axios, { AxiosResponse } from 'axios';
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

  let response: AxiosResponse<FacebookLoginResponse>;
  let resData: FacebookLoginResponse;

  // Facebook access token을 통한 검증
  // access token이 잘못되었을 시 400 error 발생
  try {
    response = await axios.get(GRAPH_API_URL + 'me?' + qs);
    resData = response.data;
  } catch (e) {
    ctx.throw(400, e);
  }

  const user = await facebookUserRepository.findOneOrFail({
    facebookUserId: resData.id,
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
