const express = require('express');
const { getLevelIncomeReports } = require('../controllers/levelIncomeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/reports', getLevelIncomeReports);

module.exports = router;
