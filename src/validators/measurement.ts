import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class MeasurementValidator {
    private createSchema = Joi.object({
        name: Joi.string().trim().min(1).required()
    })

    private updateSchema = Joi.object({
        name: Joi.string().trim().min(1).required()
    })

    private deleteSchema = Joi.object({
        measurement_id: Joi.string().uuid().required()
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

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.deleteSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
