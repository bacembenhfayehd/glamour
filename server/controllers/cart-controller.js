import cartService from '../services/cart-service.js';
import orderServices from '../services/order-services.js';
import helpers from '../utils/helpers.js';

const { successResponse } = helpers;

export const cartController = {
  // Récupérer le panier de l'utilisateur
  getCart: async (req, res, next) => {
    try {
      const userId = req.user._id;

      const cart = await cartService.getOrCreateCart(userId);
      const total = await cartService.calculateCartTotal(cart);

      const response = {
        cart: {
          ...cart.toObject(),
          total,
          itemCount: cart.items.length
        }
      };

      successResponse(res, response, 'Panier récupéré avec succès');
    } catch (error) {
      next(error);
    }
  },

  // Ajouter un produit au panier
  addToCart: async (req, res, next) => {
    try {
      const { product: productId, quantity = 1 } = req.body;
      const userId = req.user._id;

      const { cart, total } = await cartService.addToCart(userId, productId, quantity);

      const response = {
        cart: {
          ...cart.toObject(),
          total,
          itemCount: cart.items.length
        }
      };

      successResponse(res, response, 'Produit ajouté au panier avec succès');
    } catch (error) {
      next(error);
    }
  },

  
  updateCartItem: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user._id;

      const { cart, total } = await cartService.updateCartItemQuantity(userId, productId, quantity);

      const response = {
        cart: {
          ...cart.toObject(),
          total,
          itemCount: cart.items.length
        }
      };

      successResponse(res, response, 'Quantité mise à jour avec succès');
    } catch (error) {
      
    if (error.statusCode === 400 && error.message.includes('stock disponible')) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
        error: {
          type: 'STOCK_ERROR',
          details: error.message
        }
      });
    }
    next(error);
  }
  },


  decreaseItemQte: async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const { cart, total } = await cartService.decreaseItemQuantity(userId, productId);

    const response = {
      cart: {
        ...cart.toObject(),
        total,
        itemCount: cart.items.length
      }
    };

    successResponse(res, response, 'Quantité diminuée avec succès');
  } catch (error) {
    next(error);
  }
},
 
  removeFromCart: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      const { cart, total } = await cartService.removeFromCart(userId, productId);

      const response = {
        cart: {
          ...cart.toObject(),
          total,
          itemCount: cart.items.length
        }
      };

      successResponse(res, response, 'Produit supprimé du panier avec succès');
    } catch (error) {
      next(error);
    }
  },

 
  clearCart: async (req, res, next) => {
    try {
      const userId = req.user._id;

      const { cart, total } = await cartService.clearCart(userId);

      const response = {
        cart: {
          ...cart.toObject(),
          total,
          itemCount: 0
        }
      };

      successResponse(res, response, 'Panier vidé avec succès');
    } catch (error) {
      next(error);
    }
  },

  
  createOrderFromCart: async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { shippingAddress, paymentMethod, notes } = req.body;

      
      const items = await cartService.convertCartToOrderItems(userId);

      
      const orderData = {
        items,
        shippingAddress,
        paymentMethod,
        notes
      };

      const order = await orderServices.createOrder(userId, orderData);

      // Vider le panier après création de la commande
      await cartService.clearCart(userId);

      successResponse(res, order, 'Commande créée avec succès depuis le panier', 201);
    } catch (error) {
      next(error);
    }
  }
};

export default cartController;