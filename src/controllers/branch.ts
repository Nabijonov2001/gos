import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import AppError from '../utils/appError'

export class BranchController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const branches = await storage.branch.find({})

        res.status(200).json({
            success: true,
            data: {
                branches
            },
            message: message('branch_getAll_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals

        let cipher_code = '01',
            prev_branch = (await storage.branch.find({}, 'last'))[0]

        if (prev_branch) {
            cipher_code = (Number(prev_branch.cipher_code) + 1).toString().padStart(2, '0')
        }

        const branch = await storage.branch.create({ ...req.body, cipher_code })

        res.status(201).json({
            success: true,
            data: {
                branch
            },
            message: message('branch_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const branch = await storage.branch.update({ _id: req.params.id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                branch
            },
            message: message('branch_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { id } = req.params

        const products = await storage.product.find({ branch: id })

        if (products.length) {
            return next(new AppError(403, 'branch_403'))
        }

        await storage.warehouse.deleteMany({ brand: id })
        await storage.branch.delete({ _id: id })

        res.status(204).json({
            success: true,
            message: message('branch_delete_200', lang)
        })
    })
}
