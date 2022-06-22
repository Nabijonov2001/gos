import { Router } from 'express'
import { PurchaseController } from '../controllers/purchase'
import { PurchaseValidator } from '../validators/purchase'
import { AuthMiddleware } from '../middleware/auth'
import requirementRouter from './requirement'
import bidderRouter from './bidder'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new PurchaseController()
const validator = new PurchaseValidator()
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

router.route('/all').get(middleware.auth(['user3']), controller.getAll)
router
    .route('/:id')
    .get(middleware.auth(['user3']), controller.getOne)
    .patch(middleware.auth(['user3']), upload, validator.update, controller.update)
    .post(middleware.auth(['user3']), validator.changeSelectedUser, controller.changeSelectedUser)

router.use('/:id/requirement', requirementRouter)
router.use('/:id/bidder', bidderRouter)
export default router
