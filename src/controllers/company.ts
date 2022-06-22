import { NextFunction, Request, Response } from 'express'
import { logger } from '../config/logger'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { unlink } from 'fs/promises'
import { message } from '../locales/get_message'
import { Upload } from '../helpers/upload'
import Company, { ICompany } from '../models/Company'

export class CompanyController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, type, lang } = res.locals

        const companies = await storage.company.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                companies
            },
            message: message('company_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, type, lang } = res.locals

        const company = await storage.company.findOne(req.query)

        res.status(200).json({
            success: true,
            data: {
                company
            }
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, type, lang } = res.locals
        const isNewCompany = await storage.company.find({ company_name: req.body.company_name })
        if (isNewCompany.length) {
            return next(new AppError(400, 'This company exists!'))
        }
        if (type !== 'super_admin') {
            return next(new AppError(400, 'company_update_400'))
        }

        // file uploading
        const doc_files = req.files as Express.Multer.File[]
        if (!doc_files.length) {
            return next(new AppError(400, 'files must be upload'))
        }

        req.body.files = await Upload.uploadFiles(doc_files)

        const company = await storage.company.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                company
            }
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, type, lang } = res.locals
        const { removed_files } = req.body

        if (type !== 'super_admin') {
            return next(new AppError(400, 'company_update_400'))
        }

        let company = await storage.company.findOne({ _id: req.params.id })

        const doc_files = req.files as Express.Multer.File[]
        req.body.files = []

        if (doc_files?.length) {
            req.body.files = await Upload.uploadFiles(doc_files)
        }

        if (removed_files?.length) {
            for (const removed_file of removed_files) {
                await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))
                company.files = company.files.filter((el: any) => el.unique_name !== removed_file)
            }
        }

        req.body.files = company.files.concat(req.body.files)

        company = await storage.company.update({ _id: req.params.id }, {
            ...req.body
        } as ICompany)

        res.status(200).json({
            success: true,
            data: {
                company
            }
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, lang } = res.locals

        const company = await storage.company.delete({ _id: req.params.id })

        if (company.files?.length) {
            for (const file of company.files) {
                await unlink(path.join(__dirname, '../../../uploads', file.unique_name))
            }
        }

        res.status(200).json({
            success: true,
            data: null
        })
    })
}
