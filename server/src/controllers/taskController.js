const { createTask, cancelTask } = require('../services/taskService');

exports.scheduleTask = async (req, res) => {
  const { type, scheduledAt } = req.body;
  try {
    const task = await createTask(type, new Date(scheduledAt), async () => {
      console.log(`Tâche ${type} exécutée à ${scheduledAt}`);
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la planification de la tâche.' });
  }
};

exports.cancelTask = async (req, res) => {
  const { jobId } = req.params;
  try {
    await cancelTask(jobId);
    res.status(200).json({ message: `Tâche ${jobId} annulée avec succès.` });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la tâche.' });
  }
};
