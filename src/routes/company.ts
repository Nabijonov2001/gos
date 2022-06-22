import { Router } from 'express'
import multer from '../middleware/multer'
import { CompanyController } from '../controllers/company'
import { CompanyValidator } from '../validators/company'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new CompanyController()
const validator = new CompanyValidator()
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

router
    .route('/all')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getAll
    )
router
    .route('/create')
    .post(middleware.auth(['admin']), upload, validator.create, controller.create)

router
    .route('/:id')
    .get(
        middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
        controller.getOne
    )
    .patch(middleware.auth(['admin']), upload, validator.update, controller.update)
    .delete(middleware.auth(['admin']), controller.delete)

export default router
