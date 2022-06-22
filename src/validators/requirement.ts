import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class RequirementValidator {
    createSchema = Joi.object({
        name: Joi.string().required(),
        score: Joi.number().required(),
        share: Joi.number().required()
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
