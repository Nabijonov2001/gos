import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import ApplicationState from '../models/ApplicationState'
import ContractState from '../models/ContractState'
import Marketing from '../models/Marketing'
import Purchase from '../models/Purchase'
import PurchaseState from '../models/PurchaseState'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'

export class NotificationController {
    get = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, type } = res.locals

        let application_count = 0
        if (type === 'user2' || type === 'user3') {
            application_count = await ApplicationState.countDocuments({
                user_type: type,
                is_new: true
            })
        } else if (type === 'user4' || type === 'user5') {
            application_count = await ApplicationState.countDocuments({
                user_type: type,
                selected_user: id,
                is_new: true
            })
        }

        let marketing_count = 0
        if (type === 'user2') {
            marketing_count = await Marketing.countDocuments({
                market_researcher: id,
                is_new: true
            })
        } else if (type === 'user3') {
            marketing_count = await Marketing.countDocuments({ user: id, is_new: true })
        }

        let purchase_count = 0
        if (type === 'user3') {
            purchase_count = await Purchase.countDocuments({ user: id, is_new: true })
        } else {
            purchase_count = await PurchaseState.countDocuments({ user: id, is_new: true })
        }

        const contract_count = await ContractState.countDocuments({ user: id, is_new: true })

        res.status(200).json({
            success: true,
            data: {
                application_count,
                marketing_count,
                purchase_count,
                contract_count
            },
            message: message('notification_getOne_200', lang)
        })
    })
}
