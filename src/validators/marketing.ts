import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class MarketingValidator {
    private updateSchema = Joi.object({
        status: Joi.string().valid('sent', 'disapproved', 'canceled', 'remarketing').default(null),
        offer_price: Joi.number().when('status', {
            is: 'sent',
            then: Joi.optional()
        }),
        trading_platform: Joi.string()
            .valid('cooperuz', 'tender', 'tanlov', 'direct', 'auction', 'emagazin')
            .when('status', {
                is: 'sent',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
        selected_user: Joi.string().uuid().when('status', {
            is: 'sent',
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        }),
        text: Joi.string().when('status', {
            is: Joi.valid('sent', 'canceled', 'disapproved'),
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
