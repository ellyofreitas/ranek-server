import Sequelize, { Model } from 'sequelize';

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        price: Sequelize.NUMBER,
        selled: Sequelize.BOOLEAN,
        description: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'user_id',
    });

    this.belongsToMany(models.File, {
      through: 'files_photos',
      as: 'photos',
      foreignKey: 'product_id',
      otherKey: 'file_id',
    });
  }
}

export default Product;
