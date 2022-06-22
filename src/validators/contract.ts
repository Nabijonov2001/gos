import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ContractValidator {
    private updateSchema = Joi.object({
        status: Joi.valid('02'),
        removed_files: Joi.array().items(Joi.string()),
        contract_number: Joi.number().required(),
        signed_date: Joi.string().required(),
        product_name: Joi.string().required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        measure_unit: Joi.string().required(),
        total_price: Joi.number().required(),
        company: Joi.string().uuid().required(),
        initial_payment: Joi.number().required(),
        final_payment: Joi.number().required(),
        delivery_date: Joi.string().isoDate().required(),
        shipping_address: Joi.string().required()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.removed_files) {
            req.body.removed_files = JSON.parse(req.body.removed_files)
        }
        const { error } = this.updateSchema.validate(req.body)
        if (error || !req.body.length) return next(error)

        next()
    })
}
