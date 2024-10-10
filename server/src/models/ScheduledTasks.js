'use strict';
module.exports = (sequelize, DataTypes) => {
  const ScheduledTasks = sequelize.define('ScheduledTasks', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'type',
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_at',
    },
    job_id: {
      type: DataTypes.STRING,
      field: 'job_id',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      field: 'status',
    },
  }, {
    tableName: 'scheduled_tasks',
    timestamps: true
  });

  return ScheduledTasks;
};
