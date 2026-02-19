import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, { user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, company, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return successResponse(res, { user: user.toSafeJSON() }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

// Admin: GET /api/users - List all users
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(),
    ]);

    return successResponse(res, {
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export { getProfile, updateProfile, getAllUsers };
