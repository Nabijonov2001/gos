import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class UserValidator {
    private loginSchema = Joi.object({
        user_name: Joi.string().required(),
        password: Joi.string().required()
    })

    private createSchema = Joi.object({
        full_name: Joi.string().required(),
        user_name: Joi.string().required(),
        phone_number: Joi.number().integer().required(),
        password: Joi.string().required(),
        position: Joi.string().required(),
        branch_ids: Joi.array()
            .items(Joi.string().uuid())
            .when('type', {
                is: Joi.valid('user1', 'user11'),
                then: Joi.array().length(1)
            })
            .when('type', {
                is: 'admin',
                then: Joi.forbidden(),
                otherwise: Joi.required()
            }),
        type: Joi.string()
            .valid(
                'admin',
                'user1',
                'user2',
                'user3',
                'user4',
                'user5',
                'user8',
                'user9',
                'user11',
                'user12',
                'user16'
            )
            .required(),
        is_commission_member: Joi.boolean()
    })

    private updateSchema = Joi.object({
        full_name: Joi.string(),
        user_name: Joi.string(),
        phone_number: Joi.number().integer(),
        position: Joi.string(),
        type: Joi.string().valid(
            'admin',
            'user1',
            'user2',
            'user3',
            'user4',
            'user5',
            'user8',
            'user9',
            'user11',
            'user12',
            'user16'
        ),
        branch_ids: Joi.array().when('type', {
            is: Joi.valid('user1', 'user11'),
            then: Joi.array().length(1).items(Joi.string().uuid()),
            otherwise: Joi.array().items(Joi.string().uuid())
        }),
        old_password: Joi.string().min(5).max(10),
        new_password: Joi.string().min(5).max(10),
        status: Joi.string().valid('active', 'inactive', 'blocked')
    })

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.loginSchema.validate(req.body)
        if (error) return next(error)

        next()
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
