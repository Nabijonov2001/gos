import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class BidderValidator {
    private createSchema = Joi.object({
        requirement_operation: Joi.array()
            .items(
                Joi.object({
                    requirement: Joi.string().required(),
                    basis_name: Joi.string(),
                    file: Joi.object({
                        original_name: Joi.string(),
                        unique_name: Joi.string()
                    }).when('basis_name', {
                        is: Joi.exist(),
                        then: Joi.optional(),
                        otherwise: Joi.required()
                    })
                }).required()
            )
            .required(),
        main_docs: Joi.array()
            .items({
                original_name: Joi.string().required(),
                unique_name: Joi.string().required()
            })
            .required()
    })
    private updateSchema = Joi.object({
        bidder_scores: Joi.array().items({
            bidder_id: Joi.string().uuid().required(),
            scoresAndReq: Joi.array()
                .items({
                    requirement_id: Joi.string().uuid().required(),
                    score: Joi.number().required()
                })
                .required()
        })
    })
    private commissionSchema = Joi.object({
        commission_scores: Joi.array().items({
            bidder_id: Joi.string().uuid().required(),
            commissionAndReq: Joi.array()
                .items({
                    requirement_id: Joi.string().uuid().required(),
                    commission: Joi.object({
                        score: Joi.number().required(),
                        description: Joi.string()
                    })
                })
                .required()
        })
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

    commission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.commissionSchema.validate(req.body)
        if (error) return next(error)
        next()
    })
}
