import { Router } from 'express'
import { FileUploadController } from '../controllers/files'
import { FilesValidator } from '../validators/files'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new FileUploadController()
const validator = new FilesValidator()
const middleware = new AuthMiddleware()
const multipleUpload = multer(
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

const singleUpload = multer(
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
    5
).single('doc')

router
    .route('/single')
    .post(
        middleware.auth(['user1', 'user2', 'user3', 'user4', 'user5', 'user11', 'user12', 'admin']),
        singleUpload,
        controller.singleFile
    )
router
    .route('/multiple')
    .post(
        middleware.auth(['user1', 'user2', 'user3', 'user4', 'user5', 'user11', 'user12', 'admin']),
        multipleUpload,
        controller.multipleFiles
    )

router
    .route('/multiple/delete')
    .delete(
        middleware.auth(['user1', 'user2', 'user3', 'user4', 'user5', 'user11', 'user12', 'admin']),
        controller.multipleFilesDelete
    )
router
    .route('/single/delete')
    .delete(
        middleware.auth([
            'user1',
            'user2',
            'user3',
            'user4',
            'user5',
            'user8',
            'user9',
            'user11',
            'user12',
            'user16',
            'admin'
        ]),
        controller.singleFileDelete
    )

export default router
