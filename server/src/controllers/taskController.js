const { createTask, cancelTask } = require('../services/taskService');
const { ScheduledTasks } = require('../models');
const express = require("express");
const router = express.Router()
const {authenticateJWT, checkAdmin} = require("../middlewares/auth");

router.get('/admin/tasks/list', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const tasks = await ScheduledTasks.findAll();
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la tâche', details: error.message });
  }
})

router.post('/admin/tasks/create', authenticateJWT, checkAdmin, async (req, res) => {
  const { type, scheduledAt } = req.body;
  try {
    const task = await createTask(type, new Date(scheduledAt), async () => {
      console.log(`Tâche ${type} exécutée à ${scheduledAt}`);
    });
    res.status(201).json({ message: `Tâche ${type} programmée pour le ${scheduledAt}`, task });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
  }
});

router.delete('/admin/tasks/cancel/:jobId', authenticateJWT, checkAdmin, async (req, res) => {
  const { jobId } = req.params;
  try {
    const task = await cancelTask(jobId);
    if (task) {
      res.status(200).json({ message: `Tâche ${jobId} annulée avec succès.`, task });
    } else {
      res.status(404).json({ message: `Tâche ${jobId} introuvable.` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la tâche.', details: error.message });
  }
});

module.exports = router