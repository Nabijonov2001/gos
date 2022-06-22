import { Router } from 'express'
import { ContractController } from '../controllers/contract'
import { ContractValidator } from '../validators/contract'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new ContractController()
const validator = new ContractValidator()
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

router
    .route('/:id')
    .patch(middleware.auth(['user1', 'user2']), upload, validator.update, controller.update)

export default router
