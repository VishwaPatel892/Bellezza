import * as Yup from 'yup';

/**
 * Login form validation schema
 */
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

/**
 * Registration form validation schema
 */
export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/[a-zA-Z]/, 'Must contain at least one letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  skinType: Yup.string()
    .oneOf(['dry', 'oily', 'combination', 'sensitive', 'normal', 'unknown'])
    .default('combination'),
});

/**
 * Profile edit validation schema
 */
export const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  skinType: Yup.string()
    .oneOf(['dry', 'oily', 'combination', 'sensitive', 'normal', 'unknown'])
    .required('Please select your skin type'),
});

/**
 * AI Assistant query schema
 */
export const assistantQuerySchema = Yup.object().shape({
  query: Yup.string()
    .min(3, 'Please describe your skin question in at least 3 characters')
    .max(500, 'Question cannot exceed 500 characters')
    .required('Please enter your question'),
});

/**
 * 7-Step Skin Assessment Formik Validation Schema
 */
export const skinAssessmentSchema = Yup.object().shape({
  skinType: Yup.string()
    .transform((val) => {
      if (!val) return 'Not sure';
      const map = {
        dry: 'Dry',
        oily: 'Oily',
        combination: 'Combination',
        normal: 'Normal',
        sensitive: 'Sensitive',
        unknown: 'Not sure',
        'not sure': 'Not sure',
      };
      return map[val.toLowerCase()] || val;
    })
    .oneOf([
      'Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'Not sure', 'Unsure',
      'dry', 'oily', 'combination', 'normal', 'sensitive', 'unknown',
    ])
    .default('Not sure'),
  skinConcerns: Yup.array().of(Yup.string()).default([]),
  sensitivityLevel: Yup.string()
    .transform((val) => {
      if (!val) return 'Not sure';
      const map = {
        low: 'Low',
        moderate: 'Moderate',
        medium: 'Moderate',
        high: 'High',
        'not sure': 'Not sure',
        unsure: 'Not sure',
      };
      return map[val.toLowerCase()] || val;
    })
    .oneOf([
      'Low', 'Moderate', 'Medium', 'High', 'Not sure', 'Unsure',
      'low', 'moderate', 'medium', 'high',
    ])
    .default('Not sure'),
  experiencesIrritation: Yup.string()
    .transform((val) => {
      if (!val) return 'Not sure';
      const map = { yes: 'Yes', no: 'No', sometimes: 'Sometimes', 'not sure': 'Not sure' };
      return map[val.toLowerCase()] || val;
    })
    .oneOf(['Yes', 'No', 'Sometimes', 'Not sure', 'yes', 'no', 'sometimes'])
    .default('Not sure'),
  knownIngredientAllergies: Yup.array().of(Yup.string()).default([]),
  irritationTriggers: Yup.array().of(Yup.string()).default([]),
  fragranceSensitivity: Yup.boolean().default(false),
  productReactions: Yup.array().of(Yup.string()).default([]),
  skincareGoals: Yup.array().of(Yup.string()).default([]),
  currentRoutine: Yup.array().of(Yup.string()).default([]),
  currentProducts: Yup.array().of(Yup.string()).default([]),
  monthlyBudgetINR: Yup.number().nullable().min(0, 'Budget must be positive'),
  productPreferences: Yup.array().of(Yup.string()).default([]),
  fragranceFreePreference: Yup.boolean().default(false),
  routinePreference: Yup.string()
    .transform((val) => {
      if (!val) return 'Simple';
      const map = {
        simple: 'Simple',
        advanced: 'Advanced',
        flexible: 'Flexible',
        'not sure': 'Not sure',
      };
      return map[val.toLowerCase()] || val;
    })
    .oneOf([
      'Simple', 'Advanced', 'Flexible', 'Not sure',
      'simple', 'advanced', 'flexible',
    ])
    .default('Simple'),
  indiaFirstPreference: Yup.boolean().default(true),
  disclaimerAcknowledged: Yup.boolean().default(true),
});
