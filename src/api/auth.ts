import Router from '@koa/router';
import { Context } from 'koa';
import { getRepository } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import {
  FacebookLoginRequest,
  FacebookLoginResponse,
  GRAPH_API_URL,
} from './users';
import axios from 'axios';
import QueryString from 'query-string';

const router = new Router();

router.post('/auth/facebook', async (ctx: Context) => {
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

    
  } catch (e) {
    console.error(e);
  }

  facebookUserRepository.find()
});

export default router;
