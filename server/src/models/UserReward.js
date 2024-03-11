/**
 * Defines the UserReward model and its associations with User and Reward models.
 *
 * @param {Object} sequelize - The Sequelize object
 * @param {Object} DataTypes - The data types object
 * @return {Object} The defined UserReward model
 */
module.exports = (sequelize, DataTypes) => {

  const UserReward = sequelize.define('UserReward', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    rewardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Rewards',
        key: 'id',
      }
    }
  });

  /**
   * Associates UserReward with User and Reward models.
   *
   * @param {Object} models - the Sequelize models object
   * @return {void}
   */
  UserReward.associate = (models) => {
    UserReward.belongsTo(models.User, { foreignKey: 'userId' });
    UserReward.belongsTo(models.Reward, { foreignKey: 'rewardId' });
  }

  return UserReward
}