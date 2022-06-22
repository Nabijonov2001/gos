import { Router } from 'express'
import { RequirementController } from '../controllers/requirement'
import { RequirementValidator } from '../validators/requirement'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new RequirementController()
const validator = new RequirementValidator()
const middleware = new AuthMiddleware()

router.route('/create').post(middleware.auth(['user4']), validator.create, controller.create)
router.route('/:req_id').delete(middleware.auth(['user4']), controller.delete)

export default router
