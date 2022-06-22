import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ProductValidator {
    private createSchema = Joi.object({
        warehouse: Joi.string().required()
    })

    private updateSchema = Joi.object({
        category_id: Joi.string().uuid().required(),
        unit_ids: Joi.array().items(Joi.string().uuid()).required(),
        warehouse_id: Joi.string().uuid().required()
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
