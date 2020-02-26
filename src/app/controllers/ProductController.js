import { Op } from 'sequelize';
import * as Yup from 'yup';

import Product from '../models/Product';
import File from '../models/File';
import User from '../models/User';
import Address from '../models/Address';

import { validate } from '../../util/validateSchema';

class ProductController {
  async index(req, res) {
    const { _limit, _page = 1, q, user_id } = req.query;

    const products = await Product.findAll({
      limit: _limit || null,
      offset: (_page - 1) * _limit || 0,
      where: {
        name: {
          [Op.iLike]: q ? `%${q}%` : '%',
        },
      },
      attributes: ['id', 'name', 'price', 'selled', 'description', 'user_id'],
      include: [
        {
          as: 'owner',
          model: User,
          attributes: ['id', 'name', 'email', 'address_id'],
          required: !!user_id,
          where: {
            id: user_id || null,
          },
          include: [
            {
              as: 'address',
              model: Address,
              attributes: [
                'id',
                'zipcode',
                'street',
                'number',
                'district',
                'city',
                'state',
              ],
            },
          ],
        },
        {
          as: 'photos',
          model: File,
          attributes: ['url', 'id', 'name', 'path'],
          through: {
            attributes: [],
          },
        },
      ],
    });

    const count = await Product.count();

    res.set('x-total-count', count);

    return res.json(products);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O campo de nome está vazio.'),
      price: Yup.number().required('O campo de preço está vazio.'),
      description: Yup.string().required('O campo de descrição está vazio.'),
    });

    const validation = await validate(schema, req.body);

    if (validation.length) {
      return res.status(400).json({ error: 'Validation fails', validation });
    }

    const userExists = await User.findByPk(req.userId);

    if (!userExists) {
      return res
        .status(404)
        .json({ error: 'User not exists', validation: ['E-mail inválido.'] });
    }

    const product = await Product.create({ ...req.body, user_id: req.userId });

    if (req.files && req.files.length) {
      const files = await Promise.all(
        req.files.map(f => {
          const { originalname: name, filename: path, location } = f;

          const file = File.create({
            name,
            path: process.env.NODE_ENV === 'development' ? path : location,
          });

          return file;
        })
      );

      await product.addPhoto(files);
    }

    await product.reload({
      attributes: ['id', 'name', 'price', 'selled', 'description', 'user_id'],
      include: [
        {
          as: 'owner',
          model: User,
          attributes: ['id', 'name', 'email', 'address_id'],
          include: [
            {
              as: 'address',
              model: Address,
            },
          ],
        },
        {
          as: 'photos',
          model: File,
          required: false,
          attributes: ['url', 'id', 'name', 'path'],
          through: {
            attributes: [],
          },
        },
      ],
    });

    return res.json(product);
  }

  async show(req, res) {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.reload({
      include: [
        {
          as: 'owner',
          model: User,
          attributes: ['id', 'name', 'email', 'address_id'],
          include: [
            {
              as: 'address',
              model: Address,
              attributes: [
                'id',
                'zipcode',
                'street',
                'number',
                'district',
                'city',
                'state',
              ],
            },
          ],
        },
        {
          as: 'photos',
          required: false,
          model: File,
          attributes: ['url', 'id', 'name', 'path'],
          through: {
            attributes: [],
          },
        },
      ],
      attributes: ['id', 'name', 'price', 'selled', 'description', 'user_id'],
    });

    return res.json(product);
  }

  async edit(req, res) {
    return res.json({});
  }

  async destroy(req, res) {
    const { id } = req.params;

    const productExists = await Product.findByPk(id);

    if (!productExists) {
      return res.staus(404).json({ error: 'Product not found' });
    }

    await productExists.destroy();

    return res.json({});
  }
}

export default new ProductController();
