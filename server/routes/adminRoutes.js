import express from 'express';
import { upload } from '../utils/cloudinary.js';
import { validateBulkStockUpdate, validateMongoId, validateProductCreate, validateProductQuery, validateProductUpdate } from '../middleware/validaton.js';
import { addProduct, bulkUpdateStock, deleteProduct, deleteProductImage, getAllProducts, getProduct, getProductStats, updateProduct } from '../controllers/product-controller.js';
import orderController from '../controllers/order-controller.js';
import adminController from '../controllers/admin-controller.js';


const router = express.Router();

// Product CRUD routes
router.get('/users', adminController.getUsers);
router.post('/products', 
  upload.array('images', 5), // Max 5 images
  validateProductCreate,
  addProduct
);

router.get('/products', 
  validateProductQuery,
  getAllProducts
);

router.get('/products/stats', getProductStats);

router.get('/products/:id', 
  validateMongoId,
  getProduct
);

router.put('/products/:id', 
  validateMongoId,
  upload.array('images', 5),
  validateProductUpdate,
  updateProduct
);

router.delete('/products/:id', 
  validateMongoId,
  deleteProduct
);

router.delete('/products/:id/images/:imageIndex', 
  validateMongoId,
  deleteProductImage
);

router.patch('/products/bulk-stock', 
  validateBulkStockUpdate,
  bulkUpdateStock
);


router.get('/orders', orderController.getAllOrders);


router.get('/product/:productId', adminController.getProductComments);
router.get('/:commentId', adminController.getCommentById);


router.get('/', adminController.getAllComments);
router.get('/stats', adminController.getCommentStats);
router.delete('/comments/:commentId', adminController.deleteComment);


// GET /api/admin/users - Get paginated users list with analytics
// Query parameters:
// - page: page number (default: 1)
// - limit: items per page (default: 10)
// - search: search term for name, email, or phone
// - sortBy: field to sort by (default: 'createdAt')
// - sortOrder: 'asc' or 'desc' (default: 'desc')


// GET /api/admin/users/analytics - Get overall user analytics and statistics
router.get('/users/analytics', adminController.getUsersAnalytics);

// GET /api/admin/users/export - Export users data to CSV
router.get('/export/users', adminController.exportUsers);

// GET /api/admin/users/:id - Get specific user details with full order history
router.get('/:id', adminController.getUserDetails);

// PUT /api/admin/users/:id/status - Toggle user active/inactive status
router.put('/:id/status', adminController.toggleUserStatus);

// DELETE /api/admin/users/:id - Soft delete user (set isActive to false)
router.delete('/usersdelete/:id', adminController.deleteUser);

router.patch('/orders/:orderId/status', adminController.updateOrderStatusController);

export default router;