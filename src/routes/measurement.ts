import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth'
import { MeasurementController } from '../controllers/measurement'
import { MeasurementValidator } from '../validators/measurement'

const router = Router({ mergeParams: true })
const controller = new MeasurementController()
const validator = new MeasurementValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin', 'user1', 'user2', 'user11']), controller.getAll)
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)
router.route('/:id').patch(middleware.auth(['admin']), validator.update, controller.update)
router.route('/delete').delete(middleware.auth(['admin']), validator.delete, controller.delete)

export default router
