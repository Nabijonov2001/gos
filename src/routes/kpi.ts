import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth'
import { KpiController } from '../controllers/kpi'

const router = Router({ mergeParams: true })
const controller = new KpiController()
const middleware = new AuthMiddleware()

router.route('/by-user').get(middleware.auth(['user3']),controller.getOne)
export default router
