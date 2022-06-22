import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ApplicationStateValidator {
    private updateSchema = Joi.object({
        status: Joi.string()
            .valid(
                'approved',
                'accepted',
                'disapproved',
                'on_discussion',
                'canceled',
                'discussion_ended',
                'ask_sent',
                'marketing'
            )
            .required(),
        text: Joi.string().when('status', {
            is: 'discussion_ended',
            then: Joi.required()
        }),
        member_ids: Joi.array().items(Joi.string().uuid()).when('status', {
            is: 'on_discussion',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        product_ids: Joi.array()
            .items(Joi.string().uuid())
            .when('status', {
                is: Joi.valid('approved', 'ask_sent'),
                then: Joi.optional(),
                otherwise: Joi.forbidden()
            }),
        selected_user: Joi.string()
            .uuid()
            .when('status', {
                is: Joi.valid('approved', 'ask_sent', 'marketing'),
                then: Joi.optional(),
                otherwise: Joi.forbidden()
            }),
        date: Joi.object({
            from: Joi.string().isoDate().required(),
            till: Joi.string().isoDate().required()
        }).when('status', {
            is: 'marketing',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        })
    })

    private addMember = Joi.object({
        user_id: Joi.string().uuid().required()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let { member_ids, product_ids } = req.body

        if (member_ids) {
            req.body.member_ids = JSON.parse(member_ids)
        }

        if (product_ids) {
            req.body.product_ids = JSON.parse(product_ids)
        }
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    changeSelectedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.addMember.validate(req.body)
        if (error) return next(error)
        next()
    })
}
