import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import dotenv from 'dotenv'
import helpers from '../utils/helpers.js'
const {AppError} = helpers

dotenv.config();

class AuthService {
  // Generate JWT tokens
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('cet email déja utilisé par un autre utilisateur', 400);
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  // Login user
  async login(credentials) {
    const { email, password } = credentials;

    // Find user and include password field
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      throw new AppError('email ou mot de passe non valide', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('email ou mot de passe non valide', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  // Logout user
  async logout(userId) {
    // Remove refresh token from user
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  // Verify access token
  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 404);
      }

      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
      );

      return { accessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
const authService = new AuthService();
export default authService;