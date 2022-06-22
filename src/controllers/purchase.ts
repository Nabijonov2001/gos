import { application, NextFunction, Request, Response } from 'express'
import { date } from 'joi'
import { Upload } from '../helpers/upload'
import { message } from '../locales/get_message'
import { IApplication } from '../models/Application'
import { IPurchaseState } from '../models/PurchaseState'
import { IResponse } from '../models/Response'
import router from '../routes'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export class PurchaseController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const purchases = await storage.purchase.find({ user: id, ...req.query })

        const commission = await storage.user.find({ is_commission_member: true })

        const responses = await storage.response.find({
            type: 'purchase',
            user_type: { $in: ['user4', 'user5'] }
        })

        res.status(200).json({
            success: true,
            data: {
                purchases,
                responses,
                commission
            },
            message: message('purchase_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        let purchase = await storage.purchase.findOne({ _id: req.params.id, user: id })

        purchase.is_new = false
        purchase = await purchase.save()

        const responses = await storage.response.find({ type_id: req.params.id })
        const commissions = await storage.commission.find({ is_commission: true })

        res.status(200).json({
            success: true,
            data: {
                purchase,
                commissions,
                responses
            },
            message: message('purchase_getOne_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const { status, text, selected_user, date, method } = req.body
        const purchase = await storage.purchase.findOne({ _id: req.params.id, user: id })

        if (status === '01') {
            if (!['12', '23'].includes(purchase.status)) {
                return next(new AppError(400, 'purchase_update_400'))
            }

            if (['cooperuz', 'emagazin', 'auction', 'direct'].includes(purchase.method)) {
                // platforma o'zgartirish
                if (!method) {
                    return next(new AppError(400, 'purchase_update_400'))
                }

                if (['tender', 'tanlov'].includes(method)) {
                    await storage.user.findOne({ _id: selected_user, type: 'user4' })

                    await storage.purchase_state.create({
                        status: '01',
                        purchase: purchase._id,
                        application: purchase.application,
                        marketing: purchase.marketing,
                        method,
                        user_type: 'user4',
                        user: selected_user
                    } as IPurchaseState)

                    purchase.status = '01'
                    purchase.is_new = true
                    purchase.requirement_adder = selected_user
                    purchase.method = method
                } else {
                    await storage.user.findOne({ _id: selected_user, type: 'user5' })

                    await storage.purchase_state.update(
                        {
                            user: selected_user,
                            purchase: purchase._id
                        },
                        { status: '21', method, is_new: true } as IPurchaseState
                    )

                    await storage.response.create({
                        user: id,
                        user_type: 'user3',
                        type: 'purchase',
                        type_id: purchase._id,
                        text,
                        status: 'idle'
                    } as IResponse)

                    purchase.status = '21'
                    purchase.is_new = true
                    purchase.method = method
                }
            } else {
                // qayta mezonlashtirish
                await storage.purchase_state.update(
                    {
                        purchase: purchase._id,
                        user: purchase.requirement_adder,
                        status: '02'
                    },
                    {
                        status: '01'
                    } as IPurchaseState
                )
                purchase.status = '01'
            }
        } else if (status === '11') {
            if (purchase.status !== '02') {
                return next(new AppError(400, 'purchase_update_400'))
            }

            const purchase_state_commission = await storage.purchase_state.find({
                purchase: purchase._id,
                user_type: { $in: ['user4', 'user5'] },
                status: '12'
            })

            if (purchase_state_commission.length) {
                // platforma o'zgartirilgan, qayta kelishishga jo'natish

                for (const member_state of purchase_state_commission) {
                    member_state.status = '11'
                    member_state.is_new = true
                    await member_state.save()
                }
            } else {
                // mezonni kelishga yuborish dastlabki holatda

                const commissions = await storage.user.find({ is_commission_member: true })

                for (const member of commissions) {
                    await storage.purchase_state.create({
                        status: '11',
                        purchase: purchase._id,
                        application: purchase.application,
                        marketing: purchase.marketing,
                        method: purchase.method,
                        user_type: member.type,
                        user: member.id
                    } as IPurchaseState)
                }
            }

            purchase.status = '11'
            purchase.is_new = true
        } else if (status === '12') {
            // mezonni kelishni yakunlash
            if (purchase.status !== '11') {
                return next(new AppError(400, 'purchase_update_400'))
            }

            const responses = await storage.response.find({
                type: 'purchase',
                user_type: { $in: ['user4', 'user5'] },
                type_id: purchase._id
            })

            // Mezonni kelishishni yakunlash uchun
            // komisiya azolaridan kamida bir kishi javob yozgan bo'lishi kerak
            if (!responses.length) {
                return next(new AppError(403, 'purchase_update_403'))
            }

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'purchase',
                type_id: purchase._id,
                text,
                status: 'idle'
            } as IResponse)

            await storage.purchase_state.updateMany(
                {
                    purchase: purchase._id,
                    user_type: { $in: ['user4', 'user5'] },
                    user: { $ne: purchase.requirement_adder }
                },
                { status: '12', is_new: true }
            )

            purchase.status = '12'
            purchase.is_new = true
        } else if (status === '21') {
            // tasdiqlashga yuborish
            if (!['02', '12'].includes(purchase.status)) {
                return next(new AppError(400, 'purchase_update_400'))
            }

            await storage.user.findOne({ _id: selected_user, type: 'user5' })

            await storage.purchase_state.create({
                status: '21',
                purchase: purchase._id,
                application: purchase.application,
                marketing: purchase.marketing,
                method: purchase.method,
                user_type: 'user5',
                user: selected_user
            } as IPurchaseState)

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'purchase',
                type_id: purchase._id,
                text,
                status: 'idle'
            } as IResponse)

            purchase.selected_user = selected_user
            purchase.status = '21'
            purchase.is_new = true
        } else if (status === '31') {
            // xaridga yuborish
            if (purchase.status !== '22') {
                return next(new AppError(400, 'purchase_update_400'))
            }

            await storage.user.findOne({ _id: selected_user, type: 'user12' })

            await storage.purchase_state.create({
                status: '31',
                purchase: purchase._id,
                application: purchase.application,
                marketing: purchase.marketing,
                method: purchase.method,
                user_type: 'user12',
                user: selected_user
            } as IPurchaseState)

            purchase.status = '31'
            purchase.is_new = true
            purchase.operator = selected_user
            purchase.purchase_date = date
        } else if (status === '41') {
            // baholashga yuborish
            if (purchase.status !== '32') {
                return next(new AppError(400, 'purchase_update_400'))
            }
            await storage.purchase_state.update(
                {
                    purchase: purchase._id,
                    user: purchase.requirement_adder,
                    status: { $in: ['02', '12'] }
                },
                { status: '41', is_new: true } as IPurchaseState
            )

            purchase.status = status
            purchase.is_new = true
        } else if (status === '51') {
            // baholarni kelishishga yuborish
            if (purchase.status !== '42') {
                return next(new AppError(400, 'purchase_update_400'))
            }
            const commissions = await storage.user.find({ is_commission_member: true })

            for (const member of commissions) {
                const purchase_state = await storage.purchase_state.find({
                    user: member.id,
                    purchase: purchase.id,
                    status: '12'
                })
                if (purchase_state.length) {
                    purchase_state[0].status = '51'
                    purchase_state[0].save()
                } else {
                    await storage.purchase_state.create({
                        status: '51',
                        purchase: purchase._id,
                        application: purchase.application,
                        marketing: purchase.marketing,
                        method: purchase.method,
                        user_type: member.type,
                        user: member.id
                    } as IPurchaseState)
                }
            }

            purchase.status = '51'
            purchase.is_new = true
        } else if (status === '52') {
            // baholarni kelishishni yakunlash
            if (purchase.status === '52' || purchase.status !== '51') {
                return next(new AppError(400, 'purchase_update_400'))
            }

            const commissions = await storage.user.find({ is_commission_member: true })
            const responded_commissions = await storage.purchase_state.find({
                purchase: purchase._id,
                user_type: { $in: ['user4', 'user5'] },
                status: '52'
            })
            if ((responded_commissions.length / commissions.length) * 100 < 50) {
                return next(new AppError(403, 'purchase_update_403'))
            }

            await storage.purchase_state.updateMany(
                {
                    purchase: purchase._id,
                    $or: [
                        {
                            status: '51',
                            user_type: { $in: ['user4', 'user5'] }
                        },
                        { status: '32', user: purchase.operator }
                    ]
                },
                { status: '52', is_new: true } as IPurchaseState
            )

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'purchase',
                type_id: purchase._id,
                text,
                status: 'idle'
            } as IResponse)

            purchase.status = '52'
            purchase.is_new = true
        } else if (status === 'remarketing') {
            if (purchase.status !== '23' || !text) {
                return next(new AppError(400, 'purchase_update_400'))
            }

            const doc = req.file as Express.Multer.File
            if (doc) {
                req.body.file = await Upload.uploadFile(doc)
            }

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'marketing',
                type_id: purchase.marketing,
                text: text,
                file: req.body.file ? req.body.file : null,
                status: 'disapproved'
            } as IResponse)

            purchase.status = 'remarketing'
            purchase.is_new = true
            await storage.marketing.update(
                { _id: purchase.marketing },
                { status, research_status: status, is_new: true }
            )
        } else if (status === 'canceled') {
            const doc = req.file as Express.Multer.File
            if (purchase.status !== '23' || !text) {
                return next(new AppError(400, 'purchase_update_400'))
            }

            if (doc) {
                req.body.file = await Upload.uploadFile(doc)
            }

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'purchase',
                type_id: purchase.id,
                text: text,
                file: req.body.file ? req.body.file : null,
                status: 'disapproved'
            } as IResponse)

            await storage.purchase_state.updateMany(
                { purchase: purchase.id },
                { status, is_new: true }
            )
            await storage.marketing.update(
                { _id: purchase.marketing },
                { status, research_status: status, is_new: true }
            )
            await storage.application_state.updateMany(
                {
                    application: purchase.application,
                    user_type: { $in: ['user3', 'user5'] }
                },
                { status, is_new: true }
            )
            await storage.application.update({ _id: purchase.application }, {
                status
            } as IApplication)
            purchase.status = status
            purchase.is_new = true
        }

        await purchase.save()

        res.status(200).json({
            success: true,
            data: {
                purchase
            },
            message: message('purchase_update_200', lang)
        })
    })

    changeSelectedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { id: purchase_id } = req.params
        const { user_id, text, date } = req.body
        console.log('hello')
        const user = await storage.user.findOne({ _id: user_id })

        if (user.type === 'user5') {
            if (!text) {
                return next(new AppError(400, 'text is required!'))
            }
            const purchase = await storage.purchase.findOne({ _id: purchase_id, status: '21' })

            await storage.purchase_state.create({
                status: '21',
                purchase: purchase._id,
                application: purchase.application,
                marketing: purchase.marketing,
                method: purchase.method,
                user_type: 'user5',
                user: user.id
            } as IPurchaseState)

            await storage.response.create({
                user: id,
                user_type: 'user3',
                type: 'purchase',
                type_id: purchase._id,
                text,
                status: 'idle'
            } as IResponse)

            purchase.selected_user = user.id
            await purchase.save()

            // deleting old purchase_state
            await storage.purchase_state.delete({
                purchase: purchase_id,
                status: '21',
                user_type: 'user5'
            })
        } else if (user.type === 'user12') {
            if (!date) {
                return next(new AppError(400, 'date is required'))
            }
            console.log('hello')
            const purchase = await storage.purchase.findOne({ _id: purchase_id, status: '31' })

            await storage.purchase_state.create({
                status: '31',
                purchase: purchase._id,
                application: purchase.application,
                marketing: purchase.marketing,
                method: purchase.method,
                user_type: 'user12',
                user: user_id
            } as IPurchaseState)

            // deleting old purchase_state
            await storage.purchase_state.delete({
                purchase: purchase.id,
                status: '31',
                user_type: 'user12'
            })

            purchase.operator = user_id
            purchase.purchase_date = date
            await purchase.save()
        }

        res.status(200).json({
            success: true,
            message: message('succesfully changed!', lang)
        })
    })
}
