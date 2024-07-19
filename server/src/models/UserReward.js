/**
 * Defines the UserReward model and its associations with User and Reward models.
 *
 * @param {Object} sequelize - The Sequelize object
 * @param {Object} DataTypes - The data types object
 * @return {Object} The defined UserReward model
 */
module.exports = (sequelize, DataTypes) => {

  const UserReward = sequelize.define('user_reward', {
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
    }
  });

  /**
   * Associates UserReward with User and Reward models.
   *
   * @param {Object} models - the Sequelize models object
   * @return {void}
   */
  UserReward.associate = (models) => {
    UserReward.belongsTo(models.user, { foreignKey: 'user_id' });
    UserReward.belongsTo(models.reward, { foreignKey: 'reward_id' });
  }

  return UserReward
}