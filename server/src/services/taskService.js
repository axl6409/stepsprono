const { ScheduledTasks } = require('../models');
const schedule = require('node-schedule');
const logger = require("../utils/logger/logger");

async function createTask(type, scheduledAt, taskFunction) {
  try {
    const job = schedule.scheduleJob(scheduledAt, taskFunction);
    logger.info(`scheduledAt ${scheduledAt}`);
    const task = await ScheduledTasks.create({
      type,
      scheduled_at: scheduledAt.toISOString(),
      job_id: job.name,
      status: 'pending',
    });

    return task;
  } catch (error) {
    console.error('Erreur lors de la création de la tâche :', error);
    throw error;
  }
}

async function updateTaskStatus(jobId, status) {
  try {
    const task = await ScheduledTasks.findOne({ where: { jobId } });
    if (task) {
      task.status = status;
      await task.save();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la tâche :', error);
    throw error;
  }
}

async function cancelTask(jobId) {
  try {
    const job = schedule.scheduledJobs[jobId];
    if (job) {
      job.cancel();
      await updateTaskStatus(jobId, 'cancelled');
      console.log(`Tâche ${jobId} annulée avec succès.`);
    } else {
      console.log(`Aucune tâche trouvée avec l'ID ${jobId}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la tâche :', error);
    throw error;
  }
}

module.exports = {
  createTask,
  cancelTask,
  updateTaskStatus,
};
