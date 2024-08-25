/**
 * Defines the Area model for the Sequelize ORM.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The data types provided by Sequelize.
 * @return {Object} The defined Area model.
 */
module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'code'
    },
    flag: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'flag'
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
    tableName: 'areas',
    timestamps: true
  });

  /**
   * Associates the Area model with the Competition model.
   *
   * @param {Object} models - The models object containing the Competition model.
   * @return {void}
   */
  Area.associate = (models) => {
    Area.hasMany(models.Competition, { foreignKey: 'area_id', as: 'Competitions' });
  };

  return Area;
};
