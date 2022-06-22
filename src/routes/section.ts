import { Router } from 'express'
import { SectionController } from '../controllers/section'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new SectionController()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )

export default router
