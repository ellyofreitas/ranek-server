import { Op } from 'sequelize';
import * as Yup from 'yup';

import User from '../models/User';
import Product from '../models/Product';
import Transaction from '../models/Transaction';

import { validate } from '../../util/validateSchema';

class TransactionController {
  async index(req, res) {
    const { buyer_id, salesman_id } = req.query;

    if (!buyer_id && !salesman_id) {
      return res.status(400).json({
        error: { message: 'You need to report an operation' },
      });
    }

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: {
          buyer_id: buyer_id || null,
          salesman_id: salesman_id || null,
        },
      },
      include: [
        {
          where: {
            id: {
              [Op.ne]: salesman_id || buyer_id,
            },
          },
          as: buyer_id ? 'salesman' : 'buyer',
          model: User,
        },
      ],
    });

    return res.json(transactions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
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
      product: Yup.object()
        .shape({
          id: Yup.number().required(),
          name: Yup.string().required(),
          price: Yup.number().required(),
          selled: Yup.boolean().required(),
          photos: Yup.array().required(),
          user_id: Yup.number().required(),
          description: Yup.string().required(),
        })
        .required(),
    });

    const validation = await validate(schema, req.body);

    if (validation.length) {
      return res.status(400).json({ error: 'Validation fails', validation });
    }

    if (req.body.salesman_id === req.userId) {
      return res.status(400).json({
        error: {
          message: `Owner can't buy your product`,
          validation: ['O dono não pode comprar um produto seu'],
        },
      });
    }

    const [buyer, salesman, product] = await Promise.all([
      User.findByPk(req.userId),
      User.findByPk(req.body.product.user_id),
      Product.findByPk(req.body.product.id),
    ]);

    if (!buyer) {
      return res
        .status(404)
        .json({ error: { message: 'Buyer user not exists' } });
    }

    if (!salesman) {
      return res
        .status(404)
        .json({ error: { message: 'Salesman user not exists' } });
    }

    if (product.selled) {
      return res
        .status(409)
        .json({ error: { message: 'Product is already sold' } });
    }

    req.body.product.selled = true;

    product.selled = true;

    await product.save();

    const transaction = await Transaction.create({
      ...req.body,
      buyer_id: req.userId,
      salesman_id: req.body.product.user_id,
    });

    return res.json(transaction);
  }
}

export default new TransactionController();
