const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/:userId', habitController.getHabits);
router.patch('/:habitId/complete', habitController.completeHabit);
router.put('/:habitId', habitController.updateHabit);
router.delete('/:habitId', habitController.deleteHabit);

module.exports = router;