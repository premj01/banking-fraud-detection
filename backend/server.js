import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import prisma from './lib/prisma.js'
import authRoutes from './routes/auth.routes.js'
import fraudRoutes from './routes/fraud.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
    })
})

// Make io accessible to routes
app.set('io', io)

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', fraudRoutes)

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Test database connection and start server
prisma.$connect()
    .then(() => {
        console.log('✅ Database connected successfully')

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
        })
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error)
        process.exit(1)
    })

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
