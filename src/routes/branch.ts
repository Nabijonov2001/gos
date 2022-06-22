import { Router } from 'express'
import { BranchController } from '../controllers/branch'
import { BranchValidator } from '../validators/branch'
import { AuthMiddleware } from '../middleware/auth'
import warehouseRouter from './warehouse'

const router = Router({ mergeParams: true })
const controller = new BranchController()
const validator = new BranchValidator()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)

router
    .route('/:id')
    .patch(middleware.auth(['admin']), validator.update, controller.update)
    .delete(middleware.auth(['admin']), controller.delete)

// Branch Warehouse
router.use('/:id/warehouses', warehouseRouter)

export default router
