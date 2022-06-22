import { NextFunction, Request, response, Response } from 'express'
import { logger } from '../config/logger'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import sharp from 'sharp'
import { unlink } from 'fs/promises'
import { message } from '../locales/get_message'
import { IPurchaseState } from '../models/PurchaseState'
import { IPurchase } from '../models/Purchase'
import { IResponse } from '../models/Response'
import { IBidder } from '../models/Bidder'
import { Upload } from '../helpers/upload'
import { IContract } from '../models/Contract'
import { IContractState } from '../models/ContractState'
import { IRequirement } from '../models/Requirement'

export class PurchaseStateController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let purchase_states

        if (role === 'user12' && (req.query.status === '34' || req.query.status === '33')) {
            purchase_states = await storage.purchase_state.find({ user: id, status: '33' })
            for (const purchase_state of purchase_states) {
                if (
                    ((purchase_state.purchase as IPurchase).platform_date.till as unknown as Date) <
                    new Date()
                ) {
                    purchase_state.status = '34'
                    await purchase_state.save()
                }
            }
        }

        purchase_states = await storage.purchase_state.find({ user: id, ...req.query })

        res.status(200).json({
            success: true,
            data: {
                purchase_states
            },
            message: message('sample_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role, lang, id } = res.locals
        let purchase_state = await storage.purchase_state.findOne({
            _id: req.params.id,
            user: id
        })

        purchase_state.is_new = false
        purchase_state = await purchase_state.save()

        const purchase = purchase_state.purchase as IPurchase

        let responses
        if (role === 'user5') {
            responses = await storage.response.find({
                type_id: purchase.id
            })
        }

        res.status(200).json({
            success: true,
            data: {
                purchase_state,
                responses
            },
            message: message('purchase_state_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const purchase_state = await storage.purchase_state.create(req.body)

        if (req.file) {
            const image = `images/${req.file.fieldname}-${uuidv4()}`

            await sharp(req.file.buffer)
                .png()
                .toFile(path.join(__dirname, '../../../uploads', `${image}.png`))
        }

        res.status(201).json({
            success: true,
            data: {
                purchase_state
            }
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, role, lang } = res.locals
        const {
            status,
            main_requirement,
            technical_share,
            price_share,
            min_score,
            text,
            response_status,
            platform_date,
            platform_url,
            ended_date
        } = req.body
        const purchase_state = await storage.purchase_state.findOne({
            _id: req.params.id,
            user: id
        })
        const user = await storage.user.findOne({ _id: id })
        const purchase = purchase_state.purchase as IPurchase
        if (
            purchase_state.status === status ||
            (role === 'user5' && !['12', '22', '52'].includes(status)) ||
            (role === 'user4' && !['02', '12', '22', '52'].includes(status)) ||
            (role === 'user12' && !['32', '33', 'end', 'contract'].includes(status))
        ) {
            return next(new AppError(400, 'purchase_state_update_400'))
        }

        if (role === 'user4' && status === '02') {
            if (status === '02') {
                if (
                    (await storage.purchase_state.find({ purchase: purchase._id, status: '12' }))
                        .length
                ) {
                    // qayta mezonlashni tugatish
                    purchase.main_requirement = main_requirement || purchase.main_requirement
                    purchase.technical_share = technical_share || purchase.technical_share
                    purchase.price_share = price_share || purchase.price_share
                    purchase.min_score = min_score || purchase.min_score
                } else {
                    // yangi mezonlashni tugatish
                    const total_share = (purchase.requirements as IRequirement[]).reduce(
                        (share, requirement) => {
                            return share + requirement.share
                        },
                        0
                    )
                    if (total_share !== 100) {
                        return next(new AppError(400, 'The sum of the shares must be equal to 100'))
                    }

                    if (
                        purchase_state.status !== '01' ||
                        !main_requirement ||
                        (main_requirement === 'score' && (!technical_share || !price_share)) ||
                        !min_score ||
                        !purchase.requirements.length
                    ) {
                        return next(new AppError(400, 'purchase_state_update_400'))
                    }

                    if (main_requirement === 'score') {
                        if (technical_share + price_share !== 100) {
                            return next(new AppError(400, 'purchase_state_update_400'))
                        }

                        purchase.technical_share = technical_share
                        purchase.price_share = price_share
                    }

                    purchase.main_requirement = main_requirement
                    purchase.min_score = min_score
                }
                purchase_state.status = status
                purchase_state.is_new = true
                purchase.is_new = true
                purchase.status = status
            } // status 42 bidder updatega boradi
        } else if (role === 'user5' && status === '22') {
            if (purchase_state.status !== '21') {
                return next(new AppError(400, 'purchase_state_update_400'))
            }

            // agar method "direct" bo`lsa va uni tasdiqlasa shartnomaga o`tib ketadi.
            if (purchase_state.method === 'direct' && response_status === 'approved') {
                const contract = await storage.contract.create({
                    application: purchase.application,
                    marketing: purchase.marketing,
                    purchase: purchase.id
                } as IContract)

                const application = await storage.application.findOne({ _id: purchase.application })
                const user3 = await storage.user.findOne({ type: 'user3' })

                await storage.contract_state.create({
                    contract: contract.id,
                    user_type: 'user3',
                    user: user3.id,
                    method: purchase.method
                } as IContractState)

                purchase.status = 'contract'
                purchase.is_new = true
                purchase_state.status = 'contract'
                application.status = 'contract'
                await application.save()
            }

            await storage.response.create({
                user: id,
                user_type: 'user5',
                type: 'purchase',
                type_id: purchase.id,
                text,
                method: purchase.method,
                status: response_status === 'approved' ? 'accepted' : 'disapproved'
            } as IResponse)

            purchase.status = response_status === 'approved' ? '22' : '23'
            purchase.is_new = true
            purchase_state.status = response_status === 'approved' ? '22' : '23'
            purchase_state.is_new = true
        } else if (['user4', 'user5'].includes(role) && user.is_commission_member) {
            if (status === '12') {
                if (
                    purchase_state.status !== '11' ||
                    purchase.status === '12' ||
                    !response_status ||
                    (response_status === 'disapproved' && !text)
                ) {
                    return next(new AppError(400, 'purchase_state_update_400'))
                }

                await storage.response.create({
                    user: id,
                    user_type: 'user4',
                    type: 'purchase',
                    type_id: purchase.id,
                    text,
                    method: purchase.method,
                    status: response_status
                } as IResponse)

                purchase_state.status = status
                await purchase_state.save()

                const commission_members = await storage.user.find({ is_commission_member: true })

                const commission_purchase_states = await storage.purchase_state.find({
                    purchase: purchase_state.purchase,
                    user_type: { $in: ['user4', 'user5'] },
                    status: '12'
                })

                if (commission_purchase_states.length === commission_members.length) {
                    purchase.status = status
                }
            } else if (status === '52' && purchase_state.status === '51') {
                const commissions = await storage.user.find({ is_commission_member: true })
                const responded_commissions = await storage.purchase_state.find({
                    purchase: purchase.id,
                    user_type: { $in: ['user4', 'user5'] },
                    status: '52'
                })

                if (responded_commissions.length + 1 === commissions.length) {
                    purchase.status = '52'
                }
            }
            purchase_state.status = status
            purchase_state.is_new = true
        } else if (role === 'user12') {
            if (status === '33') {
                if (purchase_state.status !== '31') {
                    return next(new AppError(400, 'purchase_state_update_400'))
                }
                purchase.platform_date = platform_date
                purchase.platform_url = platform_url
                purchase_state.status = status
                purchase_state.is_new = true
                purchase.is_new = true
            } else if (status === '32') {
                const bidders = await storage.bidder.find({ purchase: purchase.id })
                if (purchase_state.status !== '34' || !bidders.length || !bidders.length) {
                    return next(new AppError(400, 'purchase_state_update_400'))
                }
                purchase.status = status
                purchase.is_new = true
                purchase_state.status = status
                purchase_state.is_new = true
            } else if (status === 'end') {
                // yakunlagan vaqtni kiritish qismi
                if (
                    (['tender', 'tanlov'].includes(purchase_state.method) &&
                        purchase_state.status !== '52') ||
                    (['emagazin', 'cooperuz', 'auction'].includes(purchase_state.method) &&
                        purchase_state.status !== '34')
                ) {
                    return next(new AppError(400, 'purchase_state_updat_400'))
                }
                purchase.platform_date.end = ended_date
            } else if (status === 'contract') {
                // bu yerda avvalgi statusi teksirilishi kerak
                // shartnomaga jo`natish
                const doc_files = req.files as Express.Multer.File[]

                if (!doc_files.length) {
                    return next(new AppError(400, 'contract files must be upload!'))
                }

                req.body.files = await Upload.uploadFiles(doc_files)
                req.body.application = purchase.application
                req.body.marketing = purchase.marketing
                req.body.purchase = purchase.id

                const contract = await storage.contract.create({ ...req.body } as IContract)

                const user3 = await storage.user.findOne({ type: 'user3' })
                const application = await storage.application.findOne({ _id: purchase.application })

                await storage.contract_state.create({
                    contract: contract.id,
                    user_type: 'user3',
                    user: user3.id,
                    method: purchase.method
                } as IContractState)

                purchase.status = status
                purchase.is_new = true
                purchase_state.status = status
                purchase_state.is_new = true
                application.status = status
                application.method = purchase.method
                await application.save()
            }
        }

        await purchase.save()
        await purchase_state.save()

        res.status(200).json({
            success: true,
            data: {
                purchase_state,
                message: message('purchase_status_updated_200', lang)
            }
        })
    })

    // for testing
    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await storage.purchase_state.delete(req.params.id)

        res.status(204).json({
            success: true,
            data: null
        })
    })

    // for testing
    finish = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        let purchases_state = await storage.purchase_state.findOne({
            _id: req.params.id,
            user: id
        })
        if (purchases_state.status !== '33') {
            return next(new AppError(403, 'Forbidden'))
        }

        purchases_state.status = '34'
        purchases_state = await purchases_state.save()

        res.status(200).json({
            success: true,
            data: {
                purchases_state
            },
            message: message('purchase_getAll_200', lang)
        })
    })
}
