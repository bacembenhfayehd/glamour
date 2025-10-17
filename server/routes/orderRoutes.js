import express from 'express';
import { validateCreateOrder, validateMongoId, validateOrderQuery } from '../middleware/validaton.js';
import orderController from '../controllers/order-controller.js';
import authenticate from '../middleware/auth.js';



const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les utilisateurs
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);

router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

/* Routes pour les admins seulement
router.get('/', restrictTo('admin'), validateOrderQuery, orderController.getAllOrders);
router.patch('/:id/status', restrictTo('admin'), validateMongoId, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.get('/stats/overview', restrictTo('admin'), orderController.getOrderStats);*/

export default router;