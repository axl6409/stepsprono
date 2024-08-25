/**
 * Defines the Reward model and its associations with User model.
 *
 * @param {Object} sequelize - The Sequelize object
 * @param {Object} DataTypes - The data types object
 * @return {Object} The defined Reward model
 */
module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define('Reward', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'slug',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'description',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image',
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'rank',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'type',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'active',
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
    tableName: 'rewards',
    timestamps: true
  });

  /**
   * Associates the Reward model with the User model through the UserReward model.
   *
   * @param {Object} models - The Sequelize models object
   * @return {void}
   */
  Reward.associate = function(models) {
    Reward.belongsToMany(models.User, { through: models.UserReward, foreignKey: 'reward_id' });
  };
  return Reward;
};
