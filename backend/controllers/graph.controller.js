import { GraphService } from '../services/graph.service.js'

export const getGraphAnalysis = async (req, res, next) => {
    try {
        const analysis = await GraphService.analyzeGraphAndFlag()
        res.json(analysis)
    } catch (error) {
        next(error)
    }
}
