import authService from '../services/auth-services.js';
import helpers from '../utils/helpers.js'
const {successResponse,errorResponse} = helpers



// Register new user
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    successResponse(res, {
      user: result.user,
      accessToken: result.accessToken
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    successResponse(res, {
      user: result.user,
      accessToken: result.accessToken
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // Supprimer le refreshToken de la base de données
    await authService.logout(userId);
    
    // Supprimer le cookie refreshToken
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token not provided', 401);
    }

    const result = await authService.refreshAccessToken(refreshToken);
    successResponse(res, result, 'Access token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    successResponse(res, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export {refreshToken,register,getProfile,login,logout}