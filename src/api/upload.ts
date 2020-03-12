import Router from '@koa/router';
import multer from '@koa/multer';
import { Context } from 'koa';
import mime from 'mime';

const router = new Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'resources/');
  },
  filename: function(req, file, cb) {
    const name = 'file_' + Math.random() * 100 + '-' + Date.now();
    const ext = mime.getExtension(file.mimetype);
    const fileDest = name + '.' + ext;

    cb(null, fileDest);
  },
});

const upload = multer({
  storage,
});

router.post('/upload', upload.array('files', 20), (ctx: Context) => {
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
