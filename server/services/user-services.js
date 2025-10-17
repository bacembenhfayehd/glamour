import Comment from "../models/Comment.js";
import Product from "../models/Product.js";
import User from '../models/User.js'
import Order from '../models/Order.js'
class UserService {
  async addComment() {
    try {
      const { productId, content } = req.body;
      const userId = req.user._id;

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      
      const comment = await Comment.create({
        content,
        product: productId,
        user: userId,
      });

      if (product.comments !== undefined) product.comments.push(comment._id);
      await product.save();

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
      next();
    }
  }

async getUserProfile(userId) {
  try {
    let user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      throw { message: 'User not found', statusCode: 404 };
    }

    // UTILISEZ user.phone ET user.address DIRECTEMENT AU LIEU DE hasOwnProperty
    // La migration n'est probablement plus nécessaire puisque les champs existent
    if (user.phone === undefined || user.address === undefined) {
      user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            phone: user.phone || null,
            address: user.address || {
              line: null,
              city: null,
              municipality: null,
              postalCode: null
            }
          }
        },
        { new: true }
      ).select('-password -refreshToken');
    }

    const orderStats = await this.getOrderStats(userId);
    const recentOrders = await this.getRecentOrders(userId, 5);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // ✅
        address: user.address, // ✅
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stats: orderStats,
      recentOrders
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

  async getOrderStats(userId) {
    try {
      const stats = await Order.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            pendingOrders: {
              $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'processing', 'shipped']] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        deliveredOrders: 0,
        pendingOrders: 0
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(userId, limit = 5) {
    try {
      const orders = await Order.find({ user: userId })
        .select('orderNumber orderDate totalAmount status items deliveryType')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

      return orders.map(order => ({
        id: order._id,
        ref: order.orderNumber,
        date: order.orderDate,
        amount: order.totalAmount,
        status: order.status,
        itemsCount: order.items.length,
        deliveryType: order.deliveryType,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }));
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
  try {
    const allowedUpdates = ['name', 'phone', 'address'];
    const filteredData = {};
    
    // Filter allowed fields
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'address' && updateData[key]) {
          // Validate address object
          const addressFields = ['line', 'city', 'municipality', 'postalCode'];
          const filteredAddress = {};
          
          Object.keys(updateData[key]).forEach(addressKey => {
            if (addressFields.includes(addressKey)) {
              filteredAddress[addressKey] = updateData[key][addressKey];
            }
          });
          
          filteredData[key] = filteredAddress;
        } else {
          filteredData[key] = updateData[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw { message: 'User not found', statusCode: 404 };
    }

    return user;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      throw { message: errors.join(', '), statusCode: 400 };
    }
    throw error;
  }
}

   async updatePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw { message: 'All password fields are required', statusCode: 400 };
      }

      if (newPassword !== confirmPassword) {
        throw { message: 'New password and confirm password do not match', statusCode: 400 };
      }

      if (newPassword.length < 6) {
        throw { message: 'New password must be at least 6 characters long', statusCode: 400 };
      }

      // Get user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw { message: 'User not found', statusCode: 404 };
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw { message: 'Current password is incorrect', statusCode: 400 };
      }

      // Check if new password is different from current
      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        throw { message: 'New password must be different from current password', statusCode: 400 };
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }
}

const userService = new UserService();

export default userService;
