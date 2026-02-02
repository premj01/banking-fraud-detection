import express from 'express'
import { body } from 'express-validator'
import { signup, signin, getMe } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validation.middleware.js'

const router = express.Router()

// Validation rules
const signupValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

const signinValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
]

// Routes
router.post('/signup', signupValidation, validate, signup)
router.post('/signin', signinValidation, validate, signin)
router.get('/me', authenticate, getMe)

export default router
