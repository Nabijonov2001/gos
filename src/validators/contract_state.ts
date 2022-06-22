import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ContractStateValidator {
    private updateSchema = Joi.object({
        status: Joi.valid('02', '12', '13', '22', '23'),
        signatory: Joi.string().valid('user5', 'user11'),
        signatory_id: Joi.when('signatory', {
            is: 'user5',
            then: Joi.string().uuid().required(),
            otherwise: Joi.forbidden()
        }),
        selected_user: Joi.string().uuid(),
        payment_amount: Joi.number(),
        payment_date: Joi.string().isoDate(),
        description: Joi.string(),
        paid_date: Joi.string().isoDate(),
        payment_statement_num: Joi.number(),
        oneCCode: Joi.string()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.updateSchema.validate(req.body)
        if (error || !req.body.length) return next(error)

        next()
    })
}
