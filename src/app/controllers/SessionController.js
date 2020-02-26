import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';

import authConfig from '../../config/auth';
import { validate } from '../../util/validateSchema';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email('Insira um e-mail válido.')
        .required('O campo de e-mail está vazio.'),
      password: Yup.string().required('O campo de senha está vazio.'),
    });

    const validation = await validate(schema, req.body);

    if (validation.length) {
      return res.status(400).json({ error: 'Validation fails', validation });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ error: 'User not found', validation: ['E-mail inválido.'] });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({
        error: 'Password does not match',
        validation: ['Senha inválida.'],
      });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }

  async show(req, res) {
    return res.json({ valid: true, message: 'Token valid' });
  }
}

export default new SessionController();
