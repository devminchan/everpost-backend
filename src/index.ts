import { Context } from 'koa';

const Koa = require('koa');

const app = new Koa();

app.use((ctx: Context) => {
  ctx.body = 'hello world!';
});

app.listen(4000, () => {
  console.log('Listening on port 4000');
});