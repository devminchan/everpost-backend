import Koa from 'koa';
import apiRouter from './api';
import bodyparser from 'koa-bodyparser';

const app = new Koa();

app.use(bodyparser());

app.use(apiRouter.allowedMethods());
app.use(apiRouter.routes());

app.listen(4000, () => {
  console.log('Listening on port 4000');
});
