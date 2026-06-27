const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.post('/', goalController.createGoal); 
router.get('/:userId', goalController.getGoals);
router.post('/withdraw', goalController.withdrawContribution);
router.post('/contribution', goalController.addContribution);
router.patch('/:goalId', goalController.updateGoal);
router.delete('/:goalId', goalController.deleteGoal);

module.exports = router;