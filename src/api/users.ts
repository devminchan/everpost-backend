import Router from '@koa/router';
import { Context } from 'koa';
import axios from 'axios';
import QueryString from 'query-string';
import { getManager } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';

interface FacebookLoginRequest {
  access_token: string;
  fields: string;
}

interface FacebookLoginResponse {
  id: string;
  email: string;
  name: string;
}

const GRAPH_API_URL = 'https://graph.facebook.com/';

const router = new Router();

router.post('/users/facebook', async (ctx: Context) => {
  const { token } = ctx.request.body;

  const facebookUserRepository = getManager().getRepository(FacebookUser);

  const loginRequest: FacebookLoginRequest = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: token,
    fields: 'id,email,name',
  };

  const qs = QueryString.stringify(loginRequest);

  try {
    const response = await axios.get(GRAPH_API_URL + 'me?' + qs);
    const data = response.data as FacebookLoginResponse;

    const user = facebookUserRepository.create({
      email: data.email,
      username: data.name,
      facebookUserId: data.id,
      createDate: new Date(),
      modifyDate: new Date(),
    });

    await user.save();

    ctx.body = {
      message: 'Good',
      data: {
        user,
      },
    };
  } catch (e) {
    const error = e as Error;
    console.error(error.message);

    ctx.status = 500;
    ctx.body = {
      message: 'Login Failed',
    };
  }
});

export default router;
