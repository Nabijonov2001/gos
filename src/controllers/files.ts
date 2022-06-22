import { NextFunction, Request, Response } from 'express'
import { unlink } from 'fs/promises'
import path from 'path'
import catchAsync from '../utils/catchAsync'
import { Upload } from '../helpers/upload'
import AppError from '../utils/appError'

export class FileUploadController {
    singleFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = req.file as Express.Multer.File
        if (!doc) {
            return next(new AppError(400, 'file_upload_400'))
        }
        const file = await Upload.uploadFile(req.file as Express.Multer.File)

        res.status(201).json({
            success: true,
            file
        })
    })

    multipleFiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const files = await Upload.uploadFiles(req.files as Express.Multer.File[])

        res.status(201).json({
            success: true,
            files
        })
    })

    singleFileDelete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { removed_file } = req.body

        await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))

        res.status(200).json({
            success: true
        })
    })

    multipleFilesDelete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { removed_files } = req.body

        for (const removed_file of removed_files) {
            await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))
        }

        res.status(200).json({
            success: true
        })
    })
}
