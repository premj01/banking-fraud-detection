import express from 'express'
import { detectFraud, getRecentTransactions } from '../controllers/fraud.controller.js'

const router = express.Router()

router.post('/detect', detectFraud)
router.get('/recent', getRecentTransactions)

export default router
