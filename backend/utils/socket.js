// Socket.io utility functions
// Use these to emit events from your controllers

export const emitToUser = (io, userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data)
}

export const emitToRole = (io, role, event, data) => {
    io.to(`role:${role}`).emit(event, data)
}

export const emitToAll = (io, event, data) => {
    io.emit(event, data)
}

// Example usage in controllers:
/*
import { emitToUser, emitToRole } from '../utils/socket.js'

export const someController = async (req, res) => {
  const io = req.app.get('io')
  
  // Emit to specific user
  emitToUser(io, userId, 'notification', { message: 'Hello!' })
  
  // Emit to all users with a specific role
  emitToRole(io, 'bank', 'update', { data: 'New data' })
  
  res.json({ success: true })
}
*/
