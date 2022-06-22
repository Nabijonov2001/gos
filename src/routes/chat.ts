import { Router } from 'express'
import { ChatController } from '../controllers/chat'
import { AuthMiddleware } from '../middleware/auth'
import { ChatValidator } from '../validators/chat'

const router = Router({ mergeParams: true })
const controller = new ChatController()
const validator = new ChatValidator()
const middleware = new AuthMiddleware()

router
    .route('/')
    .get(middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5']), controller.getAll)
router
    .route('/create')
    .post(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5']),
        validator.create,
        controller.create
    )

router.route('/:chat_id').delete(middleware.auth(['admin']), controller.delete)

export default router
