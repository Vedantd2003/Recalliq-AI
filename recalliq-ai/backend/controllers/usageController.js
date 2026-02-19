import Usage from '../models/Usage.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import mongoose from 'mongoose';

// GET /api/usage - Get user usage history
const getUsage = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, days = 30 } = req.query;
    const userId = req.user.id;

    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [usage, total, summary] = await Promise.all([
      Usage.find({ user: userId, createdAt: { $gte: since } })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('meeting', 'title')
        .lean(),
      Usage.countDocuments({ user: userId, createdAt: { $gte: since } }),
      Usage.getUserSummary(mongoose.Types.ObjectId.createFromHexString(userId), parseInt(days)),
    ]);

    const totalCreditsUsed = summary.reduce((acc, s) => acc + s.totalCredits, 0);

    return successResponse(res, {
      usage,
      summary,
      totalCreditsUsed,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/usage/credits - Get credit balance
const getCredits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('credits plan');
    return successResponse(res, {
      credits: user.credits,
      plan: user.plan,
    });
  } catch (err) {
    next(err);
  }
};

export { getUsage, getCredits };
