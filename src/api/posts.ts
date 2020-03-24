import Router from '@koa/router';

import jwtValidate from '@/middleware/jwt-validate';
import { User } from '@/entity/User';
import { Post } from '@/entity/Post';
import { getRepository } from 'typeorm';
import { FileResource } from '@/entity/FileResource';

const router = new Router();

router
  .get('/posts', async ctx => {
    const contentRepository = getRepository(Post);

    const contents = await contentRepository.find({});

    ctx.body = {
      meta: {
        page: 1,
        count: contents.length,
      },
      documents: [...contents],
    };
  })
  .get('/posts/:id', jwtValidate(), async ctx => {
    const contentRepository = getRepository(Post);
    const id: number = Number.parseInt(ctx.params.id);

    const content = await contentRepository.findOne(id);
    await content.fileResources;

    // id로 접근 시 찾지 못했을 경우 not found Error!
    if (content) {
      ctx.body = {
        ...content,
      };
    } else {
      ctx.throw(404, 'Content not found');
    }
  })
  .post('/posts', jwtValidate(), async ctx => {
    interface CreateContentRequest {
      title: string;
      filePaths?: string[];
    }

    const contentRepository = getRepository(Post);
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
            post: newContent,
          });
        },
      );

      await fileResourceRepository.save(fileResources);
    }

    ctx.body = {
      ...newContent,
    };
  })
  .patch('/posts/:id', jwtValidate(), async ctx => {
    interface UpdateContentRequest {
      title: string | null;
      content: string | null;
      filePaths?: string[] | null;
    }

    const contentRepository = getRepository(Post);
    const userRepository = getRepository(User);
    const fileResourceRepository = getRepository(FileResource);

    const { id } = ctx.state.user;
    const update = ctx.request.body as UpdateContentRequest;

    const contentId = Number.parseInt(ctx.params.id);

    const user = await userRepository.findOneOrFail(id);

    const post = await contentRepository.findOneOrFail({
      id: contentId,
      user,
    });

    if (update.filePaths) {
      await fileResourceRepository.delete({
        post: post,
      });

      const fileResources: FileResource[] = update.filePaths.map(
        (item: string): FileResource => {
          return fileResourceRepository.create({
            fileUrl: item,
            post: post,
          });
        },
      );

      await fileResourceRepository.save(fileResources);
      post.fileResources = fileResources;
    }

    post.title = update.title || post.title;
    post.content = update.content || post.content;

    await post.save();

    ctx.body = {
      ...post,
    };
  })
  .delete('/posts/:id', jwtValidate(), async ctx => {
    const userRepository = getRepository(User);
    const contentRepository = getRepository(Post);

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
