import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class OfferValidator {
    createSchema = Joi.object({
        marketing_id: Joi.string().required(),
        organization: Joi.string().required(),
        price: Joi.number().integer().required()
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
