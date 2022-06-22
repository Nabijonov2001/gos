import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IProduct } from '../models/Product'
import path from 'path'
import { IBranch } from '../models/Branch'
import { ISection } from '../models/Section'
import { IUnit } from '../models/Unit'
import AppError from '../utils/appError'
import xlsx from 'xlsx'
import { IType } from '../models/Type'

export class ProductController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals
        const { page, branch } = req.query
        delete req.query.page
        let products, total_products

        if (role === 'user1' || role === 'user11') {
            const user = await storage.user.findOne({ _id: id })
            products = await storage.product.find({ ...req.query, branch: user.branches[0] })
            total_products = (
                await storage.product.find({ ...req.query, branch: user.branches[0] })
            ).length
        } else {
            products = await storage.product.find(req.query, Number(page))
            total_products = (await storage.product.find(req.query)).length
        }

        res.status(200).json({
            success: true,
            data: {
                products,
                total_products
            },
            message: message('product_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals
        const product_id = req.params.id

        const product = await storage.product.findOne({ _id: product_id })

        if (role.startsWith('user')) {
            const user = await storage.user.find({ _id: id, branches: product.branch })

            if (!user) {
                return next(
                    new AppError(403, 'You are not allowed type_id see products in this branch')
                )
            }
        }

        const categories = await storage.category.find({ type: product.type })
        const branches = await storage.branch.find({})
        const units = []
        let warehouses

        if (product.branch) {
            warehouses = await storage.warehouse.find({ branch: (product.branch as IBranch).id })
        }

        if (product.sections.length) {
            const sections = product.sections as ISection[],
                product_units = product.units as IUnit[]

            for (let i = 0; i < sections.length; i++) {
                let db_units
                if (i === 0) {
                    db_units = await storage.unit.find({ section: sections[i].id }, 'only_name')
                } else {
                    db_units = await storage.unit.find(
                        { section: sections[i].id, sup_unit: product_units[i - 1].id },
                        'only_name'
                    )
                }

                units.push(db_units)
            }
        }

        res.status(200).json({
            success: true,
            data: {
                product,
                categories,
                branches,
                units,
                warehouses
            },
            message: message('product_getOne_200', lang)
        })
    })

    // create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //     const { lang, id } = res.locals
    //     const { category, warehouse: warehouse_id } = req.body

    //     if (category) {
    //         await storage.category.findOne({ _id: category })
    //     }

    //     const product = await storage.product.create({
    //         ...req.body
    //     })

    //     res.status(200).json({
    //         success: true,
    //         data: {
    //             product
    //         },
    //         message: message('product_create_200', lang)
    //     })
    // })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { category_id, unit_ids, warehouse_id } = req.body

        let product = await storage.product.findOne({ _id: req.params.id })
        const category = await storage.category.findOne({ _id: category_id })

        if (product.type !== category.type) {
            return next(new AppError(400, 'product_update_400'))
        }

        product.category = category._id
        product.cipher_code = ''

        const type = await storage.type.findOne({ _id: product.type })

        product.cipher_code += type.cipher_code
        product.cipher_code += category.cipher_code

        const sections = await storage.section.find({ category: product.category })

        product.sections = []
        product.units = []
        let length = unit_ids.length

        for (let i = 0; i < length; i++) {
            const unit = await storage.unit.findOne({
                _id: unit_ids[i],
                section: sections[i].id
            })

            product.sections.push(sections[i].id)
            product.units.push(unit_ids[i])
            product.cipher_code += unit.cipher_code
        }

        while (length !== 4) {
            product.cipher_code += '00'
            length++
        }

        const warehouse = await storage.warehouse.findOne({ _id: warehouse_id })
        const branch = warehouse.branch as IBranch

        product.warehouse = warehouse.id
        product.branch = branch.id

        product.cipher_code += branch.cipher_code + warehouse.cipher_code

        product = await storage.product.update({ _id: product.id }, {
            category: product.category,
            sections: product.sections,
            units: product.units,
            branch: product.branch,
            warehouse: product.warehouse,
            cipher_code: product.cipher_code
        } as IProduct)

        res.status(200).json({
            success: true,
            data: {
                product
            },
            message: message('product_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        await storage.product.deleteMany({})

        res.status(200).json({
            success: true,
            message: message('product_delete_200', lang)
        })
    })

    trigger = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const workbook = xlsx.readFile(path.join(__dirname, '../uploads/sampleoriginal.xlsx'))
        const data = xlsx.utils.sheet_to_json(workbook.Sheets['TDSheet']) as any

        let products: IProduct[] = []
        let cipher_code = '1'
        let type_id = ''
        let branch = (await storage.branch.find({ cipher_code: '01' }))[0]

        if (!branch) {
            branch = await storage.branch.create({
                name: 'Toshkent shahri',
                cipher_code: '01'
            } as IBranch)
        }

        for (let row of data) {
            if (typeof row['"УТВЕРЖДАЮ"'] === 'string' && row['"УТВЕРЖДАЮ"'].startsWith('10.')) {
                let type = (await storage.type.find({ cipher_code }))[0]

                if (!type) {
                    type = await storage.type.create({
                        name: row['"УТВЕРЖДАЮ"'].split('0 ')[1],
                        cipher_code
                    } as IType)
                }

                type_id = type.id
                cipher_code = (Number(cipher_code) + 1).toString()
            }

            if (typeof row.__EMPTY_1 === 'number') {
                products.push({
                    inventor_number: row.__EMPTY_1,
                    name: row.__EMPTY_4,
                    measure_unit: row.__EMPTY_6,
                    price: row.__EMPTY_11 || 0,
                    quantity: row.__EMPTY_13 || 0,
                    type: type_id,
                    branch: branch.id,
                    created_at: row.__EMPTY_7
                } as IProduct)
            }
        }

        await storage.product.createMany(products)

        res.status(200).json({
            success: true,
            message: 'All data has been retrieved from excel successfully'
        })
    })
}
