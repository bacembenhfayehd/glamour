import Order from '../models/Order.js';
import Product from '../models/Product.js';
import helpers from '../utils/helpers.js';
import Cart from '../models/Cart.js'
import User from '../models/User.js'
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

const { AppError } = helpers;

class OrderService {
  // Créer une nouvelle commande
  async createOrder(userId, orderData) {
  const { items, shippingAddress, paymentMethod, notes, deliveryType, phone } = orderData;
  
  if (!phone || phone.toString().trim().length === 0) {
    throw new AppError('Le numéro de téléphone est requis', 400);
  }

  // Validation des données en fonction du type de livraison
  if (deliveryType === 'delivery') {
    if (!shippingAddress) {
      throw new AppError('Shipping address is required for delivery orders', 400);
    }
    if (!paymentMethod) {
      throw new AppError('Payment method is required for delivery orders', 400);
    }
  } else if (deliveryType === 'pickup' || deliveryType === 'in_store') {
    // Pour le retrait, on nettoie les données non nécessaires
    if (paymentMethod) {
      throw new AppError('Payment method should not be provided for pickup orders', 400);
    }
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Au moins un article est requis', 400);
  }

  // Vérifier la disponibilité des produits et calculer les prix
  const orderItems = [];
  let totalAmount = 0; // ✅ Variable pour le total des items

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new AppError(`Produit avec l'ID ${item.product} introuvable`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}`, 400);
    }

    const subtotal = product.price * item.quantity;
    
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal
    });

    totalAmount += subtotal; // ✅ Accumulation du total
  }

  // Calculer les coûts
  const shippingCost = deliveryType === 'pickup' || deliveryType === 'in_store' ? 0 : 7.000;
  const taxRate = 0.02; // 2%
  const taxAmount = Math.floor(totalAmount * taxRate); // ✅ Utiliser totalAmount
  const finalTotal = totalAmount + shippingCost + taxAmount; // ✅ Utiliser totalAmount

  // Préparer les données de la commande
  const orderDataToSave = {
    user: userId,
    items: orderItems,
    deliveryType,
    notes: notes || '',
    shippingCost,
    phone: phone.toString().trim(),
    totalAmount: finalTotal
  };

  // Ajouter les champs conditionnels
  if (deliveryType === 'delivery') {
    orderDataToSave.shippingAddress = {
      street: shippingAddress.street?.trim(),
      city: shippingAddress.city?.trim(),
      postalCode: shippingAddress.postalCode?.trim()
    };
    orderDataToSave.paymentMethod = paymentMethod;
  }

  // Créer la commande
  const order = new Order(orderDataToSave);
  await order.save();

  // Décrémenter le stock des produits
  await this._updateProductStock(items, 'decrement');
  await this._clearUserCart(userId);

  const populatedOrder = await this._populateOrder(order);

  // AJOUTER ce bloc après la population de l'ordre :
  try {
    // Récupérer les informations utilisateur pour l'email
    const user = await User.findById(userId).select('name email');
    
    if (user && user.email) {
      // Envoyer l'email de confirmation de manière asynchrone
      const emailResult = await sendOrderConfirmationEmail(populatedOrder, user);
      
      if (emailResult.success) {
        console.log(`Email de confirmation envoyé à ${user.email} pour la commande ${populatedOrder.orderNumber}`);
      } else {
        console.warn(`Échec d'envoi email pour la commande ${populatedOrder.orderNumber}:`, emailResult.error);
      }
    }
  } catch (emailError) {
    // On log l'erreur mais on ne fait pas échouer la création de commande
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
  }

  return populatedOrder;
}


  // Récupérer les commandes d'un utilisateur
  async getUserOrders(userId, queryParams) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

    const query = { user: userId };
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name category brand images')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    };
  }

  // Récupérer une commande par ID
  async getOrderById(orderId, userId = null) {
    const query = { _id: orderId };
    if (userId) query.user = userId;

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('items.product', 'name category brand images');

    if (!order) {
      throw new AppError('Commande introuvable', 404);
    }

    return order;
  }

  // Annuler une commande
  async cancelOrder(orderId, userId, cancelReason) {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      throw new AppError('Commande introuvable', 404);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError('Cette commande ne peut plus être annulée', 400);
    }

    // Restaurer le stock des produits
    await this._restoreProductStock(order.items);

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason;

    await order.save();
    return order;
  }

  // Admin: Récupérer toutes les commandes
  async getAllOrders(queryParams) {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

    const query = {};
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name category brand')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    };
  }

  // Admin: Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId, status, cancelReason = null) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Commande introuvable', 404);
    }

    // Si on annule une commande, restaurer le stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await this._restoreProductStock(order.items);
      if (cancelReason) {
        order.cancelReason = cancelReason;
      }
    }

    await order.updateStatus(status);
    return await this._populateOrder(order);
  }

  // Obtenir les statistiques des commandes
  async getOrderStats() {
    const [statusStats, totalOrders, revenueResult] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    return {
      statusStats,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0
    };
  }

  // Méthodes privées
  async _updateProductStock(items, operation = 'decrement') {
    const operations = items.map(item => {
      const increment = operation === 'decrement' ? -item.quantity : item.quantity;
      return Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: increment } },
        { new: true }
      );
    });

    await Promise.all(operations);
  }

  async _clearUserCart(userId) {
  try {
    // Supposons que vous avez un modèle Cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { 
        items: [],
        total: 0,
        itemCount: 0
      }
    );
    console.log(`Panier vidé pour l'utilisateur: ${userId}`);
  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error);
    // Ne pas faire échouer la commande si le vidage du panier échoue
  }
}

  async _restoreProductStock(orderItems) {
    const operations = orderItems.map(item => 
      Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      )
    );

    await Promise.all(operations);
  }

  async _populateOrder(order) {
    return await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name category brand images' }
    ]);
  }
}

export default new OrderService();