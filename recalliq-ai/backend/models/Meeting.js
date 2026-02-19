import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  transcript: {
    type: String,
    required: [true, 'Transcript is required'],
    minlength: [50, 'Transcript must be at least 50 characters'],
  },
  transcriptWordCount: {
    type: Number,
    default: 0,
  },
  participants: [{
    type: String,
    trim: true,
  }],
  meetingDate: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number, // in minutes
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  // AI Analysis Results
  summary: {
    type: String,
    default: null,
  },
  keyTopics: [{
    type: String,
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'mixed'],
    default: null,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  riskFactors: [{
    type: String,
  }],
  followUpEmail: {
    type: String,
    default: null,
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  processingTime: {
    type: Number, // milliseconds
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
meetingSchema.index({ user: 1, createdAt: -1 });
meetingSchema.index({ user: 1, status: 1 });
meetingSchema.index({ user: 1, isArchived: 1 });

// Pre-save: calculate word count
meetingSchema.pre('save', function (next) {
  if (this.isModified('transcript')) {
    this.transcriptWordCount = this.transcript.trim().split(/\s+/).length;
  }
  next();
});

// Virtual: action items
meetingSchema.virtual('actionItems', {
  ref: 'ActionItem',
  localField: '_id',
  foreignField: 'meeting',
});

// Virtual: decisions
meetingSchema.virtual('decisions', {
  ref: 'Decision',
  localField: '_id',
  foreignField: 'meeting',
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
