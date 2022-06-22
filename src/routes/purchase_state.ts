import { Router } from 'express'
import { PurchaseStateController } from '../controllers/purchase_state'
import { AuthMiddleware } from '../middleware/auth'
import { PurchaseStateValidator } from '../validators/purchase_state'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new PurchaseStateController()
const validator = new PurchaseStateValidator()
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
).array('docs')

router.route('/all').get(middleware.auth(['admin', 'user4', 'user5', 'user12']), controller.getAll)
router.route('/finish/:id').patch(middleware.auth(['user12']), controller.finish)
router
    .route('/:id')
    .get(middleware.auth(['admin', 'user4', 'user5', 'user12']), controller.getOne)
    .patch(
        middleware.auth(['user4', 'user5', 'user12']),
        upload,
        validator.update,
        controller.update
    )

export default router
