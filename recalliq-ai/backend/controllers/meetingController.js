import Meeting from '../models/Meeting.js';
import ActionItem from '../models/ActionItem.js';
import Decision from '../models/Decision.js';
import Usage from '../models/Usage.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

export const analyzeMeeting = async (req, res, next) => {
  try {
    const { title, transcript, participants, meetingDate, duration, tags } = req.body;
    const userId = req.user.id;

    const creditsNeeded = aiService.calculateCredits(transcript.length);
    const user = await User.findById(userId);

    if (!user || user.credits < creditsNeeded) {
      return errorResponse(res, `Insufficient credits. Need ${creditsNeeded}.`, 402);
    }

    const meeting = new Meeting({
      user: userId,
      title,
      transcript,
      participants: participants || [],
      meetingDate: meetingDate || new Date(),
      duration,
      tags: tags || [],
      status: 'processing',
    });
    await meeting.save();
    await user.deductCredits(creditsNeeded);

    let analysisResult;
    try {
      analysisResult = await aiService.analyzeMeeting(transcript, title, participants);
    } catch (aiErr) {
      logger.error('AI analysis failed:', aiErr.message);
      meeting.status = 'failed';
      await meeting.save();
      user.credits += creditsNeeded;
      await user.save();
      return errorResponse(res, 'AI analysis failed. Credits refunded.', 503);
    }

    // ... (Your action items/decisions mapping logic stays the same, just ensure it uses ESM)

    meeting.status = 'completed';
    meeting.summary = analysisResult.summary;
    await meeting.save();

    return successResponse(res, { meeting }, 'Meeting analyzed!', 201);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Fix: Use the already imported mongoose
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [total, completed, recent] = await Promise.all([
      Meeting.countDocuments({ user: userId, isArchived: false }),
      Meeting.countDocuments({ user: userId, status: 'completed' }),
      Meeting.find({ user: userId, status: 'completed' }).sort('-createdAt').limit(5)
    ]);

    return successResponse(res, { total, completed, recent });
  } catch (err) {
    next(err);
  }
};

// --- GET MEETINGS ---
export const getMeetings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = { user: req.user.id, isArchived: false };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [meetings, total] = await Promise.all([
      Meeting.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('title meetingDate duration status tags transcriptWordCount')
        .lean(),
      Meeting.countDocuments(query),
    ]);

    return paginatedResponse(res, meetings, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// --- GET MEETING BY ID ---
export const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user.id })
      .populate('actionItems')
      .populate('decisions');

    if (!meeting) {
      return errorResponse(res, 'Meeting not found', 404);
    }

    return successResponse(res, { meeting });
  } catch (err) {
    next(err);
  }
};

// --- DELETE MEETING ---
export const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user.id });
    if (!meeting) return errorResponse(res, 'Meeting not found', 404);

    // Soft delete
    meeting.isArchived = true;
    await meeting.save();

    return successResponse(res, null, 'Meeting deleted successfully');
  } catch (err) {
    next(err);
  }
};

// --- UPDATE ACTION ITEM ---
export const updateActionItem = async (req, res, next) => {
  try {
    const { id: meetingId, itemId } = req.params;
    const updates = req.body;

    // Verify ownership via meeting
    const meeting = await Meeting.findOne({ _id: meetingId, user: req.user.id });
    if (!meeting) return errorResponse(res, 'Meeting not found', 404);

    const actionItem = await ActionItem.findByIdAndUpdate(
      itemId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!actionItem) return errorResponse(res, 'Action item not found', 404);

    return successResponse(res, { actionItem }, 'Action item updated');
  } catch (err) {
    next(err);
  }
};

// --- REGENERATE EMAIL ---
export const regenerateEmail = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user.id });
    if (!meeting) return errorResponse(res, 'Meeting not found', 404);

    // Check credits again? Assuming 1 credit for email regen
    const user = await User.findById(req.user.id);
    if (user.credits < 1) return errorResponse(res, 'Insufficient credits', 402);

    try {
      const emailContent = await aiService.generateEmail(meeting);
      meeting.followUpEmail = emailContent;
      await meeting.save();
      await user.deductCredits(1);

      // Log usage
      const usage = new Usage({
        user: user._id,
        meeting: meeting._id,
        action: 'regenerate_email',
        creditsUsed: 1,
        creditsBalance: user.credits,
        status: 'success'
      });
      await usage.save();

      return successResponse(res, { followUpEmail: emailContent }, 'Email regenerated');
    } catch (aiErr) {
      logger.error('Email regeneration failed:', aiErr);
      return errorResponse(res, 'Failed to regenerate email', 503);
    }
  } catch (err) {
    next(err);
  }
};