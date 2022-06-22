import { Router } from 'express'
import { ResponseController } from '../controllers/response'
import { AuthMiddleware } from '../middleware/auth'
import { ResponseValidator } from '../validators/response'

const router = Router({ mergeParams: true })
const controller = new ResponseController()
const validator = new ResponseValidator()
const middleware = new AuthMiddleware()

// router
//     .route('/')
//     .get(
//         middleware.auth(['admin', 'user1', 'user2', 'user3', 'user4', 'user5', 'user11']),
//         controller.getAll
//     )

router
    .route('/:reponse_id')
    .delete(middleware.auth(['admin', 'user2', 'user3', 'user4', 'user11']), controller.delete)

export default router
