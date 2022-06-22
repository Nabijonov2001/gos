import { Router } from 'express'
import { CommissionController } from '../controllers/commission'
import { CommissionValidator } from '../validators/commission'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new CommissionController()
const validator = new CommissionValidator()
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

router.route('/all').get(middleware.auth(['admin']), controller.getAll)
router
    .route('/create')
    .post(middleware.auth(['admin']), upload, validator.create, controller.create)

router
    .route('/:id')
    .patch(middleware.auth(['admin']), upload, validator.update, controller.update)
    .delete(middleware.auth(['admin']), controller.delete)

export default router
