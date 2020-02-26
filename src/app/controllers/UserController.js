import * as Yup from 'yup';
import User from '../models/User';
import Address from '../models/Address';

import { validate } from '../../util/validateSchema';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      include: [
        {
          model: Address,
          as: 'address',
        },
      ],
    });
    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O campo de nome está vazio.'),
      email: Yup.string()
        .email('Insira um e-mail válido.')
        .required('O campo de e-mail está vazio.'),
      password: Yup.string()
        .required('O campo de senha está vazio.')
        .min(6, 'O campo de senha deve ter no mínimo 6 caracteres.'),
      address: Yup.object()
        .shape({
          zipcode: Yup.string().required('O campo de CEP está vazio.'),
          street: Yup.string().required('O campo de rua está vazio.'),
          number: Yup.string().required('O campo de número está vazio.'),
          city: Yup.string().required('O campo de cidade está vazio.'),
          state: Yup.string().required('O campo de estado está vazio.'),
          strict: Yup.string().required('O campo de bairro está vazio.'),
        })
        .required('Complete os campos de endereço.'),
    });

    const validation = await validate(schema, req.body);

    if (validation.length) {
      return res.status(400).json({ error: 'Validation fails', validation });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({
        error: 'User already exists',
        validation: ['E-mail já cadastrado.'],
      });
    }

    const [user, address] = await Promise.all([
      User.create(req.body),
      Address.create(req.body.address),
    ]);

    user.address_id = address.id;

    await user.save();

    await user.reload({
      include: [
        {
          model: Address,
          as: 'address',
        },
      ],
    });

    return res.json(user);
  }

  async show(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    await user.reload({
      attributes: ['id', 'email', 'name', 'address_id'],
      include: [
        {
          model: Address,
          as: 'address',
        },
      ],
    });

    return res.json(user);
  }

  async edit(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email('Insira um e-mail válido.'),
      oldPassword: Yup.string().min(
        6,
        'O campo de senha deve ter no mínimo 6 caracteres.'
      ),
      password: Yup.string()
        .min(6, 'O campo de nova senha deve ter no mínimo 6 caracteres.')
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      address: Yup.object().shape({
        zipcode: Yup.string(),
        street: Yup.string(),
        number: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        strict: Yup.string(),
      }),
      // confirmPassword: Yup.string().when('password', (password, field) =>
      //   password ? field.required().oneOf([Yup.ref('password')]) : field
      // ),
    });

    const validation = await validate(schema, req.body);

    if (validation.length) {
      return res.status(400).json({ error: 'Validation fails', validation });
    }

    const { email, oldPassword } = req.body;

    try {
      const user = await User.findByPk(req.userId);

      if (email !== user.email) {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
          return res.status(400).json({
            error: 'User already exists',
            validation: ['Este e-mail já está em uso'],
          });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({
          error: 'Password does not match',
          validation: ['Senha inválida'],
        });
      }

      if (req.body.address) {
        const address = await user.getAddress();
        await address.update(req.body.address);
      }

      await user.update(req.body);
      await user.reload({
        include: [
          {
            model: Address,
            as: 'address',
          },
        ],
      });

      return res.json(user);
    } catch (err) {
      return res.status(400).json({
        error: { message: 'Bad request' },
        validation: ['Alguma dado foi enviado de forma incorreta'],
      });
    }
  }

  async destroy(req, res) {
    const userExists = await User.findByPk(req.userId);

    if (!userExists) {
      return res.staus(404).json({ error: 'User not found' });
    }

    await userExists.destroy();

    return res.status(204).json({});
  }
}

export default new UserController();
