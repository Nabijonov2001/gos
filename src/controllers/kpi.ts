import { NextFunction, Request } from 'express'
import { message } from '../locales/get_message'
import catchAsync from '../utils/catchAsync'
import { ResponseWithUser } from '../types/types'
import { storage } from '../storage/main'

export class KpiController {
    getOne = catchAsync(async (req: Request, res: ResponseWithUser, next: NextFunction) => {
        const { lang } = res.locals
        const {type, fromDate, toDate } = req.query
        const users=await storage.user.find({type})

        res.status(200).json({
            success: true,
            data: users,
            message: message('purchase_getOne_200', lang)
        })
    })

}
