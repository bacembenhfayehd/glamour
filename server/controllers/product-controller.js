import productService from "../services/product-services.js";
import helpers from '../utils/helpers.js'
const {successResponse} = helpers

export const addProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const imageFiles = req.files || [];

    const product = await productService.createProduct(productData, imageFiles);
    
    successResponse(res, product, 'Produit ajouté avec succès', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const newImageFiles = req.files || [];

    const product = await productService.updateProduct(id, updateData, newImageFiles);
    
    successResponse(res, product, 'Produit mis à jour avec succès');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await productService.deleteProduct(id);
    
    successResponse(res, result, 'Produit supprimé avec succès');
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageIndex } = req.params;

    const product = await productService.deleteProductImage(id, parseInt(imageIndex));
    
    successResponse(res, product, 'Image supprimée avec succès');
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await productService.getProduct(id);
    
    successResponse(res, product, 'Produit récupéré avec succès');
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const filters = req.query;

    const result = await productService.getAllProducts(filters);
    
    successResponse(res, result, 'Produits récupérés avec succès');
  } catch (error) {
    next(error);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    
    successResponse(res, stats, 'Statistiques récupérées avec succès');
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStock = async (req, res, next) => {
  try {
    const { updates } = req.body;

    const result = await productService.bulkUpdateStock(updates);
    
    successResponse(res, result, 'Stock mis à jour en masse avec succès');
  } catch (error) {
    next(error);
  }
};
