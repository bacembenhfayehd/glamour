import express from 'express';

import authenticate from '../middleware/auth.js';
import cartController from '../controllers/cart-controller.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes du panier
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/item/:productId',  cartController.updateCartItem);
router.delete('/item/:productId',  cartController.decreaseItemQte);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Route pour créer une commande directement depuis le panier
router.post('/checkout',  cartController.createOrderFromCart);

export default router;