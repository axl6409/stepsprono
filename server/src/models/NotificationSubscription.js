module.exports = (sequelize, DataTypes) => {
  const NotificationSubscription = sequelize.define('NotificationSubscription', {
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'endpoint'
    },
    expirationTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiration_time'
    },
    keys_p256dh: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'keys_p256dh'
    },
    keys_auth: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'keys_auth'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id'
    },
  }, {
    tableName: 'notification_subscriptions',
    timestamps: true,
  });

  NotificationSubscription.associate = (models) => {
    NotificationSubscription.belongsTo(models.User, { foreignKey: 'user_id', as: 'subscriptions' });
  };

  return NotificationSubscription;
};
