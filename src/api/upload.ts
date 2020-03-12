import Router from '@koa/router';
import multer from '@koa/multer';
import mime from 'mime';
import jwtValidate from '@/middleware/jwt-validate';
import { DefaultContext, DefaultState } from 'koa';

const router = new Router<DefaultState, DefaultContext>();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'resources/');
  },
  filename: function(req, file, cb) {
    const randomNum = Math.floor(Math.random() * 1000);
    const name = 'file_' + randomNum + '-' + Date.now();
    const ext = mime.getExtension(file.mimetype);
    const fileDest = name + '.' + ext;

    cb(null, fileDest);
  },
});

const upload = multer({
  storage,
});

router.post('/upload', jwtValidate(), upload.array('files', 20), ctx => {
  if (!ctx.request.files || ctx.request.files.length === 0) {
    ctx.throw(400, new Error('No file uploaded'));
  }

  const filePaths = ctx.request.files.map(item => item.path);

  ctx.body = {
    message: 'upload success',
    data: {
      filePaths,
    },
  };
});

export default router;
