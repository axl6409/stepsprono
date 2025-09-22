/**
 * Defines a Sequelize model for the 'SpecialDay' table with the following fields:
 * - 'name': string representing the special day name.
 * - 'rule_key': string identifying the associated rule.
 * - 'activation_date': date when the special day becomes active.
 * - 'status': string representing the current status.
 * - 'config': JSON field for specific configuration.
 * - 'selected_users': JSON field listing specific users for the special day.
 * - 'createdAt': creation timestamp.
 * - 'updatedAt': last update timestamp.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The data types provided by Sequelize.
 * @return {Model} The Sequelize model for the 'SpecialDay' table.
 */

module.exports = (sequelize, DataTypes) => {
  const SpecialRule = sequelize.define('SpecialRule', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    rule_key: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'rule_key',
    },
    activation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'activation_date',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'status',
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'config',
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
    tableName: 'special_rules',
    timestamps: true
  });

  SpecialRule.associate = function(models) {
    SpecialRule.hasMany(models.SpecialRuleResult, {
      as: 'results',
      foreignKey: 'rule_id'
    });
  };

  return SpecialRule;
};