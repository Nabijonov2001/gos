import { Router } from 'express'
import { BidderController } from '../controllers/bidder'
import { BidderValidator } from '../validators/bidder'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new BidderController()
const validator = new BidderValidator()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(
        middleware.auth([
            'admin',
            'user1',
            'user2',
            'user3',
            'user4',
            'user5',
            'user8',
            'user9',
            'user11',
            'user12',
            'user16'
        ]),
        controller.getAll
    )
router.route('/create').post(middleware.auth(['user12']), validator.create, controller.create)
router.route('/update').patch(middleware.auth(['user4']), validator.update, controller.update)
router
    .route('/update/:commission_id')
    .patch(middleware.auth(['user4', 'user5']), validator.commission, controller.commission)
router.route('/:bidder_id').delete(middleware.auth(['user12']), controller.delete)
export default router
