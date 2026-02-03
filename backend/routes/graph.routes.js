import express from 'express'
import { getGraphAnalysis } from '../controllers/graph.controller.js'

const router = express.Router()

router.get('/analyze', getGraphAnalysis)

export default router
