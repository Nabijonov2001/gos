import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import path from 'path'
import { unlink } from 'fs/promises'
import { message } from '../locales/get_message'
import { IApplicationState } from '../models/ApplicationState'
import { ISection } from '../models/Section'
import { IUnit } from '../models/Unit'
import { Upload } from '../helpers/upload'
import AppError from '../utils/appError'

export class ApplicationController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const applications = await storage.application.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                applications
            },
            message: message('application_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const types = await storage.type.find({})
        const application = await storage.application.findOne({ _id: req.params.id })
        const categories = await storage.category.find({ type: application.type })
        let units = []

        const sections = application.sections as ISection[],
            application_units = application.units as IUnit[]

        for (let i = 0; i < sections.length; i++) {
            let db_units
            if (i === 0) {
                db_units = await storage.unit.find({ section: sections[i].id }, 'only_name')
            } else {
                db_units = await storage.unit.find(
                    { section: sections[i].id, sup_unit: application_units[i - 1].id },
                    'only_name'
                )
            }

            units.push(db_units)
        }

        const responses = await storage.response.find({ type_id: application.id })

        res.status(200).json({
            success: true,
            data: {
                application,
                types,
                categories,
                units,
                responses
            },
            message: message('application_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { category_id, unit_ids } = req.body

        let category = await storage.category.findOne({ _id: category_id })
        const type = await storage.type.findOne({ _id: category.type })

        req.body.type = category.type
        req.body.user = id

        let application = (await storage.application.find({}))[0]

        if (application) {
            req.body.application_code = application.application_code + 1
        } else {
            req.body.application_code = 100000
        }

        req.body.cipher_code = type.cipher_code
        req.body.cipher_code += category.cipher_code
        req.body.category = category_id
        req.body.sections = []

        const sections = await storage.section.find({ category: category.id })

        for (let i = 0; i < unit_ids.length; i++) {
            const unit = await storage.unit.findOne({
                _id: unit_ids[i],
                section: sections[i].id
            })
            req.body.sections.push(sections[i].id)
            req.body.cipher_code += unit.cipher_code
        }

        req.body.units = unit_ids
        req.body.cipher_code += '00'.repeat(6 - unit_ids.length)

        // file uploading
        const doc_files = req.files as Express.Multer.File[]
        if (!doc_files.length) {
            return next(new AppError(400, 'files must be upload'))
        }
        req.body.files = await Upload.uploadFiles(doc_files)

        application = await storage.application.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                application
            },
            message: message('application_create_201', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { category_id, unit_ids, status, removed_files } = req.body

        let application = await storage.application.findOne({
            _id: req.params.id,
            user: id,
            status: 'not_sent'
        })

        if (category_id) {
            let category = await storage.category.findOne({ _id: category_id })
            const type = await storage.type.findOne({ _id: category.type })

            req.body.type = type.id
            req.body.category = category_id
            req.body.cipher_code = type.cipher_code
            req.body.cipher_code += category.cipher_code

            const sections = await storage.section.find({ category: category.id })
            req.body.sections = []

            for (let i = 0; i < unit_ids.length; i++) {
                const unit = await storage.unit.findOne({
                    _id: unit_ids[i],
                    section: sections[i].id
                })
                req.body.sections.push(sections[i].id)
                req.body.cipher_code += unit.cipher_code
            }

            req.body.units = unit_ids
            req.body.cipher_code += '00'.repeat(6 - unit_ids.length)
        }

        const doc_files = req.files as Express.Multer.File[]
        req.body.files = []

        if (doc_files?.length) {
            req.body.files = await Upload.uploadFiles(doc_files)
        }

        if (removed_files?.length) {
            for (const removed_file of removed_files) {
                await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))
                application.files = application.files.filter(
                    (el: any) => el.unique_name !== removed_file
                )
            }
        }

        req.body.files = application.files.concat(req.body.files)

        if (status) {
            await storage.application_state.create({
                application: application.id,
                user_type: 'user2',
                status: 'received'
            } as IApplicationState)

            req.body.sent_at = Date.now()
        }

        application = await storage.application.update({ _id: req.params.id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                application
            },
            message: message('application_update_200', lang)
        })
    })

    resend = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { application_id, category_id, unit_ids, status, removed_files } = req.body

        let application = await storage.application.findOne({
            _id: application_id,
            user: id,
            status: 'disapproved'
        })

        if (category_id) {
            let category = await storage.category.findOne({ _id: category_id })
            const type = await storage.type.findOne({ _id: category.type })

            req.body.type = type.id
            req.body.category = category_id
            req.body.cipher_code = type.cipher_code
            req.body.cipher_code += category.cipher_code

            const sections = await storage.section.find({ category: category.id })
            req.body.sections = []

            for (let i = 0; i < unit_ids.length; i++) {
                const unit = await storage.unit.findOne({
                    _id: unit_ids[i],
                    section: sections[i].id
                })
                req.body.sections.push(sections[i].id)
                req.body.cipher_code += unit.cipher_code
            }

            req.body.units = unit_ids
            req.body.cipher_code += '00'.repeat(6 - unit_ids.length)
        }

        // last application's application code will increase to 1

        let last_application = (await storage.application.find({}))[0]
        req.body.application_code = last_application.application_code + 1

        const doc_files = req.files as Express.Multer.File[]
        req.body.files = []

        if (doc_files?.length) {
            req.body.files = await Upload.uploadFiles(doc_files)
        }

        if (removed_files?.length) {
            for (const removed_file of removed_files) {
                await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))
                application.files = application.files.filter(
                    (el: any) => el.unique_name !== removed_file
                )
            }
        }

        req.body.files = application.files.concat(req.body.files)
        req.body.status = status
        req.body.sent_at = new Date()

        application = await storage.application.create({ ...req.body, user: id })

        await storage.application_state.create({
            application: application.id,
            user_type: 'user2',
            status: 'received'
        } as IApplicationState)

        res.status(200).json({
            success: true,
            data: {
                application
            },
            message: message('application_create_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const application = await storage.application.delete({ _id: req.params.id })

        if (application.files?.length) {
            for (const file of application.files) {
                await unlink(path.join(__dirname, '../../../uploads', file.unique_name))
            }
        }

        res.status(200).json({
            success: true,
            message: message('application_delete_200', lang)
        })
    })
}
