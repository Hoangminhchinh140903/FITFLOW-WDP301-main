const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/checkout', authenticate, orderController.checkout);
router.post('/guest-checkout', orderController.guestCheckout);
router.post('/walk-in', authenticate, orderController.createWalkInOrder);
router.get('/guest/:id', orderController.getGuestSaleOrderById);
router.put('/guest/:id/cancel', orderController.cancelGuestSaleOrder);
router.put('/guest/:id/return', orderController.returnGuestSaleOrder);
router.get('/my', authenticate, orderController.getMySaleOrders);
router.get('/my/:id', authenticate, orderController.getMySaleOrderById);
router.put('/my/:id/cancel', authenticate, orderController.cancelMySaleOrder);
router.put('/my/:id/return', authenticate, orderController.returnMySaleOrder);

module.exports = router;
