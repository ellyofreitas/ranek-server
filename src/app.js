import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { resolve } from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      cors({
        exposedHeaders: 'x-total-count',
      })
    );
    this.server.use('/', express.static(resolve(__dirname, '..', 'public')));
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json(errors);
      }

      Sentry.captureMessage(errors);

      return res.status(500).json({
        error: 'Internal server error',
        validation: ['Erro interno no servidor'],
      });
    });
  }
}

export default new App().server;
