import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'

export class CategoryController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const categories = await storage.category.find(req.query)
        const type = await storage.type.findOne({ _id: req.query.type })

        res.status(200).json({
            success: true,
            data: {
                type,
                categories
            },
            message: message('category_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const _id = req.params.id

        const category = await storage.category.findOne({ _id })
        const sections = await storage.section.find({ category: _id })
        const units = await storage.unit.find({ section: sections[0].id })

        res.status(200).json({
            success: true,
            data: {
                category,
                sections,
                units
            },
            message: message('category_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { sections, type_id } = req.body
        const type = await storage.type.findOne({ _id: type_id })

        const prev_category = (await storage.category.find({ type: type.id }, 'last'))[0]
        let cipher_code = '01'

        if (prev_category) {
            cipher_code = (Number(prev_category.cipher_code) + 1).toString().padStart(2, '0')
        }

        const category = await storage.category.create({ ...req.body, type: type.id, cipher_code })

        for (let i = 0; i < sections.length; i++) {
            sections[i].category = category.id
            sections[i].order = i + 1
        }

        await storage.section.createMany(sections)

        res.status(201).json({
            success: true,
            data: {
                category
            },
            message: message('category_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { sections } = req.body

        let category = await storage.category.findOne({ _id: req.params.id }),
            db_sections

        if (sections) {
            db_sections = await storage.section.find({ category: category.id })
            const length = db_sections.length

            if (length > sections.length) {
                const deleted_count = length - sections.length

                for (let i = 0; i < deleted_count; i++) {
                    const section = await storage.section.delete({
                        _id: db_sections[length - i - 1].id
                    })
                    await storage.unit.deleteMany({ section: section._id })
                }

                const products = await storage.product.find({ category: category.id })

                for (const product of products) {
                    product.units.splice(product.units.length - deleted_count)
                    let delete_index: number

                    if (deleted_count === 3) {
                        delete_index = 6
                    } else if (deleted_count === 2) {
                        delete_index = 8
                    } else {
                        delete_index = 10
                    }

                    product.cipher_code =
                        product.cipher_code.slice(0, delete_index) +
                        '00'.repeat(deleted_count) +
                        product.cipher_code.slice(12)

                    await product.save()
                }
            } else if (length < sections.length) {
                let new_sections = sections.splice(length, sections.length - length)

                for (let i = 0; i < new_sections.length; i++) {
                    new_sections[i].order = db_sections[length - 1].order + 1 + i
                    new_sections[i].category = category.id
                }

                await storage.section.createMany(new_sections)
            }

            for (let i = 0; i < sections.length; i++) {
                if (db_sections[i].name !== sections[i].name) {
                    db_sections[i].name = sections[i].name
                    db_sections[i] = await db_sections[i].save()
                }
            }
        }

        category = await storage.category.update({ _id: category.id }, req.body)
        db_sections = await storage.section.find({ category: category.id })

        res.status(200).json({
            success: true,
            data: {
                category,
                sections: db_sections
            },
            message: message('category_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { id } = req.params

        const products = await storage.product.find({ category: id })

        if (products.length) {
            return next(new AppError(403, 'category_403'))
        }

        await storage.category.delete({ _id: id })
        await storage.section.deleteMany({ category: id })
        await storage.unit.deleteMany({ category: id })

        res.status(200).json({
            success: true,
            message: message('category_delete_200', lang)
        })
    })
}
