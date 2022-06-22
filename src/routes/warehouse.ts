import { Router } from 'express'
import { WarehouseController } from '../controllers/warehouse'
import { WarehouseValidator } from '../validators/warehouse'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new WarehouseController()
const validator = new WarehouseValidator()
const middleware = new AuthMiddleware()

router
    .route('/')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)

router
    .route('/:warehouse_id')
    .patch(middleware.auth(['admin']), validator.update, controller.update)

export default router
