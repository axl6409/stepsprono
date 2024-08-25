/**
 * Defines a Sequelize model for the 'Setting' table with the following fields:
 * - 'key': a unique string representing the setting key.
 * - 'display_name': a string representing the display name of the setting.
 * - 'type': a string representing the type of the setting.
 * - 'description': a text field representing the description of the setting.
 * - 'options': a JSON field representing the options of the setting.
 * - 'active_option': a string representing the active option of the setting.
 * - 'createdAt': a date field representing the creation date of the setting.
 * - 'updatedAt': a date field representing the last update date of the setting.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The data types provided by Sequelize.
 * @return {Model} The Sequelize model for the 'Setting' table.
 */
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
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
