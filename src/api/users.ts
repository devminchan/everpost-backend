import Router from '@koa/router';
import { Context } from 'koa';
import axios, { AxiosResponse } from 'axios';
import QueryString from 'query-string';
import { getManager } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import { Readable } from 'stream';
import fs from 'fs';
import mime from 'mime';

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

const RESOURCE_PATH = 'resources/';

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

  const saveImageToLocal = async (
    url: string,
    imagePath: string,
  ): Promise<string> => {
    const streamRes = (await axios({
      url,
      responseType: 'stream',
    })) as AxiosResponse<Readable>;

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(RESOURCE_PATH)) {
        fs.mkdirSync(RESOURCE_PATH);
      }

      const ext = mime.getExtension(streamRes.headers['content-type']);
      const filePath = RESOURCE_PATH + imagePath + '.' + ext; // <fileName>.jpg

      streamRes.data
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          resolve(filePath);
        })
        .on('error', e => {
          reject(e);
        });
    });
  };

  try {
    const response = await axios.get(GRAPH_API_URL + 'me?' + qs);
    const data = response.data as FacebookLoginResponse;

    const downloadUrl = GRAPH_API_URL + `${data.id}/` + 'picture?type=large';
    const saveResult = await saveImageToLocal(downloadUrl, data.id);

    console.log('file saved as ' + saveResult);

    const user = facebookUserRepository.create({
      email: data.email,
      username: data.name,
      facebookUserId: data.id,
      profileImage: saveResult,
    });

    await user.save();

    console.log(`User ${user.email} is now registered`);

    ctx.body = {
      message: 'Success',
      data: {
        user,
      },
    };
  } catch (e) {
    const error = e as Error;
    console.error(error);

    ctx.status = 500;
    ctx.body = {
      message: 'Login Failed',
      reason: error.message,
    };
  }
});

export default router;
