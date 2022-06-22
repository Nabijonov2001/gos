import { application, NextFunction, Request, Response } from 'express'
import { Upload } from '../helpers/upload'
import { unlink } from 'fs/promises'
import path from 'path'
import { message } from '../locales/get_message'
import { IApplication } from '../models/Application'
import { IMarketing } from '../models/Marketing'
import { IPurchase } from '../models/Purchase'
import { IPurchaseState } from '../models/PurchaseState'
import { IResponse } from '../models/Response'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export class MarketingController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let marketings

        switch (role) {
            case 'user2': {
                const query: any = {}

                if (req.query.status) {
                    query.research_status = req.query.status
                }

                marketings = await storage.marketing.find({
                    market_researcher: id,
                    ...query
                })

                break
            }

            case 'user3': {
                marketings = await storage.marketing.find({ user: id, ...req.query })
                break
            }

            case 'admin': {
                marketings = await storage.marketing.find(req.query)
                break
            }
        }

        res.status(200).json({
            success: true,
            data: {
                marketings
            },
            message: message('marketing_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id
        let marketing: any, responses

        if (role === 'user2') {
            marketing = await storage.marketing.findOne({ _id, market_researcher: id })
        } else if (role === 'user3') {
            marketing = await storage.marketing.findOne({ _id, user: id })
        } else if (role === 'admin') {
            marketing = await storage.marketing.findOne({ _id })
        }

        if (marketing.is_new) {
            await storage.marketing.update({ _id: marketing.id }, {
                is_new: false
            } as IMarketing)
        }

        responses = await storage.response.find({ type_id: _id, type: 'marketing' })

        res.status(200).json({
            success: true,
            data: {
                marketing,
                responses
            },
            message: message('marketing_getOne_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id
        const { status, selected_user, date, text, trading_platform, offer_price, offer_ids } =
            req.body
        let marketing = await storage.marketing.findOne({ _id })

        const market_researcher = marketing.market_researcher as any

        if (
            (role === 'user2' &&
                (id !== market_researcher._id ||
                    !['on_marketing', 'remarketing'].includes(marketing.status))) ||
            (role === 'user3' &&
                (id !== marketing.user ||
                    !['marketing_ended', 'remarketing'].includes(marketing.status)))
        ) {
            return next(new AppError(403, 'marketing_update_403'))
        }

        if (role === 'user2' && status !== 'sent') {
            return next(new AppError(400, 'marketing_updated_400'))
        } else if (
            role === 'user3' &&
            status &&
            !['disapproved', 'canceled', 'sent'].includes(status)
        ) {
            return next(new AppError(400, 'marketing_update_400'))
        }

        switch (role) {
            case 'user2': {
                const offers = await storage.offer.find({ marketing: marketing.id })

                if (trading_platform !== 'direct' && !offers.length) {
                    // direct dan boshqa platformalarda offer lar bo`lishi kerak
                    return next(new AppError(400, 'Offers are required!'))
                }
                if (trading_platform === 'direct' && offers.length !== 1) {
                    // method direct bo`lganda faqatgina bitta fayl yuklay oladi
                    return next(new AppError(400, 'Only one file is uploaded in the direct method'))
                }

                if (!offer_price) {
                    return next(new AppError(400, 'Offer price is required!'))
                }

                const doc = req.file as Express.Multer.File
                if (trading_platform === 'direct') {
                    // direct da izoh qismida fayl yuklash majburiy
                    if (!doc) {
                        return next(new AppError(400, 'file must be uploaded!'))
                    }
                    req.body.file = await Upload.uploadFile(doc)
                }
                await storage.response.create({
                    user: id,
                    user_type: 'user2',
                    type: 'marketing',
                    type_id: marketing.id,
                    text: text,
                    file: doc ? req.body.file : null,
                    status: 'idle'
                } as IResponse)

                marketing.trading_platform = trading_platform
                marketing.offer_price = offer_price
                marketing.research_status = 'sent'
                marketing.status = 'marketing_ended'

                break
            }

            case 'user3': {
                if (status === 'disapproved') {
                    if (!['marketing_ended', 'remarketing'].includes(marketing.status) || !text) {
                        return next(new AppError(400, 'marketing_update_400'))
                    }

                    await storage.response.create({
                        user: id,
                        user_type: 'user3',
                        type: 'marketing',
                        type_id: marketing.id,
                        text: text,
                        status: 'disapproved'
                    } as IResponse)

                    marketing.status = 'on_marketing'
                    marketing.research_status = 'remarketing'
                } else if (status === 'canceled') {
                    // response yozayotganda yo file yoki text yozilishi kerak
                    if (!text && !req.file) {
                        return next(new AppError(400, 'file or text must be writen'))
                    }

                    if (req.file) {
                        req.body.file = await Upload.uploadFile(req.file)
                    }

                    await storage.response.create({
                        user: id,
                        user_type: 'user3',
                        type: 'marketing',
                        type_id: marketing.id,
                        text: text,
                        file: req.body.file,
                        status: 'disapproved'
                    } as IResponse)

                    await storage.application.update({ _id: marketing.application }, {
                        status
                    } as IApplication)

                    // designning user2, user4, user11 qismida canceled degan tabi yo'q
                    // shuning uchun faqat user3 va user5
                    await storage.application_state.updateMany(
                        {
                            application: marketing.application,
                            user_type: { $in: ['user2', 'user3', 'user5'] }
                        },
                        { status }
                    )
                    marketing.status = status
                    marketing.research_status = status
                } else if (status === 'sent') {
                    marketing.offer_price = offer_price || marketing.offer_price
                    if (['tender', 'tanlov'].includes(trading_platform)) {
                        marketing.trading_platform = trading_platform || marketing.trading_platform
                        if (!selected_user) {
                            return next(new AppError(400, 'marketing_update_400'))
                        }

                        marketing.trading_platform = trading_platform && marketing.trading_platform
                        marketing.offer_price = offer_price && marketing.offer_price

                        const requirement_adder = await storage.user.findOne({
                            _id: selected_user,
                            type: 'user4'
                        })

                        const purchase = await storage.purchase.create({
                            application: marketing.application,
                            marketing: marketing._id,
                            method: marketing.trading_platform,
                            user: id,
                            date: req.body.date,
                            status: '01',
                            requirement_adder: requirement_adder._id
                        } as IPurchase)

                        await storage.purchase_state.create({
                            status: '01',
                            purchase: purchase._id,
                            application: purchase.application,
                            marketing: purchase.marketing,
                            user_type: 'user4',
                            user: purchase.requirement_adder,
                            method: purchase.method
                        } as IPurchaseState)
                    } else if (
                        ['cooperuz', 'emagazin', 'auction', 'direct'].includes(trading_platform)
                    ) {
                        const doc = req.file as Express.Multer.File
                        if (
                            marketing.trading_platform !== 'direct' &&
                            trading_platform === 'direct'
                        ) {
                            if (!text || !doc) {
                                return next(new AppError(400, 'file and text must be written!'))
                            }
                            marketing.trading_platform = trading_platform
                            req.body.file = await Upload.uploadFile(doc)
                            await storage.response.create({
                                user: id,
                                user_type: 'user3',
                                type: 'marketing',
                                type_id: marketing.id,
                                text: text,
                                file: req.body.file,
                                status: 'idle'
                            } as IResponse)
                        }
                        marketing.trading_platform = trading_platform

                        const purchase = await storage.purchase.create({
                            application: marketing.application,
                            marketing: marketing._id,
                            method: marketing.trading_platform,
                            user: id,
                            status: '11'
                        } as IPurchase)

                        const commissions = await storage.user.find({ is_commission_member: true })

                        for (const member of commissions) {
                            await storage.purchase_state.create({
                                status: '11',
                                purchase: purchase._id,
                                application: purchase.application,
                                marketing: purchase.marketing,
                                method: marketing.trading_platform,
                                user_type: member.type,
                                user: member._id
                            } as IPurchaseState)
                        }
                    }
                    marketing.status = 'sent'
                    await storage.application.update({ _id: marketing.application }, {
                        status: 'purchasing'
                    } as IApplication)
                }

                break
            }
        }

        marketing = await marketing.save()

        res.status(200).json({
            success: true,
            data: {
                marketing
            },
            message: message('marketing_update_200', lang)
        })
    })
}
