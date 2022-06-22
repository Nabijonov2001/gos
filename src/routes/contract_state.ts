import { Router } from 'express'
import { ContractStateController } from '../controllers/contract_state'
import { ContractStateValidator } from '../validators/contract_state'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new ContractStateController()
const validator = new ContractStateValidator()
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
        middleware.auth([
            'admin',
            'user1',
            'user2',
            'user3',
            'user5',
            'user8',
            'user9',
            'user11',
            'user16'
        ]),
        controller.getAll
    )

router
    .route('/:id')
    .get(
        middleware.auth([
            'admin',
            'user1',
            'user2',
            'user3',
            'user5',
            'user8',
            'user9',
            'user11',
            'user16'
        ]),
        controller.getOne
    )
    .patch(
        middleware.auth(['user2', 'user3', 'user5', 'user8', 'user9', 'user11', 'user16']),
        upload,
        validator.update,
        controller.update
    )

export default router
