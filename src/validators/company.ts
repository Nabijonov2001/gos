import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class CompanyValidator {
    private createSchema = Joi.object({
        company_name: Joi.string().required(),
        company_address: Joi.string().required(),
        company_director: Joi.string().required(),
        bank_name: Joi.string().required(),
        bank_address: Joi.string().required(),
        bank_account: Joi.string().required(),
        bank_mfo: Joi.string().required(),
        bank_inn: Joi.string().required(),
        bank_okro: Joi.string().required()
    })

    private updateSchema = Joi.object({
        company_name: Joi.string(),
        company_address: Joi.string(),
        company_director: Joi.string(),
        bank_name: Joi.string(),
        bank_address: Joi.string(),
        bank_account: Joi.string(),
        bank_mfo: Joi.string(),
        bank_inn: Joi.string(),
        bank_okro: Joi.string(),
        removed_files: Joi.array().items(Joi.string())
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.removed_files) {
            req.body.removed_files = JSON.parse(req.body.removed_files)
        }
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
