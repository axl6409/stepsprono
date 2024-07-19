/**
 * Defines the UserReward model and its associations with User and Reward models.
 *
 * @param {Object} sequelize - The Sequelize object
 * @param {Object} DataTypes - The data types object
 * @return {Object} The defined UserReward model
 */
module.exports = (sequelize, DataTypes) => {

  const UserReward = sequelize.define('UserReward', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id'
    },
    reward_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Rewards',
        key: 'id',
      },
      field: 'reward_id'
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
    tableName: 'user_rewards',
    timestamps: true
  });

  /**
   * Associates UserReward with User and Reward models.
   *
   * @param {Object} models - the Sequelize models object
   * @return {void}
   */
  UserReward.associate = (models) => {
    UserReward.belongsTo(models.User, { foreignKey: 'user_id' });
    UserReward.belongsTo(models.Reward, { foreignKey: 'reward_id' });
  }

  return UserReward
}