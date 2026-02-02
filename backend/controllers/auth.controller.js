import authService from '../services/auth.service.js'

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const result = await authService.signup(email, password)

        res.status(201).json({
            success: true,
            ...result
        })
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message })
        }
        next(error)
    }
}

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const result = await authService.signin(email, password)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message })
        }
        next(error)
    }
}

export const getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user.id)

        res.json({
            success: true,
            user
        })
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message })
        }
        next(error)
    }
}
