import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import AppError from '../utils/appError'
import { writeFile } from 'fs/promises'
import path from 'path'
import { IUser } from '../models/User'

export class CommissionController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const commissions = await storage.commission.find({})

        res.status(200).json({
            success: true,
            data: {
                commissions
            },
            message: message('commission_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const commission = await storage.commission.findOne({})

        res.status(200).json({
            success: true,
            data: {
                commission
            },
            message: message('commission_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { user_id } = req.body

        const user = await storage.user.findOne({
            _id: user_id,
            $or: [
                {
                    type: 'user4'
                },
                {
                    type: 'user5'
                }
            ]
        })

        req.body.user = user_id

        if (!req.file) {
            return next(new AppError(400, 'Please upload a file'))
        }

        req.body.added_base_doc = {
            original_name: req.file.originalname,
            unique_name: `files/${Date.now()}-${req.file.originalname}`
        }

        await writeFile(
            path.join(__dirname, '../../../uploads', req.body.added_base_doc.unique_name),
            req.file.buffer
        )

        const commission = await storage.commission.create(req.body)
        user.is_commission_member = true
        await user.save()

        res.status(201).json({
            success: true,
            data: {
                commission
            },
            message: message('commission_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals

        if (!req.file) {
            return next(new AppError(400, 'Please upload a file'))
        }

        let commission = await storage.commission.findOne({ _id: req.params.id })

        req.body.removed_base_doc = {
            original_name: req.file.originalname,
            unique_name: `files/${Date.now()}-${req.file.originalname}`
        }

        await writeFile(
            path.join(__dirname, '../../../uploads', req.body.removed_base_doc.unique_name),
            req.file.buffer
        )

        req.body.is_commission = false

        commission = await storage.commission.update({ _id: commission.id }, req.body)

        await storage.user.update({ _id: commission.user }, {
            is_commission_member: false
        } as IUser)

        res.status(200).json({
            success: true,
            data: {
                commission
            },
            message: message('commission_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { id } = req.params

        await storage.commission.delete({ _id: id })

        res.status(204).json({
            success: true,
            message: message('commission_delete_200', lang)
        })
    })
}
