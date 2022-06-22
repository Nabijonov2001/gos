import { Router } from 'express'
import { OfferController } from '../controllers/offer'
import { OfferValidator } from '../validators/offer'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new OfferController()
const validator = new OfferValidator()
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

router
    .route('/create')
    .post(middleware.auth(['user2', 'user3']), upload, validator.create, controller.create)
router.route('/:id').delete(middleware.auth(['user2', 'user3']), controller.delete)

export default router
