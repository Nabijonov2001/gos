import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'

export class WarehouseController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const warehouses = await storage.warehouse.find({ branch: req.params.id })

        res.status(200).json({
            success: true,
            data: {
                warehouses
            },
            message: message('warehouse_getAll_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { id } = req.params

        await storage.branch.findOne({ _id: id })

        let cipher_code = '01'
        const prev_warehouse = (await storage.warehouse.find({ branch: id }, 'last'))[0]

        if (prev_warehouse) {
            cipher_code = (Number(prev_warehouse.cipher_code) + 1).toString().padStart(2, '0')
        }

        const warehouse = await storage.warehouse.create({ ...req.body, branch: id, cipher_code })

        res.status(201).json({
            success: true,
            data: {
                warehouse
            },
            message: message('warehouse_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { id: _id, warehouse_id } = req.params
        const user = await storage.user.findOne({ _id: id })
        let warehouse = await storage.warehouse.findOne({ _id: warehouse_id, branch: _id })

        if (user.type.startsWith('user') && !user.branches.includes(warehouse_id)) {
            return next(new AppError(403, 'warehouse_update_403'))
        }

        warehouse.name = req.body.name
        warehouse = await warehouse.save()

        res.status(200).json({
            success: true,
            data: {
                warehouse
            },
            message: message('warehouse_update_200', lang)
        })
    })
}
