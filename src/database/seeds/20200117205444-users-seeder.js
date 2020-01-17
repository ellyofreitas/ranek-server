module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'admin',
          email: 'admin@admin.com',
          password:
            'a$2a$08$fU7VIPXzx5zJAPKlI5xynep4UibXcfXthKT7/nviCIQlnTkFxTi1Gdmin', // admin
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('admins', null, {});
  },
};
