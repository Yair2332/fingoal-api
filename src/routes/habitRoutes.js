const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/:userId', habitController.getHabits);
router.patch('/:habitId/complete', habitController.completeHabit);
router.patch('/:habitId', habitController.updateHabit);
router.delete('/:habitId', habitController.deleteHabit);
router.post('/', habitController.createHabit);
router.patch('/:habitId/toggle', habitController.toggleHabit);

module.exports = router;