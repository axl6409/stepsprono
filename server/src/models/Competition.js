/**
 * Defines the Competition model for Sequelize and sets up associations with other models.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The Sequelize DataTypes object.
 * @return {Object} The Competition model.
 */
module.exports = (sequelize, DataTypes) => {
  const Competition = sequelize.define('Competition', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Area',
        key: 'id',
      },
      field: 'area_id'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'type'
    },
    emblem: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'emblem'
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
    tableName: 'competitions',
    timestamps: true
  });

  /**
   * Associates the Competition model with the Area and Season models.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void}
   */
  Competition.associate = (models) => {
    Competition.belongsTo(models.Area, { foreignKey: 'area_id', as: 'Area' });
    Competition.hasMany(models.Season, { foreignKey: 'competition_id' });
  };

  return Competition;
};
