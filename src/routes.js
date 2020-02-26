import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProductController from './app/controllers/ProductController';
import SessionController from './app/controllers/SessionController';
import TransactionController from './app/controllers/TransactionController';
// import FileController from './app/controllers/FileController';

import AuthMiddleware from './app/middlewares/auth';

const routes = Router();

const upload = multer(multerConfig);

// Routes unauthenticated

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.get('/products', ProductController.index);
routes.get('/products/:id', ProductController.show);

// Routes authenticated

routes.use(AuthMiddleware); // Middleware

routes.get('/sessions', SessionController.show); // Verify

routes.post('/products', upload.array('file'), ProductController.store);
routes.delete('/products/:id', ProductController.destroy);

routes.get('/users', UserController.show);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.edit);
routes.delete('/users/:id', UserController.destroy);

routes.get('/transactions', TransactionController.index);
routes.post('/transactions', TransactionController.store);

export default routes;
