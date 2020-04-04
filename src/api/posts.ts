import Router from '@koa/router';

import jwtValidate from '@/middleware/jwt-validate';
import { User } from '@/entity/User';
import { Post } from '@/entity/Post';
import { FileResource } from '@/entity/FileResource';

const router = new Router();

router
  .get('/posts', async ctx => {
    interface PostPaginationRequest {
      page: number;
      size: number;
    }

    const req = ctx.query as PostPaginationRequest;

    const size = req.size || 20;
    const offset = req.page ? (req.page - 1) * size : 0;

    console.log(offset);

    const [contents, count] = await Post.createQueryBuilder('post')
      .orderBy('createDate')
      .offset(offset)
      .limit(size)
      .getManyAndCount();

    ctx.body = {
      meta: {
        page: req.page || 0,
        count: count,
        maxCount: size,
      },
      documents: contents,
    };
  })
  .get('/posts/:id', jwtValidate(), async ctx => {
    const id: number = Number.parseInt(ctx.params.id);

    const content = await Post.findOneOrFail(id);
    await content.fileResources;

    ctx.body = {
      ...content,
    };
  })
  .post('/posts', jwtValidate(), async ctx => {
    interface CreateContentRequest {
      title: string;
      content: string;
      filePaths?: string[];
    }

    const { id } = ctx.state.user;
    const { title, content, filePaths } = ctx.request
      .body as CreateContentRequest;

    const user = await User.findOneOrFail(id);

    const newContent = Post.create({
      user,
      title,
      content,
    });

    await newContent.save();

    if (filePaths) {
      const fileResources: FileResource[] = filePaths.map(
        (item: string): FileResource => {
          return FileResource.create({
            fileUrl: item,
            post: newContent,
          });
        },
      );

      await FileResource.save(fileResources);
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

    const { id } = ctx.state.user;
    const update = ctx.request.body as UpdateContentRequest;

    const contentId = Number.parseInt(ctx.params.id);

    const user = await User.findOneOrFail(id);

    const post = await Post.findOneOrFail({
      id: contentId,
      user,
    });

    if (update.filePaths) {
      await FileResource.delete({
        post: post,
      });

      const fileResources: FileResource[] = update.filePaths.map(
        (item: string): FileResource => {
          return FileResource.create({
            fileUrl: item,
            post: post,
          });
        },
      );

      await FileResource.save(fileResources);
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
    const { id } = ctx.state.user;
    const contentId = Number.parseInt(ctx.params.id);

    const user = await User.findOneOrFail(id);

    const result = await Post.delete({
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
