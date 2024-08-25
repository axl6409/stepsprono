/**
 * Defines the Role model for the Sequelize ORM.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The data types provided by Sequelize.
 * @return {Object} The defined Role model.
 */
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'name'
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
    tableName: 'roles',
    timestamps: true
  });

  /**
   * Associates the Role model with the User model through the UserRole model.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void}
   */
  Role.associate = (models) => {
    Role.belongsToMany(models.User, { through: models.UserRole, foreignKey: 'role_id' });
  };

  return Role;
};
