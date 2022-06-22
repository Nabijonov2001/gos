import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class RequestValidator {
    private createSchema = Joi.object({
        type: Joi.string().valid('category', 'unit', 'warehouse', 'branch').required(),
        name: Joi.string().required(),
        description: Joi.string().required(),
        sup_type_id: Joi.string(),
        section_id: Joi.string().when('type', {
            is: 'unit',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
