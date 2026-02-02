import prisma from '../lib/prisma.js'

export class UserRepository {
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        })
    }

    async findById(id) {
        return await prisma.user.findUnique({
            where: { id }
        })
    }

    async create(data) {
        return await prisma.user.create({
            data
        })
    }

    async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        })
    }

    async delete(id) {
        return await prisma.user.delete({
            where: { id }
        })
    }

    async findAll() {
        return await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }
}

export default new UserRepository()
