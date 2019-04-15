import express from 'express';
import cookieSession from 'cookie-session';
// import { urlencoded } from 'body-parser';

// const urlencodedParser = urlencoded({ extended: false });
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['username'],
}));
