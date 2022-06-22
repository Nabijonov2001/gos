import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IUnit } from '../models/Unit'

export class UnitController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const units = await storage.unit.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                units
            },
            message: message('unit_getAll_200', lang)
        })
    })

    getSubUnits = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const units = await storage.unit.find({ sup_unit: req.params.id })

        res.status(200).json({
            success: true,
            data: {
                units
            },
            message: message('unit_getOne_200', lang)
        })
    })

    getSupUnits = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const sup_units = JSON.parse(req.query.sup_units as string)
        const units = []
        const category = await storage.category.findOne({ _id: req.params.id })
        const sections = await storage.section.find({ category: category.id })

        for (let i = 0; i < sup_units.length; i++) {
            const db_unit = await storage.unit.findOne({ _id: sup_units[i] })
            let db_units

            if (i === 0) {
                db_units = await storage.unit.find({ section: db_unit.section })
            } else {
                db_units = await storage.unit.find({
                    section: db_unit.section,
                    sup_unit: db_unit.sup_unit
                })
            }

            units.push(db_units)

            if (i + 1 === sup_units.length) {
                db_units = await storage.unit.find({ sup_unit: db_unit.id })
                units.push(db_units)
            }
        }

        res.status(200).json({
            success: true,
            data: {
                category,
                sections,
                units
            },
            message: message('unit_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { section_id, sup_unit_id } = req.body
        let sup_unit

        const section = await storage.section.findOne({ _id: section_id })

        if ((section.order !== 1 && !sup_unit_id) || (section.order === 1 && sup_unit_id)) {
            return next(new AppError(400, 'unit_400'))
        }

        if (sup_unit_id) {
            sup_unit = await storage.unit.findOne({ _id: sup_unit_id })
            const sup_section = await storage.section.findOne({ _id: sup_unit.section })

            if (sup_section.order + 1 !== section.order) {
                return next(new AppError(400, 'unit_400'))
            }
        }

        const prev_unit = (await storage.unit.find({ section: section_id }, 'last'))[0]
        let cipher_code = section.order === 1 ? '001' : '01'

        if (prev_unit) {
            cipher_code = (Number(prev_unit.cipher_code) + 1)
                .toString()
                .padStart(section.order === 1 ? 3 : 2, '0')
        }

        const unit = await storage.unit.create({
            ...req.body,
            category: section.category,
            section: section_id,
            cipher_code,
            sup_unit: sup_unit_id
        })

        res.status(200).json({
            success: true,
            data: {
                unit
            },
            message: message('unit_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const unit = await storage.unit.update({ _id: req.params.id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                unit
            },
            message: message('unit_update_200', lang)
        })
    })

    approve = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals

        await storage.unit.updateMany({ category: req.params.id, status: 'inactive' }, {
            status: 'active'
        } as IUnit)

        res.status(200).json({
            success: true,
            message: message('unit_approve_200', lang)
        })
    })

    disapprove = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        await storage.unit.deleteMany({ category: req.params.id, status: 'inactive' })

        res.status(200).json({
            success: true,
            message: message('unit_delete_200', lang)
        })
    })
}
