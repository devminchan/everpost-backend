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
  .get('/contents/:id', jwtValidate(), async ctx => {
    const contentRepository = getRepository(Content);
    const id: number = ctx.params.id;

    try {
      const content = await contentRepository.findOne(id);
      const fileResources = await content.fileResources;

      ctx.body = {
        data: {
          ...content,
          fileResources,
        },
      };
    } catch (e) {
      ctx.throw(e);
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
              fileUrl: item,
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
  })
  .patch('/contents/:id', jwtValidate(), async ctx => {
    interface UpdateContentRequest {
      title: string | null;
      filePaths?: string[] | null;
    }

    const { id } = ctx.state.user;
    const update = ctx.request.body as UpdateContentRequest;

    const contentId = Number.parseInt(ctx.params.id as string);

    console.log(id, contentId);

    try {
      const user = await User.findOne(id);

      const content = await Content.findOne({
        id: contentId,
        user,
      });

      console.log(content);

      if (!content) {
        throw new Error('Content not found');
      }

      if (update.filePaths) {
        const fileResourceRepository = getRepository(FileResource);

        await fileResourceRepository.delete({
          content,
        });

        const fileResources: FileResource[] = update.filePaths.map(
          (item: string): FileResource => {
            return fileResourceRepository.create({
              fileUrl: item,
              content,
            });
          },
        );

        fileResourceRepository.save(fileResources);
        content.fileResources = fileResources;
      }

      content.title = update.title || content.title;

      await content.save();

      ctx.body = {
        message: 'update success',
        data: {
          ...content,
        },
      };
    } catch (e) {
      ctx.throw(e);
    }
  });

export default router;
