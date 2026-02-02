import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
})

socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id)
})

socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected')
})

socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message)
})

export default socket
