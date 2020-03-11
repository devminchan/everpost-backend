import koaJwt from 'koa-jwt';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function() {
  return koaJwt({ secret: process.env.JWT_SECRET, key: 'user' });
}
