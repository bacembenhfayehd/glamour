import authService from "../services/auth-services.js";
import helpers from '../utils/helpers.js'
const {errorResponse} = helpers


// Authenticate user with JWT
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Access token is required', 401);
    }

    // Verify token and get user
    const user = await authService.verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Authentication failed', 401);
  }
};


export default authenticate;