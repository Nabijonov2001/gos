import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import AppError from '../utils/appError'

export class RequestController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let requests

        if (role === 'user1') {
            requests = await storage.request.find({ user: id, ...req.query })
        } else {
            requests = await storage.request.find(req.query)
        }

        await storage.notification.update({ user: id }, { $set: { request_count: 0 } })

        res.status(200).json({
            success: true,
            data: {
                requests
            },
            message: message('request_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const request = await storage.request.findOne({ _id: req.params.id })
        let units: string[] = [],
            branch,
            category
        const chat = await storage.chat.find({ request: request.id })

        if (request.type === 'unit') {
            const section = await storage.section.findOne({ _id: request.section })
            category = await storage.category.findOne({ _id: section.category })

            if (request.sup_type) {
                let unit = await storage.unit.findOne({ _id: request.sup_type })
                units.unshift(unit.id)

                if (unit.sup_unit) {
                    unit = await storage.unit.findOne({ _id: unit.sup_unit })
                    units.unshift(unit.id)

                    if (unit.sup_unit) {
                        unit = await storage.unit.findOne({ _id: unit.sup_unit })
                        units.unshift(unit.id)
                    }
                }
            }
        } else if (request.type === 'warehouse') {
            branch = (await storage.branch.findOne({ _id: request.sup_type })).id
        }

        res.status(200).json({
            success: true,
            data: {
                request,
                chat,
                units,
                branch,
                category
            },
            message: message('request_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { type, sup_type_id, section_id } = req.body

        if (type === 'unit') {
            const section = await storage.section.findOne({
                _id: section_id
            })

            if (sup_type_id) {
                const sup_unit = await storage.unit.findOne({
                    _id: sup_type_id,
                    category: section.category
                })
                const sup_section = await storage.section.findOne({
                    _id: sup_unit.section
                })

                if (sup_section.order + 1 !== section.order) {
                    return next(new AppError(400, 'request_create_400'))
                }

                req.body.sup_type = sup_type_id
            }

            req.body.section = section_id
        } else if (type === 'warehouse') {
            const branch = await storage.branch.findOne({ _id: sup_type_id })

            req.body.sup_type = branch.id
        }

        const request = await storage.request.create({ user: id, ...req.body })

        await storage.notification.update({ user_type: 'admin' }, { $inc: { request_count: 1 } })

        res.status(201).json({
            success: true,
            data: {
                request
            },
            message: message('request_create_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const _id = req.params.id

        await storage.request.delete({ _id })
        await storage.chat.deleteMany({ request: _id })

        res.status(200).json({
            success: true,
            message: message('request_delete_200', lang)
        })
    })
}
