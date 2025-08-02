/**
 * Defines the User model for Sequelize and sets up associations with other models.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The Sequelize DataTypes object.
 * @return {Object} The User model.
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'username'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'email'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password'
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'img'
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id'
      },
      field: 'team_id'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'status'
    },
    last_connect: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_connect'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  /**
   * Associates the User model with other models.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void} This function does not return anything.
   */
  User.associate = (models) => {
    User.belongsToMany(models.Role, { through: models.UserRole, foreignKey: 'user_id' });
    User.hasMany(models.Bet, { foreignKey: 'user_id' });
    User.belongsToMany(models.Reward, { through: models.UserReward, foreignKey: 'user_id' });
    User.belongsTo(models.Team, { foreignKey: 'team_id', as: 'team' });
    User.hasMany(models.NotificationSubscription, { foreignKey: 'user_id', as: 'subscriptions' });
    User.hasMany(models.UserSeason, { foreignKey: 'user_id', as: 'user_seasons' });
  };

  return User;
};