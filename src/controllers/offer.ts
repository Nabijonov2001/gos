import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import path from 'path'
import { writeFile, unlink } from 'fs/promises'
import User from '../models/User'
import { Upload } from '../helpers/upload'

export class OfferController {
    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role, id, lang } = res.locals
        const { marketing_id } = req.body

        await storage.user.findOne({ _id: id, status: 'active' })

        if (!req.file) {
            return next(new AppError(400, 'offer_400'))
        }

        const marketing = await storage.marketing.findOne({ _id: marketing_id })

        // if (
        //     !['received', 'remarketing'].includes(marketing.research_status) ||
        //     marketing.status !== 'marketing_ended'
        // ) {
        //     return next(new AppError(400, 'offer_data'))
        // }

        req.body.file = await Upload.uploadFile(req.file)

        const offer = await storage.offer.create({ ...req.body, marketing: marketing_id })

        marketing.offers.push(offer.id)
        await marketing.save()

        res.status(201).json({
            success: true,
            data: {
                offer
            },
            message: 'Offer has been successfully created'
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const offer = await storage.offer.delete({ _id: req.params.id })

        const marketing = (await storage.marketing.find({ _id: offer.marketing }))[0]

        await unlink(path.join(__dirname, '../../../uploads', `${offer.file.unique_name}`))
        marketing.offers.splice(marketing.offers.indexOf(offer.id), 1)
        await marketing.save()

        res.status(200).json({
            success: true,
            message: 'Offer has been successfully deleted'
        })
    })
}
