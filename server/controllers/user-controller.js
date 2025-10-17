import Comment from "../models/Comment.js";
import Product from "../models/Product.js";
import userService from "../services/user-services.js";

import helpers from "../utils/helpers.js";

const { successResponse, errorResponse, AppError } = helpers;

class UserController {
  addComment = async (req, res, next) => {
    try {
      const { productId, content } = req.body;
      const userId = req.user._id;

      // Check if product exists
      const product = await this.getProduct(productId);

      // Create the comment
      const comment = await Comment.create({
        content,
        product: productId,
        user: userId,
      });

      // Add comment reference to product
      if (product.comments !== undefined) {
        product.comments.push(comment._id);
      }
      await product.save();

      // Return success response
      return successResponse(res, comment, "Comment added successfully", 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  };

  getProduct = async (productId) => {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError("Produit non trouvé", 404);
      }
      return product;
    } catch (error) {
      throw error;
    }
  };


   async getProfile(req, res) {
    try {
      const userId = req.user._id; 
      const profileData = await userService.getUserProfile(userId);

      return successResponse(res, 'Profile retrieved successfully', profileData);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to retrieve profile', statusCode);
    }
  }

 async updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const updatedUser = await userService.updateUserProfile(userId, updateData);
    
    // Après la mise à jour, récupérer le profil complet pour avoir la même structure
    const fullProfileData = await userService.getUserProfile(userId);

    return successResponse(res, 'Profile updated successfully', {
      user: updatedUser,
      stats: fullProfileData.stats,
      recentOrders: fullProfileData.recentOrders
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to update profile', statusCode);
  }
}

  async updatePassword(req, res) {
    try {
      const userId = req.user._id;
      const passwordData = req.body;

      const result = await userService.updatePassword(userId, passwordData);

      return successResponse(res, result.message, {});
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update password', statusCode);
    }
  }

  // You can add other user-related methods here
  // async getUserProfile(req, res, next) { ... }
  // async updateUserProfile(req, res, next) { ... }
  // etc.
}

const userController = new UserController();
export default userController;
