// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  /*rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false // Optional if you want to include ratings
  },*/
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = new mongoose.model('Comment',commentSchema);
export default Comment;