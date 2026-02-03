import express from 'express'
import { detectFraud, getRecentTransactions, getUserTransactions } from '../controllers/fraud.controller.js'

const router = express.Router()

router.post('/detect', detectFraud)
router.get('/recent', getRecentTransactions)
router.get('/user/:customerId', getUserTransactions)

export default router
