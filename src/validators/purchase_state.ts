import { NextFunction, Response, Request } from 'express'
import Joi from 'joi'
import catchAsync from '../utils/catchAsync'

export class PurchaseStateValidator {
    private updateSchema = Joi.object({
        status: Joi.string().valid(
            '02',
            '12',
            '22',
            '32',
            '33',
            '41',
            '42',
            '52',
            'end', // bu shunchaki platforma tugatish vaqtini kiritish uchun qo`shilgan status
            'contract'
        ),
        main_requirement: Joi.string().valid('score', 'price').when('status', {
            is: '02',
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        }),
        min_score: Joi.number().min(0),
        price_share: Joi.number().min(0).when('main_requirement', {
            is: 'score',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        technical_share: Joi.number().min(0).when('main_requirement', {
            is: 'score',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        response_status: Joi.string()
            .valid('approved', 'disapproved')
            .when('status', {
                is: Joi.valid('12', '22'),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
        text: Joi.string(),
        platform_url: Joi.string().when('status', {
            is: '33',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        platform_date: Joi.object({
            from: Joi.string().isoDate().required(),
            till: Joi.string().isoDate().required()
        }).when('status', {
            is: '33',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        ended_date: Joi.string().isoDate().when('status', {
            is: 'end',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { platform_date } = req.body
        if (platform_date) {
            req.body.platform_date = JSON.parse(platform_date)
        }
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
