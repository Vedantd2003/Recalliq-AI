import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Decision description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    enum: ['explicit', 'implicit', 'hidden'],
    default: 'explicit',
  },
  // 'implicit' = mentioned but not formally decided
  // 'hidden' = AI detected it's implied but never stated
  category: {
    type: String,
    enum: ['strategic', 'operational', 'technical', 'financial', 'personnel', 'other'],
    default: 'other',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 85, // AI confidence score
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  madeBy: {
    type: String,
    trim: true,
    default: null, // Person who made the decision
  },
  context: {
    type: String,
    trim: true,
    maxlength: [500, 'Context cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['active', 'implemented', 'reversed', 'pending'],
    default: 'active',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
}, {
  timestamps: true,
});

decisionSchema.index({ meeting: 1, type: 1 });
decisionSchema.index({ user: 1, createdAt: -1 });

const Decision = mongoose.model('Decision', decisionSchema);
export default Decision;
