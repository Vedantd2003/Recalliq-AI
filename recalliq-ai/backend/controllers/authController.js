import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

// --- REGISTER ---
export const register = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    const user = new User({ name, email, password, company });
    await user.save();

    const { accessToken, refreshToken } = generateTokenPair(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`New user registered: ${email}`);

    return successResponse(res, {
      user: user.toSafeJSON(),
      accessToken,
    }, 'Account created successfully!', 201);
  } catch (err) {
    next(err);
  }
};

// --- LOGIN ---
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, {
      user: user.toSafeJSON(),
      accessToken,
    }, 'Logged in successfully!');
  } catch (err) {
    next(err);
  }
};

// --- LOGOUT ---
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// --- GET ME ---
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user: user.toSafeJSON() }, 'User data retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// --- REFRESH TOKEN ---
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return errorResponse(res, 'Refresh token required', 401);

    const decoded = verifyRefreshToken(token);
    if (!decoded) return errorResponse(res, 'Invalid refresh token', 403);

    const user = await User.findById(decoded.id || decoded.user?.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return errorResponse(res, 'Invalid refresh token', 403);
    }

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set New Refresh Token Cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};