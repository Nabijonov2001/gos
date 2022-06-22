import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { IUser } from '../models/User'

export class ChatController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const chats = await storage.chat.find({ request: req.params.id })

        res.status(200).json({
            success: true,
            data: {
                chats
            },
            message: message('chat_getAll_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { id: request_id } = req.params

        const request = await storage.request.findOne({ _id: request_id })
        const chat = await storage.chat.create({
            ...req.body,
            user: id,
            request: request_id
        })

        if ((request.user as IUser).id !== id) {
            await storage.notification.update(
                { user: (request.user as IUser).id },
                { $inc: { request_count: 1 } }
            )
        } else {
            await storage.notification.update({ user: id }, { $inc: { count: 1 } })
        }

        res.status(201).json({
            success: true,
            data: {
                chat
            },
            message: message('chat_create_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        await storage.chat.deleteMany({ request: req.params.id })

        res.status(200).json({
            success: true,
            message: message('chat_delete_200', lang)
        })
    })
}
