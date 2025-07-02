const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken } = require('../middleware/auth');

// Invoice routes
router.post('/', verifyToken, invoiceController.createInvoice);
router.get('/', verifyToken, invoiceController.getAllInvoices);
router.get('/:id', verifyToken, invoiceController.getInvoice);
router.post('/:id/send', verifyToken, invoiceController.sendInvoice);

module.exports = router;
