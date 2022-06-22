import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import catchAsync from '../utils/catchAsync'

export class PurchaseValidator {
    private updateSchema = Joi.object({
        status: Joi.string()
            .valid('01', '11', '12', '21', '31', '41', '51', '52', 'remarketing', 'canceled')
            .required(),
        text: Joi.string().when('status', {
            is: Joi.valid('01', '12', '21', '52', 'remarketing', 'canceled'),
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        selected_user: Joi.string()
            .when('status', {
                is: Joi.valid('21', '31'),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            })
            .when('method', {
                is: Joi.exist(),
                then: Joi.required()
            }),
        date: Joi.object({
            from: Joi.string().isoDate().required(),
            till: Joi.string().isoDate().required()
        }).when('status', {
            is: '31',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        method: Joi.string()
            .valid('tender', 'tanlov', 'cooperuz', 'emagazin', 'auction', 'direct')
            .when('status', {
                is: '01',
                then: Joi.optional(),
                otherwise: Joi.forbidden()
            })
    })

    private changeUserSchema = Joi.object({
        user_id: Joi.string().uuid().required(),
        text: Joi.string(),
        date: Joi.object({
            from: Joi.string().isoDate().required(),
            till: Joi.string().isoDate().required()
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.date) {
            req.body.date = JSON.parse(req.body.date)
        }
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    changeSelectedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.changeUserSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
