const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/:userId', habitController.getHabits);
router.patch('/:habitId/complete', habitController.completeHabit);
router.patch('/:habitId', habitController.updateHabit);
router.delete('/:habitId', habitController.deleteHabit);
router.post('/', habitController.createHabit);

module.exports = router;