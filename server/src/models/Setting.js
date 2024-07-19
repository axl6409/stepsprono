module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'display_name',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    activeOption: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'active_option',
    }
  }, {
    tableName: 'Settings',
  });

  return Setting;
};
