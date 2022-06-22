import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class IndicatorValidator {
    private createSchema = Joi.object({
        requirement_id: Joi.string().required(),
        basis: Joi.string()
    })

    private updateSchema = Joi.object({
        score: Joi.number().when('commission', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.required()
        }),
        commission: Joi.object({
            score: Joi.number().required(),
            description: Joi.string().trim().required()
        })
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
