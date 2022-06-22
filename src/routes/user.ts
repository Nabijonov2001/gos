import { Router } from 'express'
import { AdminController } from '../controllers/user'
import { UserValidator } from '../validators/user'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new AdminController()
const validator = new UserValidator()
const middleware = new AuthMiddleware()
const uploads = multer(['image/png', 'image/jpeg'], 20).single('photo')

const access = [
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
]

router.route('/super-admin').post(controller.createSuperAdmin)
router
    .route('/all')
    .get(middleware.auth(['admin', 'user3', 'user5', 'user9', 'user11']), controller.getAll)
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create)
router.route('/login').post(validator.login, controller.login)
router
    .route('/photo')
    .post(middleware.auth(access), uploads, controller.uploadPhoto)
    .delete(middleware.auth(access), controller.deletePhoto)
router
    .route('/:id')
    .get(middleware.auth(access), controller.getOne)
    .patch(middleware.auth(access), validator.update, controller.update)

export default router
