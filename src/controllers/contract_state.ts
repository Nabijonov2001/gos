import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IUser } from '../models/User'
import { IContract } from '../models/Contract'
import { IContractState } from '../models/ContractState'
import { Upload } from '../helpers/upload'
import { IApplication } from '../models/Application'
import { IResponse } from '../models/Response'

export class ContractStateController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        const contract_states = await storage.contract_state.find({ user: id })

        res.status(200).json({
            success: true,
            data: {
                contract_states
            },
            message: message('contract_state_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals

        let contract_state = await storage.contract_state.findOne({
            _id: req.params.id,
            user: id
        })
        contract_state.is_new = false
        contract_state = await contract_state.save()
        const contract = contract_state.contract as IContract

        const responses = await storage.response.find({
            type_id: {
                $in: [contract.application, contract.marketing, contract.purchase, contract.id]
            }
        })
        res.status(200).json({
            success: true,
            data: {
                contract_state,
                responses
            }
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const {
            status,
            signatory_id,
            oneCCode,
            payment_date,
            selected_user,
            payment_amount,
            description,
            payment_statement_num,
            paid_date
        } = req.body

        let contract_state = await storage.contract_state.findOne({
            _id: req.params.id,
            user: id
        })

        let contract = contract_state.contract as IContract

        if (
            (role === 'user3' && !['02', '12', '13', '22'].includes(status)) ||
            (role === 'user11' && status !== '02')
        ) {
            return next(new AppError(400, 'contract_state_update_400'))
        }

        switch (role) {
            case 'user3':
                if (status === '02') {
                    if (contract_state.status !== '01') {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }
                    let user
                    if (signatory_id) {
                        // user2
                        user = await storage.user.findOne({ _id: signatory_id, type: 'user2' })
                    } else {
                        // user11
                        const user1 = (
                            await storage.application.findOne({ _id: contract.application })
                        ).user as IUser

                        user = await storage.user.findOne({
                            type: 'user11',
                            branches: user1.branches
                        })
                    }
                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user.type,
                        user: user.id,
                        method: contract_state.method
                    } as IContractState)

                    await storage.contract_state.update({ _id: contract_state.id }, {
                        selected_user: user.id
                    } as IContractState)
                    contract_state.status = status
                    contract_state.is_new = true
                } else if (status === '12') {
                    //To'lovga yuborilgan
                    //find user 5

                    if (
                        contract_state.status !== '11' ||
                        !selected_user ||
                        !description ||
                        !payment_amount
                    ) {
                        return next(new AppError(400, 'contract_update_400'))
                    }
                    let user = await storage.user.findOne({ _id: selected_user, type: 'user5' })
                    if (req.file) {
                        req.body.file = await Upload.uploadFile(req.file)
                    }

                    // user5 ga rasmiylashtirilganga jo`natish
                    const user5_contract_state = await storage.contract_state.find({
                        contract: contract.id,
                        user: selected_user,
                        user_type: 'user5',
                        status: '03'
                    })

                    if (!user5_contract_state.length) {
                        await storage.contract_state.create({
                            contract: contract.id,
                            user_type: user.type,
                            user: user.id,
                            status: '03',
                            method: contract_state.method
                        } as IContractState)
                    }

                    // user3 da yangi to`lov yaratiladi
                    const user3_state = await storage.contract_state.create({
                        contract: contract.id,
                        user_type: 'user3',
                        user: id,
                        payment_id: uuidv4(),
                        payment_amount,
                        file: req.body.file,
                        status: '12',
                        selected_user,
                        method: contract_state.method
                    } as IContractState)

                    // user5 ga to`lovni jo`natish
                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user.type,
                        user: user.id,
                        file: req.body.file,
                        status: '11',
                        payment_id: user3_state.payment_id,
                        payment_amount,
                        method: contract_state.method
                    } as IContractState)

                    await storage.response.create({
                        user: id,
                        user_type: 'user3',
                        type: 'contract',
                        type_id: contract.id,
                        payment_id: user3_state.payment_id,
                        text: description,
                        status: 'idle'
                    } as IResponse)
                } else if (status === '22') {
                    //find user 16 (omborchi)
                    if (contract_state.status !== '21' || !selected_user) {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }

                    let user = await storage.user.findOne({ type: 'user16', _id: selected_user })

                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user.type,
                        user: user.id,
                        method: contract_state.method,
                        status: '21'
                    } as IContractState)

                    contract_state.selected_user = selected_user
                    contract_state.is_new = true
                    contract_state.status = status
                }
                break
            case 'user11':
                if (status === '02') {
                    if (contract_state.status !== '01' || !selected_user) {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }
                    const user11 = await storage.user.findOne({ _id: id, type: 'user11' })
                    const user1 = await storage.user.findOne({
                        _id: selected_user,
                        type: 'user1',
                        branches: user11.branches
                    })
                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user1.type,
                        user: user1.id,
                        method: contract_state.method
                    } as IContractState)

                    contract_state.selected_user = user1.id
                    contract_state.is_new = true
                    contract_state.status = status
                }
                break
            case 'user5':
                if (status === '13') {
                    // to`lovni bekor qilish

                    await storage.contract_state.update(
                        {
                            contract: contract._id,
                            payment_id: contract_state.payment_id,
                            user_type: 'user3',
                            status: '12'
                        },
                        {
                            status: '13'
                        } as IContractState
                    )
                    await storage.response.create({
                        user: id,
                        user_type: 'user5',
                        type: 'contract',
                        type_id: contract.id,
                        payment_id: contract_state.payment_id,
                        text: description,
                        status: 'disapproved'
                    } as IResponse)
                    contract_state.status = status
                    contract_state.is_new = true
                } else if (status === '12') {
                    //find user 9
                    const user = await storage.user.findOne({ _id: selected_user, type: 'user9' })
                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user.type,
                        user: user.id,
                        description: contract_state.description,
                        payment_amount: contract_state.payment_amount,
                        payment_id: contract_state.payment_id,
                        method: contract_state.method,
                        status: '11'
                    } as IContractState)

                    await storage.response.create({
                        user: id,
                        user_type: 'user5',
                        type: 'contract',
                        type_id: contract.id,
                        payment_id: contract_state.payment_id,
                        text: description,
                        status: 'approved'
                    } as IResponse)

                    contract_state.selected_user = user.id
                    contract_state.status = status
                    contract_state.is_new = true
                }
                break
            case 'user9':
                if (status === '12') {
                    if (
                        contract_state.status !== '11' ||
                        !payment_date ||
                        !selected_user ||
                        !description
                    ) {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }
                    const user = await storage.user.findOne({ _id: selected_user, type: 'user8' })

                    await storage.contract_state.create({
                        contract: contract.id,
                        user_type: user.type,
                        user: user.id,
                        payment_amount: contract_state.payment_amount,
                        payment_date: payment_date,
                        payment_id: contract_state.payment_id,
                        method: contract_state.method,
                        status: '11'
                    } as IContractState)

                    await storage.response.create({
                        user: id,
                        user_type: 'user9',
                        type: 'contract',
                        type_id: contract.id,
                        payment_id: contract_state.payment_id,
                        text: description,
                        status: 'idle'
                    } as IResponse)

                    contract_state.payment_date = payment_date
                    contract_state.selected_user = selected_user
                    contract_state.is_new = true
                    contract_state.status = status
                }
                break
            case 'user8':
                if (status === '12') {
                    const doc_file = req?.file as Express.Multer.File
                    if (
                        contract_state.status !== '11' ||
                        !description ||
                        !doc_file ||
                        !paid_date ||
                        !payment_statement_num ||
                        !payment_amount
                    ) {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }

                    const file = await Upload.uploadFile(doc_file)
                    const payment = {
                        payment_id: contract_state.payment_id,
                        payer: id,
                        payment_statement_num,
                        paid_date,
                        payment_amount,
                        file,
                        description
                    }
                    const currentContract = await storage.contract.update(
                        { _id: contract_state?.contract },
                        {
                            $push: { payments: payment }
                        } as any
                    )

                    // user3 dagi to`lov to`lnganlar qatoriga o`tadi
                    await storage.contract_state.update(
                        {
                            contract: contract.id,
                            payment_id: contract_state.payment_id
                        },
                        { status: '14', is_new: true } as IContractState
                    )

                    // to`lov 100% to`langanligini tekshirish
                    const totalPaidSum = currentContract?.payments?.reduce((acc, curr) => {
                        return acc + curr?.payment_amount
                    }, 0)

                    if (Number(totalPaidSum) >= currentContract?.total_price) {
                        const user3_contract_state = await storage.contract_state.update(
                            {
                                user_type: 'user3',
                                status: '11',
                                contract: contract_state?.contract
                            },
                            { status: '15', is_new: true } as IContractState
                        )
                        await storage.contract_state.deleteMany({
                            contract: contract.id,
                            user_type: 'user3',
                            status: { $in: ['03', '13', '14'] }
                        })

                        // agar yetkazib berilgan bo`lsa yakunlanganga o`tadi
                        const delivered = await storage.contract_state.find({
                            status: '23',
                            user_type: 'user3',
                            contract: contract_state.contract
                        })

                        if (delivered.length) {
                            await storage.application.update({ _id: contract.application }, {
                                status: 'finished',
                                finishedAt: new Date()
                            } as IApplication)
                            user3_contract_state.status = '30'
                            user3_contract_state.is_new = true
                            await user3_contract_state.save()

                            await storage.contract_state.delete({
                                contract: contract.id,
                                user_type: 'user3',
                                status: '23'
                            })
                        }
                    }

                    contract_state.status = status
                    contract_state.is_new = true
                }
                break
            case 'user16':
                if (status === '23') {
                    const doc = req.file as Express.Multer.File
                    if (contract_state.status !== '21' || !oneCCode || !doc) {
                        return next(new AppError(400, 'contract_state_update_400'))
                    }

                    contract.trust_letter = (await Upload.uploadFile(doc)) as any
                    contract.oneCCode = oneCCode

                    await storage.contract_state.update(
                        { user_type: 'user3', status: '22', contract: contract.id },
                        { status, is_new: true } as IContractState
                    )
                    contract_state.status = status
                    contract_state.is_new = true

                    const paidCompletely = await storage.contract_state.find({
                        contract: contract.id,
                        status: '15',
                        user_type: 'user3'
                    })
                    if (paidCompletely.length) {
                        await storage.application.update({ _id: contract.application }, {
                            status: 'finished',
                            finishedAt: new Date()
                        } as IApplication)
                        paidCompletely[0].status = '30'
                        paidCompletely[0].is_new = true
                        await paidCompletely[0].save()

                        await storage.contract_state.delete({
                            contract: contract.id,
                            user_type: 'user3',
                            status: '23'
                        })
                    }
                }
                break
        }

        await contract.save()
        contract_state = await contract_state.save()
        res.status(200).json({
            success: true,
            data: {
                contract_state
            }
        })
    })
}
