import Router from '@koa/router';
import axios, { AxiosResponse } from 'axios';
import QueryString from 'query-string';
import { getManager } from 'typeorm';
import { FacebookUser } from '@/entity/FacebookUser';
import { Readable } from 'stream';
import fs from 'fs';
import mime from 'mime';
import { User } from '@/entity/User';
import jwtValidate from '@/middleware/jwt-validate';
import { validate } from 'class-validator';

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

      const errors = await validate(user);

      if (errors.length > 0) {
        throw new Error('Validation failed');
      }

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
  })
  .get('/users/:id', async ctx => {
    const id: number = ctx.params.id;

    try {
      const user = await User.findOne(id);

      ctx.body = {
        data: { ...user },
      };
    } catch (e) {
      ctx.throw(500, e);
    }
  })
  .get('/users/me', jwtValidate(), async ctx => {
    const { id } = ctx.state.user;

    try {
      const user = await User.findOne(id);

      ctx.body = {
        data: user,
      };
    } catch (e) {
      ctx.throw(500, e);
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

    try {
      const user = await User.findOne(id);

      user.username = update.username;
      user.email = update.email || user.email;
      user.profileImage = update.profileImage || user.profileImage;

      const errors = await validate(user);

      if (errors.length > 0) {
        throw new Error('Validatoin Failed');
      }

      await user.save();

      ctx.body = {
        message: 'update success',
        data: { ...user },
      };
    } catch (e) {
      ctx.throw(e);
    }
  })
  .delete('/users/me', jwtValidate(), async ctx => {
    const { id } = ctx.state.user;

    try {
      await User.delete(id);
      console.log('Removed user: ' + id);

      ctx.body = {
        message: 'delete success',
      };
    } catch (e) {
      ctx.throw(e);
    }
  });

export default router;
