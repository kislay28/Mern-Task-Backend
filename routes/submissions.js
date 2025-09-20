const express = require('express');
const { body, param } = require('express-validator');
const {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  markSubmissionAsReviewed,
  getSubmission
} = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createSubmissionValidation = [
  body('assignmentId')
    .isMongoId()
    .withMessage('Invalid assignment ID'),
  body('answer')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Answer is required and must not exceed 5000 characters')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID')
];

const assignmentIdValidation = [
  param('assignmentId')
    .isMongoId()
    .withMessage('Invalid assignment ID')
];

// Routes
router.post('/', 
  auth, 
  roleAuth(['student']), 
  createSubmissionValidation, 
  handleValidationErrors, 
  createSubmission
);

router.get('/assignment/:assignmentId', 
  auth, 
  roleAuth(['teacher']), 
  assignmentIdValidation, 
  handleValidationErrors, 
  getSubmissionsByAssignment
);

router.get('/my', 
  auth, 
  roleAuth(['student']), 
  getMySubmissions
);

router.get('/:id', 
  auth, 
  idValidation, 
  handleValidationErrors, 
  getSubmission
);

router.put('/:id/review', 
  auth, 
  roleAuth(['teacher']), 
  idValidation, 
  handleValidationErrors, 
  markSubmissionAsReviewed
);

module.exports = router;
