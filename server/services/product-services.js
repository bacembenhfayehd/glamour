import Product from "../models/Product.js";
import { deleteImage } from "../utils/cloudinary.js";


import helpers from '../utils/helpers.js';

const { AppError } = helpers;


class ProductService {
  
  async createProduct(productData, imageFiles = []) {
    try {
     
      // Check if product with same name exists
      const existingProduct = await Product.findOne({ 
        name: new RegExp(`^${productData.name.trim()}$`, 'i') 
      });
      
      if (existingProduct) {
        throw new Error('Un produit avec ce nom existe déjà');
      }

      // Process images
      const images = imageFiles.map(file => ({
        url: file.path,
        publicId: file.filename,
        alt: `${productData.name} - Image`
      }));

      const product = new Product({
        ...productData,
        images
      });

      const savedProduct = await product.save();
      return savedProduct;

    } catch (error) {
      // If product creation fails, cleanup uploaded images
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            await deleteImage(file.filename);
          } catch (cleanupError) {
            console.error('Error cleaning up image:', cleanupError);
          }
        }
      }
      throw error;
    }
  }

  async updateProduct(productId, updateData, newImageFiles = []) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Produit non trouvé',404);
      }

      // Check for name conflicts (excluding current product)
      if (updateData.name) {
        const existingProduct = await Product.findOne({ 
          name: new RegExp(`^${updateData.name.trim()}$`, 'i'),
          _id: { $ne: productId }
        });
        
        if (existingProduct) {
          throw new AppError('Un produit avec ce nom existe déjà',400);
        }
      }

      

      // Handle new images
      if (newImageFiles && newImageFiles.length > 0) {
        const newImages = newImageFiles.map(file => ({
          url: file.path,
          publicId: file.filename,
          alt: `${updateData.name || product.name} - Image`
        }));

        // Add new images to existing ones
        updateData.images = [...(product.images || []), ...newImages];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      );

      return updatedProduct;

    } catch (error) {
      // Cleanup newly uploaded images on error
      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          try {
            await deleteImage(file.filename);
          } catch (cleanupError) {
            console.error('Error cleaning up image:', cleanupError);
          }
        }
      }
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Produit non trouvé',404);
      }

      // Delete associated images from cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (image.publicId) {
            try {
              await deleteImage(image.publicId);
            } catch (imageError) {
              console.error('Error deleting image:', imageError);
            }
          }
        }
      }

      await Product.findByIdAndDelete(productId);
      return { deletedProductId: productId };

    } catch (error) {
      throw error;
    }
  }

  async deleteProductImage(productId, imageIndex) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Produit non trouvé',404);
      }

      if (!product.images || product.images.length <= imageIndex) {
        throw new AppError('Image non trouvée',404);
      }

      const imageToDelete = product.images[imageIndex];
      
      // Delete from cloudinary
      if (imageToDelete.publicId) {
        await deleteImage(imageToDelete.publicId);
      }

      // Remove from database
      product.images.splice(imageIndex, 1);
      await product.save();

      return product;

    } catch (error) {
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Produit non trouvé',404);
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async getAllProducts(filters = {}) {
    try {
      const {
        page = 2,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const query = {};

      // Apply filters
      if (category) query.category = category;


      

      // Search functionality
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
        
        ];
      }

      // Sorting
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .sort(sortOptions)

        .exec();

      const total = await Product.countDocuments(query);

      return {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total),
          total,
          hasNext: page < Math.ceil(total),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      throw error;
    }
  }

  async getProductStats() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            averagePrice: { $avg: '$price' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ]);

      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            averagePrice: { $avg: '$price' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const lowStockProducts = await Product.find({
        stock: { $lte: 10 },
        isActive: true
      }).select('name stock category brand').sort({ stock: 1 });

      return {
        general: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          totalStock: 0,
          averagePrice: 0,
          totalValue: 0
        },
        categories: categoryStats,
        lowStock: lowStockProducts
      };

    } catch (error) {
      throw error;
    }
  }

  async bulkUpdateStock(updates) {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.productId },
          update: { $set: { stock: update.newStock } }
        }
      }));

      const result = await Product.bulkWrite(bulkOps);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const productService = new ProductService;
export default productService;

