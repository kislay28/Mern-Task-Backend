const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'teacher') {
      // Teacher sees only their assignments
      query.createdBy = req.user.id;
      if (status) {
        query.status = status;
      }
    } else {
      // Students see only published assignments
      query.status = 'published';
    }

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // For teacher, add submission counts
    if (req.user.role === 'teacher') {
      const assignmentsWithCounts = await Promise.all(
        assignments.map(async (assignment) => {
          const submissionCount = await Submission.countDocuments({
            assignmentId: assignment._id
          });
          return {
            ...assignment.toJSON(),
            submissionCount
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: assignmentsWithCounts.length,
        assignments: assignmentsWithCounts
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignments'
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check permissions
    if (req.user.role === 'teacher' && assignment.createdBy._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'student' && assignment.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignment'
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      createdBy: req.user.id
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    
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
      message: 'Server error creating assignment'
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher only)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only edit draft assignments
    if (assignment.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit draft assignments'
      });
    }

    const { title, description, dueDate } = req.body;
    
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    
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
      message: 'Server error updating assignment'
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only delete draft assignments
    if (assignment.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft assignments'
      });
    }

    // Check if there are any submissions
    const submissionCount = await Submission.countDocuments({
      assignmentId: assignment._id
    });

    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assignment with existing submissions'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assignment'
    });
  }
};

// @desc    Update assignment status
// @route   PUT /api/assignments/:id/status
// @access  Private (Teacher only)
const updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const validTransitions = {
      draft: ['published'],
      published: ['completed'],
      completed: []
    };

    if (!validTransitions[assignment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${assignment.status} to ${status}`
      });
    }

    assignment.status = status;
    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating assignment status'
    });
  }
};

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus
};
