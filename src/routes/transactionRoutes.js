const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/:userId', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.patch('/:transactionId', transactionController.updateTransaction);
router.delete('/:transactionId', transactionController.deleteTransaction);

module.exports = router;