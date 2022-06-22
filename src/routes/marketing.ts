import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth'
import { MarketingController } from '../controllers/marketing'
import { MarketingValidator } from '../validators/marketing'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new MarketingController()
const validator = new MarketingValidator()
const middleware = new AuthMiddleware()
const upload = multer(
    [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    20
).single('doc')

router.route('/all').get(middleware.auth(['admin', 'user2', 'user3']), controller.getAll)

router
    .route('/:id')
    .get(middleware.auth(['admin', 'user2', 'user3']), controller.getOne)
    .patch(
        middleware.auth(['admin', 'user2', 'user3']),
        upload,
        validator.update,
        controller.update
    )

export default router
