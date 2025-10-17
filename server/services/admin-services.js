import Comment from "../models/Comment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import helpers from "../utils/helpers.js";

const {AppError,errorResponse,successResponse} = helpers

class AdminSerice {
async getProductComments(productId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt' } = options;
      const skip = (page - 1) * limit;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Get comments with user population
      const comments = await Comment.find({ product: productId })
        .populate({
          path: 'user',
          select: 'name email createdAt' // Only include necessary user fields
        })
        .populate({
          path: 'product',
          select: 'name' // Include product name for reference
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(); // Convert to plain JavaScript objects for better performance

      // Get total count for pagination
      const totalComments = await Comment.countDocuments({ product: productId });

      return {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasNextPage: page < Math.ceil(totalComments / limit),
          hasPrevPage: page > 1
        },
        product: {
          _id: product._id,
          name: product.name
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all comments for admin dashboard
  async getAllComments(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sort = '-createdAt',
        search = '',
        productId = null,
        userId = null,
        startDate = null,
        endDate = null
      } = options;
      
      const skip = (page - 1) * limit;

      // Build filter query
      const filter = {};
      
      if (productId) filter.product = productId;
      if (userId) filter.user = userId;
      
      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Text search in comment content
      if (search) {
        filter.content = { $regex: search, $options: 'i' };
      }

      // Get comments with full population for admin view
      const comments = await Comment.find(filter)
        .populate({
          path: 'user',
          select: 'name email createdAt isActive'
        })
        .populate({
          path: 'product',
          select: 'name price category'
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const totalComments = await Comment.countDocuments(filter);

      // Get summary statistics
      const stats = await this.getCommentStats();

      return {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasNextPage: page < Math.ceil(totalComments / limit),
          hasPrevPage: page > 1
        },
        stats,
        filters: {
          search,
          productId,
          userId,
          startDate,
          endDate
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get comment statistics for admin dashboard
  async getCommentStats() {
    try {
      const totalComments = await Comment.countDocuments();
      const commentsThisMonth = await Comment.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        }
      });
      
      const commentsToday = await Comment.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      });

      // Most active products by comments
      const topProductsByComments = await Comment.aggregate([
        {
          $group: {
            _id: '$product',
            commentCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            productName: '$product.name',
            commentCount: 1
          }
        },
        {
          $sort: { commentCount: -1 }
        },
        {
          $limit: 5
        }
      ]);

      return {
        totalComments,
        commentsThisMonth,
        commentsToday,
        topProductsByComments
      };
    } catch (error) {
      throw error;
    }
  }

  // Get a single comment with full details
  async getCommentById(commentId) {
    try {
      const comment = await Comment.findById(commentId)
        .populate({
          path: 'user',
          select: 'name email createdAt isActive'
        })
        .populate({
          path: 'product',
          select: 'name price category images'
        });

      if (!comment) {
        throw new AppError('Comment not found', 404);
      }

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Delete a comment (admin only)
  async deleteComment(commentId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new AppError('Comment not found', 404);
      }

      // Remove comment reference from product
      await Product.findByIdAndUpdate(
        comment.product,
        { $pull: { comments: commentId } }
      );

      // Delete the comment
      await Comment.findByIdAndDelete(commentId);

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all users with comprehensive analytics
  async getAllUsersWithAnalytics({ page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' }) {
    // Build search filter
    const searchFilter = this.buildSearchFilter(search);

    // Get current date for monthly calculations
    const startOfMonth = this.getStartOfCurrentMonth();

    // Get users with analytics using aggregation
    const usersWithAnalytics = await this.getUsersAggregation(searchFilter, startOfMonth, sortBy, sortOrder, page, limit);

    // Get pagination and statistics data
    const [totalUsers, deletedUsersCount, newUsersThisMonth, totalCount, globalStats] = await Promise.all([
      User.countDocuments(searchFilter),
      User.countDocuments({ ...searchFilter, isActive: false }),
      User.countDocuments({
        ...searchFilter,
        createdAt: { $gte: startOfMonth }
      }),
      User.countDocuments(),
      this.getGlobalStatistics(startOfMonth)
    ]);

    // Calculate pagination info
    const pagination = this.calculatePagination(totalUsers, page, limit);

    // Format user data
    const formattedUsers = this.formatUsersData(usersWithAnalytics);

    return {
      users: formattedUsers,
      pagination: {
        ...pagination,
        totalUsers
      },
      statistics: globalStats,
      filters: {
        search,
        sortBy,
        sortOrder
      }
    };
  }

  // Get specific user details with full order history
  async getUserDetailsById(userId) {
    const userWithOrders = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orders.items.product',
          foreignField: '_id',
          as: 'orderProducts'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' },
          lastOrderDate: { $max: '$orders.orderDate' },
          firstOrderDate: { $min: '$orders.orderDate' },
          
          // Order status breakdown
          pendingOrders: this.getOrdersByStatus('$orders', 'pending'),
          completedOrders: this.getOrdersByStatus('$orders', 'delivered'),
          cancelledOrders: this.getOrdersByStatus('$orders', 'cancelled')
        }
      }
    ]);

    if (!userWithOrders.length) {
      throw new Error('Utilisateur introuvable');
    }

    const user = userWithOrders[0];

    // Sort orders by date (most recent first)
    user.orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        joinDate: user.createdAt,
        lastUpdate: user.updatedAt,
        analytics: {
          totalOrders: user.totalOrders,
          totalSpent: parseFloat((user.totalSpent || 0).toFixed(2)),
          lastOrderDate: user.lastOrderDate,
          firstOrderDate: user.firstOrderDate,
          averageOrderValue: user.totalOrders > 0 
            ? parseFloat(((user.totalSpent || 0) / user.totalOrders).toFixed(2))
            : 0,
          orderStatusBreakdown: {
            pending: user.pendingOrders,
            completed: user.completedOrders,
            cancelled: user.cancelledOrders,
            processing: user.orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length
          }
        }
      },
      orders: user.orders
    };
  }

  // Get comprehensive user analytics
  async getUsersAnalytics() {
    const currentDate = new Date();
    const startOfMonth = this.getStartOfCurrentMonth();
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get comprehensive analytics
    const [
      totalUsers,
      activeUsers,
      deletedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      usersWithOrdersResult,
      topCustomers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      this.getUsersWithOrders(),
      this.getTopCustomers()
    ]);

    const usersWithOrders = usersWithOrdersResult[0]?.usersWithOrders || 0;
    const usersWithoutOrders = totalUsers - usersWithOrders;
    
    // Calculate growth rate
    const growthRate = this.calculateGrowthRate(newUsersThisMonth, newUsersLastMonth);

    return {
      overview: {
        totalUsers,
        activeUsers,
        deletedUsers,
        usersWithOrders,
        usersWithoutOrders
      },
      growth: {
        newUsersThisMonth,
        newUsersLastMonth,
        growthRate: `${growthRate}%`,
        trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
      },
      engagement: {
        customerConversionRate: totalUsers > 0 
          ? `${((usersWithOrders / totalUsers) * 100).toFixed(1)}%`
          : '0%',
        averageOrdersPerCustomer: usersWithOrders > 0 
          ? parseFloat((await Order.countDocuments() / usersWithOrders).toFixed(1))
          : 0
      },
      topCustomers: topCustomers.map(customer => ({
        ...customer,
        totalSpent: parseFloat(customer.totalSpent.toFixed(2))
      }))
    };
  }

  // Export users to CSV format
  async exportUsersToCSV() {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' },
          lastOrderDate: { $max: '$orders.orderDate' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          city: '$address.city',
          municipality: '$address.municipality',
          postalCode: '$address.postalCode',
          isActive: 1,
          joinDate: '$createdAt',
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1
        }
      },
      {
        $sort: { joinDate: -1 }
      }
    ]);

    return this.formatUsersCSV(users);
  }

  // Toggle user active status
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    };
  }

  // Soft delete user
  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Check if user has pending orders
    const pendingOrders = await Order.countDocuments({
      user: userId,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });

    if (pendingOrders > 0) {
      throw new Error(`Impossible de supprimer l'utilisateur. Il a ${pendingOrders} commande(s) en cours.`);
    }

    user.isActive = false;
    await user.save();

    return {
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  }

  // Helper methods

  buildSearchFilter(search) {
    return search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    } : {};
  }

  getStartOfCurrentMonth() {
    const currentDate = new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }

  async getUsersAggregation(searchFilter, startOfMonth, sortBy, sortOrder, page, limit) {
    return await User.aggregate([
      { $match: { ...searchFilter } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' },
          lastOrderDate: { $max: '$orders.orderDate' },
          ordersThisMonth: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $gte: ['$this.orderDate', startOfMonth] }
              }
            }
          }
        }
      },
      {
        $project: {
    id: { $toString: '$_id' }, // ⚡ conversion Mongo ObjectId → string
    name: 1,
    email: 1,
    phone: { $ifNull: ['$phone', 'Non fourni'] },
    city: { $ifNull: ['$address.city', 'Non fournie'] },
    municipality: { $ifNull: ['$address.municipality', 'Non fournie'] },
    postalCode: { $ifNull: ['$address.postalCode', 'Non fourni'] },
    isActive: 1,
    joinDate: '$createdAt',
    lastUpdate: '$updatedAt',
    totalOrders: 1,
    totalSpent: 1,
    lastOrderDate: 1,
    ordersThisMonth: 1,
    averageOrderValue: {
      $cond: {
        if: { $gt: ['$totalOrders', 0] },
        then: { $divide: ['$totalSpent', '$totalOrders'] },
        else: 0
      }
    }
  }
      },
      {
        $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]);
  }

  async getGlobalStatistics(startOfMonth) {
    const [totalOrdersCount, totalRevenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    return {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      deletedUsers: await User.countDocuments({ isActive: false }),
      newUsersThisMonth: await User.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
      totalOrdersCount,
      totalRevenue: totalRevenueResult[0]?.total || 0
    };
  }

  calculatePagination(totalUsers, page, limit) {
    const totalPages = Math.ceil(totalUsers / limit);
    const currentPage = page;
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
      currentPage,
      totalPages,
      hasNext,
      hasPrev,
      limit
    };
  }

  formatUsersData(usersWithAnalytics) {
    return usersWithAnalytics.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'Non fourni',
      city: user.address?.city || 'Non fournie',
      municipality: user.address?.municipality || 'Non fournie',
      postalCode: user.address?.postalCode || 'Non fourni',
      isActive: user.isActive,
      joinDate: user.createdAt,
      lastUpdate: user.updatedAt,
      analytics: {
        totalOrders: user.totalOrders,
        totalSpent: parseFloat((user.totalSpent || 0).toFixed(2)),
        lastOrderDate: user.lastOrderDate,
        ordersThisMonth: user.ordersThisMonth,
        averageOrderValue: user.totalOrders > 0 
          ? parseFloat(((user.totalSpent || 0) / user.totalOrders).toFixed(2))
          : 0
      }
    }));
  }

  getOrdersByStatus(ordersField, status) {
    return {
      $size: {
        $filter: {
          input: ordersField,
          cond: { $eq: ['$this.status', status] }
        }
      }
    };
  }

  async getUsersWithOrders() {
    return await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $match: {
          'orders.0': { $exists: true }
        }
      },
      {
        $count: 'usersWithOrders'
      }
    ]);
  }

  async getTopCustomers() {
    return await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: '$orders.totalAmount' },
          totalOrders: { $size: '$orders' }
        }
      },
      {
        $match: { totalOrders: { $gt: 0 } }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalSpent: 1,
          totalOrders: 1
        }
      }
    ]);
  }

  calculateGrowthRate(newUsersThisMonth, newUsersLastMonth) {
    return newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : newUsersThisMonth > 0 ? 100 : 0;
  }

  formatUsersCSV(users) {
    const csvHeader = 'ID,Nom,Email,Téléphone,Ville,Municipalité,Code Postal,Actif,Date Inscription,Commandes Totales,Montant Total,Dernière Commande\n';
    
    const csvData = users.map(user => [
      user._id,
      `"${user.name}"`,
      user.email,
      user.phone || '',
      `"${user.city || ''}"`,
      `"${user.municipality || ''}"`,
      user.postalCode || '',
      user.isActive ? 'Oui' : 'Non',
      new Date(user.joinDate).toLocaleDateString('fr-FR'),
      user.totalOrders,
      user.totalSpent.toFixed(2),
      user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString('fr-FR') : 'Aucune'
    ].join(',')).join('\n');

    return csvHeader + csvData;
  }

  // Get user's order statistics
  async getUserOrderStats(userId) {
    const orders = await Order.find({ user: userId });
    
    if (!orders.length) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        ordersThisMonth: 0,
        averageOrderValue: 0
      };
    }

    const startOfMonth = this.getStartOfCurrentMonth();
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const ordersThisMonth = orders.filter(order => 
      new Date(order.orderDate) >= startOfMonth
    ).length;

    return {
      totalOrders: orders.length,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      lastOrderDate: Math.max(...orders.map(order => new Date(order.orderDate))),
      ordersThisMonth,
      averageOrderValue: parseFloat((totalSpent / orders.length).toFixed(2))
    };
  }

  // Validate user exists and is active
  async validateUserExists(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }
    return user;
  }

  // Check if user has pending orders
  async hasPendingOrders(userId) {
    const pendingOrdersCount = await Order.countDocuments({
      user: userId,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });
    return pendingOrdersCount;
  }

  // Get user's monthly activity
  async getUserMonthlyActivity(userId) {
    const startOfMonth = this.getStartOfCurrentMonth();
    
    const monthlyOrders = await Order.find({
      user: userId,
      orderDate: { $gte: startOfMonth }
    });

    return {
      ordersCount: monthlyOrders.length,
      totalSpent: monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: monthlyOrders.length > 0 
        ? monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0) / monthlyOrders.length
        : 0
    };
  }

  // Get user's favorite products
  async getUserFavoriteProducts(userId, limit = 5) {
    const favoriteProducts = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $project: {
          productName: '$productDetails.name',
          category: '$productDetails.category',
          totalQuantity: 1,
          totalSpent: 1,
          orderCount: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return favoriteProducts;
  }

  // Search users by multiple criteria
  async searchUsers(searchTerm, filters = {}) {
    const searchFilter = this.buildSearchFilter(searchTerm);
    const additionalFilters = this.buildAdditionalFilters(filters);

    return await User.find({
      ...searchFilter,
      ...additionalFilters
    }).select('-password -refreshToken').lean();
  }

  buildAdditionalFilters(filters) {
    const additionalFilters = {};
    
    if (filters.isActive !== undefined) {
      additionalFilters.isActive = filters.isActive;
    }
    
    if (filters.city) {
      additionalFilters['address.city'] = { $regex: filters.city, $options: 'i' };
    }
    
    if (filters.joinDateFrom && filters.joinDateTo) {
      additionalFilters.createdAt = {
        $gte: new Date(filters.joinDateFrom),
        $lte: new Date(filters.joinDateTo)
      };
    }

    return additionalFilters;
  }


 updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Find the order first
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status provided');
    }

    // Use the schema method to update status (this will handle the timestamp updates)
    await order.updateStatus(newStatus);

    return order;
  } catch (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};
}



const adminService = new AdminSerice
export default adminService;