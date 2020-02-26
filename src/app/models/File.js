import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            const isUrlPath = String(this.path).includes('http');

            return isUrlPath
              ? this.path
              : `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      { sequelize }
    );
    return this;
  }
}

export default File;
