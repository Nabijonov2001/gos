import { Router } from 'express'
import { RequestController } from '../controllers/request'
import { AuthMiddleware } from '../middleware/auth'
import { RequestValidator } from '../validators/request'
import chatRouter from './chat'

const router = Router({ mergeParams: true })
const controller = new RequestController()
const validator = new RequestValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin', 'user1']), controller.getAll)
router
    .route('/create')
    .post(
        middleware.auth(['user1', 'user2', 'user3', 'user4', 'user5']),
        validator.create,
        controller.create
    )

router
    .route('/:id')
    .get(middleware.auth(['admin']), controller.getOne)
    .delete(middleware.auth(['admin']), controller.delete)

router.use('/:id/chat', chatRouter)

export default router
