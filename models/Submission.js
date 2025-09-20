const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [5000, 'Answer cannot exceed 5000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Index for efficient queries
submissionSchema.index({ assignmentId: 1 });
submissionSchema.index({ studentId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
