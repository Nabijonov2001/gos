import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth'
import { KpiController } from '../controllers/kpi'
import { MonitoringController } from '../controllers/monitoring'

const router = Router({ mergeParams: true })
const controller = new MonitoringController()
const middleware = new AuthMiddleware()

router.route('/general-info').get(middleware.auth(['user5']), controller.getGeneral)
router.route('/filtered').post(middleware.auth(['user5']), controller.getWithFilter)
router.route('/contract-info').get(middleware.auth(['user5']), controller.getContractInfo)
router.route('/get-contracts').post(middleware.auth(['user5']), controller.getAllContract)
router.route('/:id').get(middleware.auth(['user5']), controller.getOne)

export default router
