import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userRepository from '../repositories/user.repository.js'

export class AuthService {
    async signup(email, password) {
        // Check if user exists
        const existingUser = await userRepository.findByEmail(email)
        if (existingUser) {
            throw new Error('User already exists')
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await userRepository.create({
            email,
            password: hashedPassword
        })

        // Generate token
        const token = this.generateToken(user)

        return {
            token,
            user: this.sanitizeUser(user)
        }
    }

    async signin(email, password) {
        // Find user
        const user = await userRepository.findByEmail(email)
        if (!user) {
            throw new Error('Invalid credentials')
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            throw new Error('Invalid credentials')
        }

        // Generate token
        const token = this.generateToken(user)

        return {
            token,
            user: this.sanitizeUser(user)
        }
    }

    async getMe(userId) {
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        return this.sanitizeUser(user)
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        )
    }

    sanitizeUser(user) {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
    }
}

export default new AuthService()
