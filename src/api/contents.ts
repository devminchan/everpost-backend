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

    const contents = await contentRepository.find({});

    ctx.body = {
      meta: {
        page: 1,
        count: contents.length,
      },
      documents: [...contents],
    };
  })
  .get('/contents/:id', jwtValidate(), async ctx => {
    const contentRepository = getRepository(Content);
    const id: number = Number.parseInt(ctx.params.id);

    const content = await contentRepository.findOne(id);
    // const fileResources = await content.fileResources;

    // id로 접근 시 찾지 못했을 경우 not found Error!
    if (content) {
      ctx.body = {
        ...content,
      };
    } else {
      ctx.throw(404, 'Content not found');
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

    const user = await userRepository.findOneOrFail({
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
      ...newContent,
    };
  })
  .patch('/contents/:id', jwtValidate(), async ctx => {
    interface UpdateContentRequest {
      title: string | null;
      filePaths?: string[] | null;
    }

    const contentRepository = getRepository(Content);
    const userRepository = getRepository(User);
    const fileResourceRepository = getRepository(FileResource);

    const { id } = ctx.state.user;
    const update = ctx.request.body as UpdateContentRequest;

    const contentId = Number.parseInt(ctx.params.id);

    const user = await userRepository.findOneOrFail(id);

    const content = await contentRepository.findOneOrFail({
      id: contentId,
      user,
    });

    if (update.filePaths) {
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

      await fileResourceRepository.save(fileResources);
      content.fileResources = fileResources;
    }

    content.title = update.title || content.title;

    await content.save();

    ctx.body = {
      ...content,
    };
  })
  .delete('/contents/:id', jwtValidate(), async ctx => {
    const userRepository = getRepository(User);
    const contentRepository = getRepository(Content);

    const { id } = ctx.state.user;
    const contentId = Number.parseInt(ctx.params.id);

    const user = await userRepository.findOneOrFail(id);

    const result = await contentRepository.delete({
      id: contentId,
      user,
    });

    if (result.affected > 0) {
      ctx.body = {
        message: 'delete succss',
      };
    } else {
      ctx.throw(404, 'Content not found');
    }
  });

export default router;
