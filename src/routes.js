import { Router } from 'express';
import AuthMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';

const routes = Router();

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.edit);
routes.delete('/users/:id', UserController.destroy);

routes.use(AuthMiddleware);

// Routes authenticated

export default routes;
