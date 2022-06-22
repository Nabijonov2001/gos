import { Router } from 'express'
import { NotificationController } from '../controllers/notification'
import { AuthMiddleware } from '../middleware/auth'

const router = Router()
const controller = new NotificationController()
const middleware = new AuthMiddleware()

router.get(
    '/',
    middleware.auth([
        'admin',
        'user1',
        'user2',
        'user3',
        'user4',
        'user5',
        'user8',
        'user9',
        'user11',
        'user12',
        'user16'
    ]),
    controller.get
)

export default router
