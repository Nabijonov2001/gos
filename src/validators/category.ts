import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class CategoryValidator {
    private createSchema = Joi.object({
        name: Joi.string().required(),
        sections: Joi.array()
            .items({
                name: Joi.string().required()
            })
            .max(4)
            .required(),
        type_id: Joi.string().uuid().required()
    })

    private updateSchema = Joi.object({
        name: Joi.string(),
        sections: Joi.array()
            .items({
                name: Joi.string().required()
            })
            .max(4)
    }).required()

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
