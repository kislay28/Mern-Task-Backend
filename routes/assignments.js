const express = require('express');
const { body, param } = require('express-validator');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus
} = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createAssignmentValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must not exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must not exceed 1000 characters'),
  body('dueDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

const updateAssignmentValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

const updateStatusValidation = [
  body('status')
    .isIn(['draft', 'published', 'completed'])
    .withMessage('Status must be draft, published, or completed')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid assignment ID')
];

// Routes
router.get('/', auth, getAssignments);
router.get('/:id', auth, idValidation, handleValidationErrors, getAssignment);
router.post('/', 
  auth, 
  roleAuth(['teacher']), 
  createAssignmentValidation, 
  handleValidationErrors, 
  createAssignment
);
router.put('/:id', 
  auth, 
  roleAuth(['teacher']), 
  idValidation, 
  updateAssignmentValidation, 
  handleValidationErrors, 
  updateAssignment
);
router.delete('/:id', 
  auth, 
  roleAuth(['teacher']), 
  idValidation, 
  handleValidationErrors, 
  deleteAssignment
);
router.put('/:id/status', 
  auth, 
  roleAuth(['teacher']), 
  idValidation, 
  updateStatusValidation, 
  handleValidationErrors, 
  updateAssignmentStatus
);

module.exports = router;
