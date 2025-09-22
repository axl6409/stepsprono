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
  const SpecialRuleResult = sequelize.define('SpecialRuleResult', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'id'
    },
    rule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rule_id',
      references: {
        model: 'special_rules',
        key: 'id'
      }
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'season_id',
      references: {
        model: 'seasons',
        key: 'id'
      }
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'config'
    },
    results: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'results'
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
    tableName: 'special_rules_results',
    timestamps: true
  });

  SpecialRuleResult.associate = function(models) {
    SpecialRuleResult.belongsTo(models.SpecialRule, { foreignKey: 'rule_id' });
    SpecialRuleResult.belongsTo(models.Season, { foreignKey: 'season_id' });
  };

  return SpecialRuleResult;
};