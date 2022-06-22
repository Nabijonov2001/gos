import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class UnitValidator {
    private createSchema = Joi.object({
        section_id: Joi.string().uuid().required(),
        name: Joi.string().required(),
        sup_unit_id: Joi.string().uuid()
    })

    private updateSchema = Joi.object({
        name: Joi.string().required()
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
