import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import { IRequirement } from '../models/Requirement'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export class RequirementController {
    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { share } = req.body
        const purchase = await storage.purchase.findOne({
            _id: req.params.id,
            requirement_adder: id,
            status: '01'
        })

        const totalShare = (purchase.requirements as IRequirement[]).reduce((share, cur) => {
            return share + cur.share
        }, share)

        if (totalShare > 100) {
            return next(new AppError(400, 'requirement_create_400'))
        }

        const requirement = await storage.requirement.create({ ...req.body, purchase: purchase.id })

        purchase.requirements.push(requirement.id)
        await purchase.save()

        res.status(201).json({
            success: true,
            data: {
                requirement,
                message: message('requirement_create_201', lang)
            }
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { id: _id, req_id } = req.params
        const purchase = await storage.purchase.findOne({
            _id,
            requirement_adder: id,
            status: '01'
        })

        await storage.requirement.delete({ _id: req_id, purchase: _id })

        const requirement = (purchase.requirements as IRequirement[]).find(
            (one) => one.id === req_id
        )

        purchase.requirements.splice(
            (purchase.requirements as IRequirement[]).indexOf(requirement as IRequirement),
            1
        )
        await purchase.save()

        res.status(200).json({
            success: true,
            data: null,
            message: message('requirement_delete_200', lang)
        })
    })
}
