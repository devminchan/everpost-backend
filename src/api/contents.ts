import Router from '@koa/router';

import jwtValidate from '@/middleware/jwt-validate';
import { User } from '@/entity/User';
import { Content } from '@/entity/Content';
import { getRepository } from 'typeorm';
import { FileResource } from '@/entity/FileResource';

const router = new Router();

router
  .get('/contents', async ctx => {
    const contentRepository = getRepository(Content);

    try {
      const contents = await contentRepository.find({});

      ctx.body = {
        data: {
          contents,
        },
      };
    } catch (e) {
      console.error(e);

      ctx.throw(500, new Error('조회 실패'));
    }
  })
  .post('/contents', jwtValidate(), async ctx => {
    interface CreateContentRequest {
      title: string;
      filePaths?: string[];
    }

    const contentRepository = getRepository(Content);
    const userRepository = getRepository(User);
    const fileResourceRepository = getRepository(FileResource);

    const { id } = ctx.state.user;
    const { title, filePaths } = ctx.request.body as CreateContentRequest;

    try {
      const user = await userRepository.findOne({
        id,
      });

      const newContent = contentRepository.create({
        user,
        title,
      });

      await newContent.save();

      if (filePaths) {
        const fileResources: FileResource[] = filePaths.map(
          (item: string): FileResource => {
            return fileResourceRepository.create({
              imageUrl: item,
              content: newContent,
            });
          },
        );

        await fileResourceRepository.save(fileResources);
      }

      ctx.body = {
        data: {
          newContent,
        },
      };
    } catch (e) {
      ctx.throw(e);
    }
  });

export default router;
