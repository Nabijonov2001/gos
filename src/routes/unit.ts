import { Router } from 'express'
import { UnitController } from '../controllers/unit'
import { UnitValidator } from '../validators/unit'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const router1 = Router({ mergeParams: true })
const controller = new UnitController()
const validator = new UnitValidator()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)
router.route('/:id').patch(middleware.auth(['admin']), validator.update, controller.update)
router
    .route('/:id/sub_units')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getSubUnits
    )

// Approve or Disapprove created Units'
router1.route('/').get(middleware.auth(['admin']), controller.getSupUnits)
router1.route('/save').patch(middleware.auth(['admin']), controller.approve)
router1.route('/cancel').delete(middleware.auth(['admin']), controller.disapprove)

export { router as default, router1 }
