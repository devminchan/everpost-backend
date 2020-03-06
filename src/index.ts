import Koa from 'koa';
import apiRouter from './api';

const app = new Koa();

app.use(apiRouter.allowedMethods());
app.use(apiRouter.routes());

app.listen(4000, () => {
  console.log('Listening on port 4000');
});
