import { Router } from 'express'
import { ApplicationStateController } from '../controllers/application_state'
import { AuthMiddleware } from '../middleware/auth'
import { ApplicationStateValidator } from '../validators/application_state'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new ApplicationStateController()
const validator = new ApplicationStateValidator()
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
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )

router.route('/:id/:user_id').delete(middleware.auth(['user3']), controller.deleteMember)

router
    .route('/:id')
    .get(middleware.auth(['user2', 'user3', 'user4', 'user5', 'user11']), controller.getOne)
    .post(middleware.auth(['user3']), validator.changeSelectedUser, controller.changeSelectedUser)
    .patch(
        middleware.auth(['user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        upload,
        validator.update,
        controller.update
    )

export default router
