import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Helper middleware to handle the validation result
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errors.array().map(err => ({
          field: err.type === 'field' ? err.path : '',
          message: err.msg,
        })),
      },
    });
    return;
  }
  next();
};

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

export const leadValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Lead name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Lead email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Lead status is required')
    .isIn(['new', 'contacted', 'qualified', 'lost'])
    .withMessage('Status must be one of: new, contacted, qualified, lost'),
  
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Lead source is required')
    .isIn(['website', 'instagram', 'referral'])
    .withMessage('Source must be one of: website, instagram, referral'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Assigned To User ID format'),
  validate,
];

export const leadUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Lead name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('status')
    .optional()
    .trim()
    .isIn(['new', 'contacted', 'qualified', 'lost'])
    .withMessage('Status must be one of: new, contacted, qualified, lost'),
  
  body('source')
    .optional()
    .trim()
    .isIn(['website', 'instagram', 'referral'])
    .withMessage('Source must be one of: website, instagram, referral'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body('assignedTo')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty string to unassign a lead
      if (value === '' || value === null) {
        return true;
      }
      // Check if valid mongo id
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(value)) {
        throw new Error('Invalid Assigned To User ID format');
      }
      return true;
    }),
  validate,
];
