import Sequelize, { Model } from 'sequelize';

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        zipcode: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.NUMBER,
        district: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        strict: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }
}

export default Address;
