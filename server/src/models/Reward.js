module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define('reward', {
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
  });

  Reward.associate = function(models) {
    Reward.belongsToMany(models.user, { through: models.user_reward, foreignKey: 'user_id' });
  };
  return Reward;
};
