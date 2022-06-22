import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ApplicationValidator {
    private createSchema = Joi.object({
        description: Joi.string().max(200).required(),
        product_name: Joi.string().max(50).required(),
        category_id: Joi.string().uuid().required(),
        unit_ids: Joi.array().items(Joi.string().uuid().required()).min(1).max(4).required(),
        measure_unit: Joi.string().required(),
        quantity: Joi.number().integer().required()
    })

    private updateSchema = Joi.object({
        description: Joi.string().max(200),
        product_name: Joi.string().max(50),
        category_id: Joi.string().uuid().when('unit_ids', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        unit_ids: Joi.array().items(Joi.string().uuid()).min(1).max(4),
        measure_unit: Joi.string(),
        quantity: Joi.number().integer(),
        status: Joi.string().valid('sent'),
        removed_files: Joi.array().items(Joi.string().required())
    })

    private resendSchema = Joi.object({
        application_id: Joi.string().uuid().required(),
        description: Joi.string().max(200).required(),
        product_name: Joi.string().max(50).required(),
        category_id: Joi.string()
            .uuid()
            .when('unit_ids', {
                is: Joi.exist(),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            })
            .required(),
        unit_ids: Joi.array().items(Joi.string().uuid()).min(1).max(4).required(),
        measure_unit: Joi.string().required(),
        quantity: Joi.number().integer().required(),
        status: Joi.string().valid('sent').required(),
        removed_files: Joi.array().items(Joi.string().required())
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let { unit_ids } = req.body
        if (unit_ids) {
            req.body.unit_ids = JSON.parse(unit_ids)
        }
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let { unit_ids, removed_files } = req.body

        if (unit_ids) {
            req.body.unit_ids = JSON.parse(unit_ids)
        }

        if (removed_files) {
            req.body.removed_files = JSON.parse(removed_files)
        }

        const { error } = this.updateSchema.validate(req.body)
        if (error || !req.body.length) return next(error)

        next()
    })

    resend = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let { unit_ids, removed_files } = req.body

        if (unit_ids) {
            req.body.unit_ids = JSON.parse(unit_ids)
        }

        if (removed_files) {
            req.body.removed_files = JSON.parse(removed_files)
        }
        const { error } = this.resendSchema.validate(req.body)
        if (error || !req.body.length) return next(error)

        next()
    })
}
