module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Settings', {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'key',
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'display_name',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'options',
    },
    active_option: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'active_option',
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
    tableName: 'settings',
    timestamps: true
  });

  return Setting;
};
