import adminService from "../services/admin-services.js";
import helpers from "../utils/helpers.js";

const {successResponse,errorResponse,AppError} = helpers


class AdminController {
  
  getProductComments = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { page, limit, sort } = req.query;

      const result = await adminService.getProductComments(productId, {
        page,
        limit,
        sort
      });

      return successResponse(res, result, "Comments retrieved successfully");
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };

  // Get all comments for admin dashboard
  getAllComments = async (req, res, next) => {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        search: req.query.search,
        productId: req.query.productId,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await adminService.getAllComments(options);

      return successResponse(res, result, "Comments retrieved successfully");
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };

  // Get comment statistics for admin dashboard
  getCommentStats = async (req, res, next) => {
    try {
      const stats = await  adminService.getCommentStats();

      return successResponse(res, stats, "Comment statistics retrieved successfully");
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };

  // Get single comment details
  getCommentById = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const comment = await  adminService.getCommentById(commentId);

      return successResponse(res, comment, "Comment retrieved successfully");
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };

  // Delete comment (admin only)
  deleteComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await  adminService.deleteComment(commentId);

      return successResponse(res, result, "Comment deleted successfully");
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };


  // GET /api/admin/users - Retrieve users list with comprehensive analytics
 getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const result = await adminService.getAllUsersWithAnalytics({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      message: 'Liste des utilisateurs récupérée avec succès',
      data: result
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// GET /api/admin/users/:id - Get specific user details with full order history
 getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDetails = await adminService.getUserDetailsById(id);
    
    res.status(200).json({
      success: true,
      message: 'Détails utilisateur récupérés avec succès',
      data: userDetails
    });

  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// GET /api/admin/users/analytics - Get overall user analytics
 getUsersAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getUsersAnalytics();

    res.status(200).json({
      success: true,
      message: 'Analytiques utilisateurs récupérées avec succès',
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching users analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytiques utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// GET /api/admin/users/export - Export users data to CSV
 exportUsers = async (req, res) => {
  try {
    const csvData = await adminService.exportUsersToCSV();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="utilisateurs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send('\uFEFF' + csvData);

  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// PUT /api/admin/users/:id/status - Toggle user active status
 toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await adminService.toggleUserStatus(id);

    res.status(200).json({
      success: true,
      message: `Utilisateur ${result.user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: result
    });

  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }
};

// DELETE /api/admin/users/:id - Soft delete user (set isActive to false)
 deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await adminService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: result
    });

  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('commande(s) en cours')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  }


 }

 updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Update order status
    const updatedOrder = await adminService.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        confirmedAt: updatedOrder.confirmedAt,
        shippedAt: updatedOrder.shippedAt,
        deliveredAt: updatedOrder.deliveredAt,
        cancelledAt: updatedOrder.cancelledAt
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error.message.includes('Order not found')) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided. Valid statuses: pending, confirmed, processing, shipped, delivered, cancelled'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

}


const adminController = new AdminController();
export default adminController;