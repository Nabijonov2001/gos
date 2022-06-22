import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'

export class ResponseController {
    // getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //     const { lang, role } = res.locals
    //     const application = await storage.application.findOne({ _id: req.params.id })
    //     let responses

    //     switch (role) {
    //         case 'user1': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 user_type: 'user2',
    //                 status: 'disapproved'
    //             })
    //             break
    //         }

    //         case 'user2': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 $or: [
    //                     {
    //                         user_type: 'user3',
    //                         status: 'disapproved'
    //                     },
    //                     {
    //                         user_type: 'user2'
    //                     }
    //                 ]
    //             })
    //             break
    //         }

    //         case 'user3': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 user_type: { $in: ['user3', 'user4', 'user11', 'user5'] }
    //             })
    //             break
    //         }

    //         case 'user4': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 $or: [
    //                     {
    //                         user_type: 'user3',
    //                         status: 'approved'
    //                     },
    //                     {
    //                         user_type: 'user4'
    //                     }
    //                 ]
    //             })
    //             break
    //         }

    //         case 'user5': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 $or: [
    //                     {
    //                         user_type: 'user3',
    //                         status: 'approved'
    //                     },
    //                     {
    //                         user_type: { $in: ['user4', 'user5', 'user11'] }
    //                     }
    //                 ]
    //             })
    //             break
    //         }

    //         case 'user11': {
    //             responses = await storage.response.find({
    //                 application: application.id,
    //                 $or: [
    //                     {
    //                         user_type: 'user3',
    //                         status: 'ask_sent'
    //                     },
    //                     {
    //                         user_type: 'user11'
    //                     }
    //                 ]
    //             })
    //             break
    //         }
    //     }

    //     res.status(200).json({
    //         success: true,
    //         data: {
    //             responses
    //         },
    //         message: message('response_getOne_200', lang)
    //     })
    // })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        await storage.response.delete({ _id: req.params.application_id, user: id })

        res.status(200).json({
            success: true,
            message: message('response_delete_200', lang)
        })
    })
}
