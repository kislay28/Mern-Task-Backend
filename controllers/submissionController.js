const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private (Student only)
const createSubmission = async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;

    // Check if assignment exists and is published
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not available for submission'
      });
    }

    // Check if due date has passed
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Assignment due date has passed'
      });
    }

    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Create submission
    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      answer
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignmentId', 'title')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      submission: populatedSubmission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating submission'
    });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Teacher only)
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    console.log(`🔍 Fetching submissions for assignment: ${assignmentId}`);
    console.log(`👤 Current user ID: ${req.user.id}`);

    // Check if assignment exists and user owns it
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      console.log(`❌ Assignment ${assignmentId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    console.log(`📝 Assignment found. Created by: ${assignment.createdBy}`);
    console.log(`🔍 Comparing: assignment.createdBy(${assignment.createdBy.toString()}) vs req.user.id(${req.user.id})`);
    console.log(`🔍 Types: assignment.createdBy type: ${typeof assignment.createdBy}, req.user.id type: ${typeof req.user.id}`);

    if (assignment.createdBy.toString() !== req.user.id.toString()) {
      console.log(`❌ Access denied - Assignment belongs to ${assignment.createdBy.toString()}, current user is ${req.user.id.toString()}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log(`✅ Access granted - User owns the assignment`);

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    console.log(`📋 Found ${submissions.length} submissions`);

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submissions'
    });
  }
};

// @desc    Get student's submissions
// @route   GET /api/submissions/my
// @access  Private (Student only)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('assignmentId', 'title dueDate status')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submissions'
    });
  }
};

// @desc    Mark submission as reviewed
// @route   PUT /api/submissions/:id/review
// @access  Private (Teacher only)
const markSubmissionAsReviewed = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if teacher owns the assignment
    const assignment = await Assignment.findById(submission.assignmentId._id);
    
    if (assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    submission.reviewed = true;
    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate('assignmentId', 'title')
      .populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Submission marked as reviewed',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Mark submission reviewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating submission'
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId', 'title description dueDate')
      .populate('studentId', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student' && submission.studentId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'teacher') {
      const assignment = await Assignment.findById(submission.assignmentId._id);
      if (assignment.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching submission'
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  markSubmissionAsReviewed,
  getSubmission
};
