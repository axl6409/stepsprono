/**
 * Defines a Reward model with name, description, image, rank, and type attributes.
 *
 * @param {Object} sequelize - the Sequelize object
 * @param {Object} DataTypes - the data types object
 * @return {Object} the defined Reward model
 */
module.exports = (sequelize, DataTypes) => {

  const Reward = sequelize.define('Reward', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  });

  /**
   * Associates Reward with User through UserReward.
   *
   * @param {Object} models - the models object
   * @return {void}
   */
  Reward.associate = function(models) {
    Reward.belongsToMany(models.User, { through: models.UserReward, foreignKey: 'userId' });
  }

  return Reward
}