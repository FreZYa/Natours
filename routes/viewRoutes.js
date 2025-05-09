const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

module.exports = router;

router.get('/', viewsController.getOverview);

router.get('/tour', viewsController.getTour);

