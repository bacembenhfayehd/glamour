import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  mainCategory: {
    type: String,
    required: [true, 'Catrgory is required'],
    enum: ['Homme', 'Femme', 'Enfant']
  },

  subCategory: {
    type: String,
    required: [true, 'Sub category is required'],
    enum: [
     
      'Sport', 'Casual', 'Chic', 'Outdoor',
      
      'Streetwear', 'Mode', 'Minimaliste',
      
      'Garçon', 'Fille'
    ]
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    url: String,
    publicId: String, 
    alt: String
  }],

}, {
  timestamps: true
});

productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = new mongoose.model('Product',productSchema);

export default Product;