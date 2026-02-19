import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'analyze_meeting',
      'regenerate_email',
      'reanalyze',
      'export',
      'api_call',
    ],
  },
  creditsUsed: {
    type: Number,
    required: true,
    min: 0,
  },
  creditsBalance: {
    type: Number,
    required: true,
    min: 0,
  },
  metadata: {
    wordCount: Number,
    processingTime: Number,
    model: String,
    tokens: Number,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'refunded'],
    default: 'success',
  },
  ipAddress: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

usageSchema.index({ user: 1, createdAt: -1 });
usageSchema.index({ user: 1, action: 1 });
usageSchema.index({ createdAt: -1 });

// Static: get usage summary for a user
usageSchema.statics.getUserSummary = async function (userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await this.aggregate([
    { $match: { user: userId, createdAt: { $gte: since }, status: 'success' } },
    {
      $group: {
        _id: '$action',
        totalCredits: { $sum: '$creditsUsed' },
        count: { $sum: 1 },
      },
    },
  ]);
};

const Usage = mongoose.model('Usage', usageSchema);
export default Usage;
