const express = require('express');
const router = express.Router();
const { getRepurchaseIncomeReports } = require('../controllers/repurchaseIncomeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/reports', getRepurchaseIncomeReports);

module.exports = router;
