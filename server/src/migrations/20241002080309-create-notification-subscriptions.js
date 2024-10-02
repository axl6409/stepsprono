module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      endpoint: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'endpoint'
      },
      expirationTime: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'expiration_time'
      },
      keys_p256dh: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'keys_p256dh'
      },
      keys_auth: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'keys_auth'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'user_id'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification_subscriptions');
  }
};