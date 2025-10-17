import AppError from '../utils/helpers.js'

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

 
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

    // Multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'Erreur de téléchargement de fichier';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Fichier trop volumineux (max 5MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Trop de fichiers (max 5 images)';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Champ de fichier inattendu';
    }
    
    error = new AppError(message, 400);
  }

  // File type validation error
  if (err.message && err.message.includes('Only image files are allowed')) {
    error = new AppError('Seuls les fichiers image sont autorisés', 400);
  }

  // Cloudinary errors
  if (err.message && err.message.includes('cloudinary')) {
    error = new AppError('Erreur de téléchargement d\'image', 500);
  }


  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler