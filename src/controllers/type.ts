import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { writeFile, unlink } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export class TypeController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const types = await storage.type.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                types
            },
            message: message('type_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const type = await storage.type.findOne(req.params.id)

        res.status(200).json({
            success: true,
            data: {
                type
            },
            message: message('type_getOne_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals,
            _id = req.params.id

        let type = await storage.type.findOne({ _id })

        if (req.file) {
            const icon = `icons/${req.file.fieldname}-${uuidv4()}${path.extname(
                req.file.originalname
            )}`
            await writeFile(path.join(__dirname, '../../../uploads', icon), req.file.buffer)

            if (type.icon) {
                await unlink(path.join(__dirname, '../../../uploads', icon))
            }

            type.icon = icon
        }

        type.name = req.body.name ? req.body.name : type.name

        type = await type.save()

        res.status(200).json({
            success: true,
            data: {
                type
            },
            message: message('type_update_200', lang)
        })
    })
}
