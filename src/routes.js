import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import AuthMiddleware from './app/middlewares/auth';

const routes = Router();

const upload = multer(multerConfig);

// Routes unauthenticated

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(AuthMiddleware); // Middleware

// Routes authenticated

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.edit);
routes.delete('/users/:id', UserController.destroy);

routes.post('/files', upload.array('file'), FileController.store);

export default routes;
