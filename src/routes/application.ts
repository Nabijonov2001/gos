import { Router } from 'express'
import multer from '../middleware/multer'
import { ApplicationController } from '../controllers/application'
import { ApplicationValidator } from '../validators/application'
import { AuthMiddleware } from '../middleware/auth'
import responseRouter from './response'

const router = Router({ mergeParams: true })
const controller = new ApplicationController()
const validator = new ApplicationValidator()
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
).array('docs', 10)

router.route('/all').get(middleware.auth(['admin', 'user1']), controller.getAll)
router
    .route('/create')
    .post(middleware.auth(['user1']), upload, validator.create, controller.create)

router
    .route('/resend')
    .post(middleware.auth(['user1']), upload, validator.resend, controller.resend)

router
    .route('/:id')
    .get(middleware.auth(['admin', 'user1']), controller.getOne)
    .patch(middleware.auth(['user1']), upload, validator.update, controller.update)
    .delete(middleware.auth(['admin', 'user1']), controller.delete)

router.use('/:id/responses', responseRouter)

export default router
