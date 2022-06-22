import { Router } from 'express'
import { TypeController } from '../controllers/type'
import { TypeValidator } from '../validators/type'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new TypeController()
const validator = new TypeValidator()
const middleware = new AuthMiddleware()

const uploads = multer(['image/svg+xml'], 20).single('icon')

router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )

router
    .route('/:id')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getOne
    )
    .patch(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5']),
        uploads,
        validator.update,
        controller.update
    )

export default router
