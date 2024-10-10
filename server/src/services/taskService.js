const { ScheduledTasks } = require('../models');
const schedule = require('node-schedule');
const logger = require('../utils/logger/logger');
const { Op } = require('sequelize');

// Fonction pour annuler toutes les tâches existantes par type et date exacte
async function cancelExistingTasksByJobId(jobId) {
  try {
    const task = await ScheduledTasks.findOne({
      where: {
        job_id: jobId
      }
    });

    if (task) {
      await cancelTask(task.job_id);
      logger.info(`Tâche annulée pour le job_id : ${jobId}`);
    } else {
      logger.warn(`Aucune tâche trouvée avec le job_id : ${jobId}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation des tâches existantes :', error);
    throw error;
  }
}

async function cancelTask(jobId) {
  try {
    const job = schedule.scheduledJobs[jobId];
    if (job) {
      job.cancel();
      await updateTaskStatus(jobId, 'cancelled');
      logger.info(`Tâche ${jobId} annulée avec succès.`);
    } else {
      logger.warn(`Aucune tâche trouvée avec l'ID ${jobId}`);
    }
  } catch (error) {
    logger.error('Erreur lors de l\'annulation de la tâche :', error);
    throw error;
  }
}

async function createOrReplaceTask(type, scheduledAt, taskFunction) {
  try {
    // Inclure la date et l'heure exacte dans le jobId
    const jobId = `${type}_${scheduledAt.toISOString()}`;

    // Annuler les tâches existantes avec le même jobId
    await cancelExistingTasksByJobId(jobId);

    // Planifier la nouvelle tâche avec le jobId basé sur la date
    const job = schedule.scheduleJob(jobId, scheduledAt, taskFunction);
    logger.info(`Nouvelle tâche planifiée avec jobId ${jobId} pour le ${scheduledAt}`);

    // Enregistrer la nouvelle tâche en base de données
    const task = await ScheduledTasks.create({
      type,
      scheduled_at: scheduledAt.toISOString(),
      job_id: jobId, // Utilisation du jobId basé sur la date et l'heure
      status: 'pending',
    });

    return task;
  } catch (error) {
    logger.error('Erreur lors de la création ou du remplacement de la tâche :', error);
    throw error;
  }
}

// Mise à jour du statut de la tâche
async function updateTaskStatus(jobId, status) {
  try {
    const task = await ScheduledTasks.findOne({ where: { job_id: jobId } });
    if (task) {
      task.status = status;
      await task.save();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la tâche :', error);
    throw error;
  }
}

module.exports = {
  createOrReplaceTask,
  cancelTask,
  cancelExistingTasksByJobId,
  updateTaskStatus,
};