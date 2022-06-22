import { NextFunction, query, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { unlink } from 'fs/promises'
import path from 'path'
import AppError from '../utils/appError'
import { IPurchase } from '../models/Purchase'

export class BidderController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals
        const { id: purchase_id } = req.params

        const bidders = await storage.bidder.find({ purchase: purchase_id })

        res.status(200).json({
            success: true,
            data: {
                bidders
            },
            message: message('bidder_find_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { requirement_operation } = req.body

        const purchase = await storage.purchase.findOne({ _id: req.params.id, operator: id })
        const purchase_state = await storage.purchase_state.findOne({
            purchase: purchase.id,
            user: id
        })
        const requirements = await storage.requirement.find({ purchase: purchase.id })

        if (
            purchase.status !== '31' ||
            purchase_state.status !== '34' ||
            requirements.length !== requirement_operation.length
        ) {
            return next(new AppError(400, 'bidder_create_400'))
        }

        for (const item of requirement_operation) {
            await storage.requirement.findOne({ _id: item.requirement, purchase: purchase.id })
        }

        const bidder = await storage.bidder.create({ ...req.body, purchase: req.params.id })

        res.status(201).json({
            success: true,
            data: {
                bidder
            },
            message: message('bidder_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { bidder_scores } = req.body
        const { id: purchase_id } = req.params

        const purchase_state = await storage.purchase_state.findOne({
            purchase: purchase_id,
            user_type: 'user4',
            status: '41'
        })
        const purchase = purchase_state.purchase as IPurchase

        if (purchase.status !== '41') {
            return next(new AppError(400, 'bidder_update_400'))
        }
        const promise = bidder_scores?.map(async (item: any) => {
            await item?.scoresAndReq?.forEach(async (scores: any) => {
                await storage.bidder.update(
                    {
                        _id: item?.bidder_id,
                        'requirement_operation.requirement': scores?.requirement_id
                    },
                    {
                        $set: {
                            'requirement_operation.$.score': scores.score
                        }
                    }
                )
            })
        })
        await Promise.all(promise)
        purchase_state.status = '42'
        purchase_state.is_new = true
        purchase.status = '42'
        purchase.is_new = true
        await purchase_state.save()
        await purchase.save()

        const bidders = await storage.bidder.find({ purchase: purchase_id })

        res.status(200).json({
            success: true,
            data: {
                bidders
            },
            message: message('bidder_update_200', lang)
        })
    })

    commission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { commission_scores } = req.body
        const { id: purchase_id, commission_id } = req.params

        await storage.commission.findOne({ user: id, is_commission: true })

        const purchase_state = await storage.purchase_state.findOne({
            purchase: purchase_id,
            user_type: role,
            status: '51'
        })

        const purchase = purchase_state.purchase as IPurchase
        if (purchase.status !== '51') {
            return next(new AppError(400, 'bidder_update_400'))
        }
        const promise = commission_scores?.map(async (item: any) => {
            await item?.commissionAndReq?.forEach(async (commission: any) => {
                await storage.bidder.update(
                    {
                        _id: item?.bidder_id,
                        'requirement_operation.requirement': commission?.requirement_id
                    },
                    {
                        $push: {
                            'requirement_operation.$.commissions': {
                                id: commission_id,
                                ...commission.commission
                            }
                        }
                    }
                )
            })
        })
        await Promise.all(promise)
        const updated = await storage.bidder.find({ purchase: purchase_id })
        purchase_state.status = '52'
        await purchase_state.save()

        res.status(200).json({
            success: true,
            updated,
            message: message('bidder_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { id: _id, bidder_id } = req.params

        const purchase = await storage.purchase.findOne({ _id, operator: id })

        if (purchase.status !== '31') {
            return next(new AppError(403, 'bidder_delete_403'))
        }

        const bidder = await storage.bidder.delete({ _id: bidder_id, purchase: purchase.id })

        for (const main_doc of bidder.main_docs) {
            await unlink(path.join(__dirname, '../../../uploads', main_doc.unique_name))
        }

        for (const item of bidder.requirement_operation) {
            if (item.file) {
                await unlink(path.join(__dirname, '../../../uploads', item.file.unique_name))
            }
        }

        res.status(200).json({
            success: true,
            message: message('bidder_delete_200', lang)
        })
    })
}
