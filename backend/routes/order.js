import express from 'express';
import orderController from '../controllers/orderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, orderController.createOrder);
router.get('/user', auth, orderController.getUserOrders);
router.get('/canteen/:canteenId/completed', auth, orderController.getCanteenCompletedOrders);
router.get('/canteen/:canteenId', auth, orderController.getCanteenOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, orderController.updateOrderStatus);
router.put('/:id/cancel', auth, orderController.cancelOrder);
router.post('/:id/feedback', auth, orderController.submitFeedback);

export default router;
