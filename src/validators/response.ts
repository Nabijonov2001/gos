import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ResponseValidator {
    private createSchema = Joi.object({
        text: Joi.string().required(),
        status: Joi.string().valid('approved', 'disapproved').required(),
        product_ids: Joi.array().items(Joi.string().uuid())
    })

    private updateSchema = Joi.object({
        text: Joi.string(),
        status: Joi.string().valid('approved', 'disapproved'),
        product_ids: Joi.array().items(Joi.string().uuid())
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
