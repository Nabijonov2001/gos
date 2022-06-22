import { Router } from 'express'
import { ProductController } from '../controllers/product'
import { ProductValidator } from '../validators/product'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new ProductController()
const validator = new ProductValidator()
const middleware = new AuthMiddleware()

router.get('/trigger', middleware.auth(['admin']), controller.trigger)
router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )
// router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)
router
    .route('/:id')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getOne
    )
    .patch(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5']),
        validator.update,
        controller.update
    )

router.route('/').delete(middleware.auth(['admin']), controller.delete)

export default router
