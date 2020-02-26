import Sequelize, { Model } from 'sequelize';

class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.JSONB,
        address: Sequelize.JSONB,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'buyer',
      foreignKey: 'buyer_id',
      // targetKey: 'buyer_id',
    });

    this.belongsTo(models.User, {
      as: 'salesman',
      foreignKey: 'salesman_id',
      // targetKey: 'salesman_id',
    });
  }
}

export default Transaction;
