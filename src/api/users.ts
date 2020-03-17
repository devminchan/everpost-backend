import Router from '@koa/router';
import axios, { AxiosResponse } from 'axios';
import QueryString from 'query-string';
import { getRepository } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import { Readable } from 'stream';
import fs from 'fs';
import mime from 'mime';
import { User } from '@/entity/User';
import jwtValidate from '@/middleware/jwt-validate';

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

router
  .post('/users/facebook', async ctx => {
    const facebookUserRepository = getRepository(FacebookUser);

    const { token } = ctx.request.body;

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
      ...user,
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
    const userRepository = getRepository(User);

    const { id } = ctx.state.user;

    const result = await userRepository.delete(id);

    if (result.affected > 0) {
      console.log('Removed user: ' + id);
    } else {
      throw new Error('Removing user failed');
    }

    ctx.body = {
      message: 'delete success',
    };
  });

export default router;
