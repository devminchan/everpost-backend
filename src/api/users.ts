import Router from '@koa/router';
import { Context } from 'koa';
import axios, { AxiosResponse } from 'axios';
import QueryString from 'query-string';
import { getManager } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import { Readable } from 'stream';
import fs from 'fs';
import mime from 'mime';
import { resolve } from 'url';

export interface FacebookLoginRequest {
  access_token: string;
  fields: string;
}

export interface FacebookLoginResponse {
  id: string;
  email: string;
  name: string;
}

export const GRAPH_API_URL = 'https://graph.facebook.com/';

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

  const saveImageToLocal = (url: string, imagePath: string): Promise<void> => {
    return axios({
      url,
      responseType: 'stream',
    }).then((res: AxiosResponse<Readable>) => {
      new Promise(resolve => {
        const ext = mime.getExtension(res.headers['Content-Type']);
        const filePath = imagePath + '.' + ext;

        res.data
          .pipe(fs.createWriteStream(filePath))
          .on('finish', () => {
            resolve(filePath);
          })
          .on('error', e => {
            throw new Error(e);
          });
      });
    });
  };

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

    const downloadUrl = GRAPH_API_URL + `${data.id}/` + 'picture?type=large';

    saveImageToLocal(downloadUrl, data.id);

    ctx.body = {
      message: 'Success',
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
