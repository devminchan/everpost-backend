import Router from '@koa/router';
import { Context } from 'koa';
import axios from 'axios';
import QueryString from 'query-string';

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

router.post('/users', async (ctx: Context) => {
  const { token } = ctx.request.body;

  const loginRequest: FacebookLoginRequest = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_token: token,
    fields: 'id,email,name',
  };

  const qs = QueryString.stringify(loginRequest);

  console.log('qs: ' + qs);

  try {
    const response = await axios.get(GRAPH_API_URL + 'me?' + qs);
    const data = response.data as FacebookLoginResponse;

    ctx.body = {
      message: 'Login success',
      id: data.id,
    };
  } catch (e) {
    console.error(e.response.data);

    ctx.status = 500;
    ctx.body = {
      message: 'Login Failed',
    };
  }
});

export default router;
