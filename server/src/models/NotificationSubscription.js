module.exports = (sequelize, DataTypes) => {
  const NotificationSubscription = sequelize.define('NotificationSubscription', {
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'endpoint'
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
