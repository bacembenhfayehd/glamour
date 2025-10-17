import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import helpers from '../utils/helpers.js';

const { AppError } = helpers;

class CartService {
  // Récupérer ou créer le panier d'un utilisateur
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price category brand stock images');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    // Vérifier la disponibilité des produits et filtrer ceux qui ne sont plus disponibles
    const availableItems = cart.items.filter(item => {
      return item.product && item.product.stock >= item.quantity;
    });

    if (availableItems.length !== cart.items.length) {
      cart.items = availableItems;
      await cart.save();
    }

    return cart;
  }

  // Calculer le total du panier
  async calculateCartTotal(cart) {
    if (!cart.items || cart.items.length === 0) {
      return 0;
    }

    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  // Ajouter un produit au panier
  async addToCart(userId, productId, quantity = 1) {
    // Vérifier que le produit existe et est en stock
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Produit introuvable', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Stock insuffisant. Stock disponible: ${product.stock}`, 400);
    }

    // Trouver ou créer le panier
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        throw new AppError(`Quantité totale dépasse le stock disponible (${product.stock})`, 400);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Populer et calculer le total
    await cart.populate('items.product', 'name price category brand stock images');
    const total = await this.calculateCartTotal(cart);

    return { cart, total };
  }

  // Mettre à jour la quantité d'un produit dans le panier
  async updateCartItemQuantity(userId, productId, quantity) {
    try {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Panier introuvable', 404);
    }

    // Vérifier le stock du produit
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new AppError('Produit introuvable', 404);
    }

    if (quantity > product.stock) {
      throw new AppError(`Quantité dépasse le stock disponible (${product.stock})`, 400);
    }

    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new AppError('Produit introuvable dans le panier', 404);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate('items.product', 'name price category brand stock images');
    const total = await this.calculateCartTotal(cart);

    return { cart, total };
  }catch(error){
    throw error

  }
  }


  //diminuer la qte de produit du panier 
  async decreaseItemQuantity(userId, productId) {
  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new AppError('Panier introuvable', 404);
  }

  // Trouver l'item dans le panier
  const existingItemIndex = cart.items.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItemIndex === -1) {
    throw new AppError('Produit introuvable dans le panier', 404);
  }

  const existingItem = cart.items[existingItemIndex];

  // Si la quantité est 1, supprimer complètement l'item
  if (existingItem.quantity <= 1) {
    cart.items.splice(existingItemIndex, 1);
  } else {
    // Sinon, diminuer la quantité de 1
    cart.items[existingItemIndex].quantity -= 1;
  }

  cart.updatedAt = new Date();
  await cart.save();

  await cart.populate('items.product', 'name price category brand stock images');
  const total = await this.calculateCartTotal(cart);

  return { cart, total };
}

  // Supprimer un produit du panier
  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Panier introuvable', 404);
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId.toString()
    );

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate('items.product', 'name price category brand stock images');
    const total = await this.calculateCartTotal(cart);

    return { cart, total };
  }

  // Vider le panier
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new AppError('Panier introuvable', 404);
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    return { cart, total: 0 };
  }

  // Valider le panier avant de passer commande
  async validateCartForOrder(userId) {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price stock');

    if (!cart || cart.items.length === 0) {
      throw new AppError('Le panier est vide', 400);
    }

    const unavailableItems = [];
    
    for (const item of cart.items) {
      if (!item.product) {
        unavailableItems.push(`Produit supprimé`);
      } else if (item.product.stock < item.quantity) {
        unavailableItems.push(`${item.product.name}: stock insuffisant (${item.product.stock} disponible)`);
      }
    }

    if (unavailableItems.length > 0) {
      throw new AppError(`Articles non disponibles: ${unavailableItems.join(', ')}`, 400);
    }

    return cart;
  }

  // Convertir le panier en format commande
  async convertCartToOrderItems(userId) {
    const cart = await this.validateCartForOrder(userId);
    
    return cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));
  }
}

export default new CartService();