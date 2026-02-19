import mongoose from "mongoose"


const actionItemSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Action item title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  assignee: {
    type: String,
    trim: true,
    default: 'Unassigned',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'pending',
  },
  // AI Risk Prediction
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  riskReason: {
    type: String,
    trim: true,
    default: null,
  },
  // Was this explicitly mentioned or inferred by AI?
  isInferred: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
}, {
  timestamps: true,
});

actionItemSchema.index({ meeting: 1, status: 1 });
actionItemSchema.index({ user: 1, dueDate: 1 });
actionItemSchema.index({ user: 1, status: 1 });

// Auto-update to overdue
actionItemSchema.pre('find', function () {
  const now = new Date();
  this.model.updateMany(
    { dueDate: { $lt: now }, status: { $in: ['pending', 'in_progress'] } },
    { $set: { status: 'overdue' } }
  ).exec();
});

const ActionItem = mongoose.model('ActionItem', actionItemSchema);
export default ActionItem;
