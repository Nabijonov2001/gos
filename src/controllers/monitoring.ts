import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import Contract, { IContract } from '../models/Contract'
import Application from '../models/Application'
import { Mongoose, Types } from 'mongoose'
import ContractState from '../models/ContractState'

export class MonitoringController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const applications = await storage.application.find(req.query)

        res.status(200).json({
            success: true,
            data: {},
            message: message('contract_state_getAll_200', lang)
        })
    })

    getGeneral = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const total = await Application.aggregate([
            {
                $facet: {
                    Total: [
                        {
                            $count: 'Total'
                        }
                    ],
                    Finished: [
                        {
                            $match: { status: 'finished' }
                        },
                        {
                            $count: 'Finished'
                        }
                    ],
                    Process: [
                        {
                            $match: { status: { $nin: ['canceled', 'disapproved', 'finished'] } }
                        },
                        {
                            $count: 'Process'
                        }
                    ],
                    Cancelled: [
                        {
                            $match: { status: { $in: ['canceled', 'disapproved'] } }
                        },
                        {
                            $count: 'Cancelled'
                        }
                    ]
                }
            },
            {
                $project: {
                    total: { $arrayElemAt: ['$Total.Total', 0] },
                    finished: { $arrayElemAt: ['$Finished.Finished', 0] },
                    process: { $arrayElemAt: ['$Process.Process', 0] },
                    cancelled: { $arrayElemAt: ['$Cancelled.Cancelled', 0] }
                }
            }
        ])

        const totalByMethod = await Application.aggregate([
            {
                $facet: {
                    Cooperuz: [
                        {
                            $match: { method: 'cooperuz' }
                        },
                        {
                            $count: 'Cooperuz'
                        }
                    ],
                    Tender: [
                        {
                            $match: { method: 'tender' }
                        },
                        {
                            $count: 'Tender'
                        }
                    ],
                    Tanlov: [
                        {
                            $match: { method: 'tanlov' }
                        },
                        {
                            $count: 'Tanlov'
                        }
                    ],
                    Direct: [
                        {
                            $match: { method: 'direct' }
                        },
                        {
                            $count: 'Direct'
                        }
                    ],
                    Emagazin: [
                        {
                            $match: { method: 'emagazin' }
                        },
                        {
                            $count: 'Emagazin'
                        }
                    ],
                    Auction: [
                        {
                            $match: { method: 'auction' }
                        },
                        {
                            $count: 'Auction'
                        }
                    ]
                }
            },
            {
                $project: {
                    cooperuz: { $arrayElemAt: ['$Cooperuz.Cooperuz', 0] },
                    tender: { $arrayElemAt: ['$Tender.Tender', 0] },
                    tanlov: { $arrayElemAt: ['$Tanlov.Tanlov', 0] },
                    direct: { $arrayElemAt: ['$Direct.Direct', 0] },
                    emagazin: { $arrayElemAt: ['$Emagazin.Emagazin', 0] },
                    auction: { $arrayElemAt: ['$Auction.Auction', 0] }
                }
            }
        ])

        res.status(200).json({
            success: true,
            data: { total, totalByMethod },
            message: message('contract_state_getAll_200', lang)
        })
    })

    getWithFilter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const {
            status,
            method,
            search,
            type,
            category,
            createdAt,
            finishedAt,
            skip = 1,
            limit = 10,
            units
        } = req.body

        const filter: any = {}
        let filterOption: any = []

        if (category) {
            filter.category = category
        }
        if (method) {
            filter.method = method
        }
        if (status) {
            if (status === 'application') {
                filter.status = { $nin: ['marketing', 'purchasing', 'contract', 'finished'] }
            } else {
                filter.status = status
            }
        }
        if (type) {
            filter.type = type
        }
        if (search) {
            const regex = new RegExp(search, 'i')
            filter.product_name = { $regex: regex }
        }
        if (createdAt) {
            const startedDate: any = createdAt
            const start_date = new Date(startedDate)
            const endedDate: any = finishedAt
            const end_date = new Date(endedDate)
            filter.createdAt = {
                $gte: start_date,
                $lte: end_date
            }
        }
        if (units) {
            filterOption = [
                {
                    $unwind: '$units'
                },
                {
                    $match: { units: { $in: units } }
                }
            ]
        }

        const total = await Application.aggregate([
            {
                $match: { ...filter }
            },
            ...filterOption,
            {
                $facet: {
                    Data: [
                        {
                            $group: {
                                _id: '$_id',
                                units: { $push: '$units' }
                            }
                        },
                        {
                            $count: 'Data'
                        }
                    ]
                }
            },
            {
                $project: {
                    total: { $arrayElemAt: ['$Data.Data', 0] }
                }
            }
        ])

        const filteredData = await Application.aggregate([
            {
                $match: { ...filter }
            },
            {
                $lookup: {
                    from: 'types',
                    localField: 'type',
                    foreignField: '_id',
                    as: 'populatedType'
                }
            },
            {
                $set: {
                    type: '$populatedType'
                }
            },
            {
                $unwind: '$type'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'populatedCategory'
                }
            },
            {
                $set: {
                    category: '$populatedCategory'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'branches',
                                localField: 'branches',
                                foreignField: '_id',
                                as: 'branches'
                            }
                        }
                    ],

                    as: 'populatedUser'
                }
            },
            {
                $set: {
                    user: '$populatedUser'
                }
            },
            {
                $unwind: '$user'
            },
            ...filterOption,
            {
                $facet: {
                    Data: [
                        {
                            $group: {
                                _id: '$_id',
                                type: { $first: '$type' },
                                application_code: { $first: '$application_code' },
                                createdAt: { $first: '$createdAt' },
                                user: { $first: '$user' },
                                product_name: { $first: '$product_name' },
                                method: { $first: '$method' },
                                status: { $first: '$status' },
                                cipher_code: { $first: '$cipher_code' },
                                category: { $first: '$category' },
                                units: { $push: '$units' }
                            }
                        },

                        {
                            $sort: { createdAt: 1 }
                        },
                        {
                            $skip: skip - 1
                        },
                        {
                            $limit: limit
                        }
                    ]
                }
            }
        ])

        res.status(200).json({
            succesps: true,
            data: { filteredData, total },
            message: message('contract_state_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals

        const application = await storage.application.findOne({ _id: req.params.id })

        let singleApplication
        let responses
        switch (application.status) {
            case 'marketing': {
                singleApplication = await storage.marketing.findOne({ application: req.params.id })
                responses = await storage.response.find({
                    type_id: {
                        $in: [singleApplication.application, singleApplication.id]
                    }
                })
                break
            }
            case 'purchasing': {
                singleApplication = await storage.purchase.findOne({ application: req.params.id })
                responses = await storage.response.find({
                    type_id: {
                        $in: [
                            singleApplication.application,
                            singleApplication.marketing,
                            singleApplication.id
                        ]
                    }
                })
                break
            }
            case 'contract': {
                const contract = await storage.contract.findOne({ application: req.params.id })

                singleApplication = await storage.contract_state.findOne({
                    contract: contract.id,
                    user_type: 'user3',
                    status: { $in: ['01', '02', '03'] }
                })
                responses = await storage.response.find({
                    type_id: {
                        $in: [
                            contract.application,
                            contract.marketing,
                            contract.purchase,
                            contract.id
                        ]
                    }
                })
                break
            }
            case 'finished':
                {
                    const contract = await storage.contract.findOne({ application: req.params.id })

                    singleApplication = await storage.contract_state.findOne({
                        contract: contract.id,
                        user_type: 'user3',
                        status: '30'
                    })
                    responses = await storage.response.find({
                        type_id: {
                            $in: [
                                contract.application,
                                contract.marketing,
                                contract.purchase,
                                contract.id
                            ]
                        }
                    })
                }
                break

            default: {
                singleApplication = application
                responses = await storage.response.find({
                    type_id: application.id
                })
            }
        }

        res.status(200).json({
            success: true,
            data: {
                singleApplication,
                responses
            }
        })
    })

    // contract
    getContractInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals

        const [total, on_process, finished] = await Promise.all([
            ContractState.countDocuments({
                status: { $in: ['03', '15', 'finished'] },
                user_type: 'user3'
            }),
            ContractState.countDocuments({
                status: '03',
                user_type: 'user3'
            }),
            ContractState.countDocuments({ status: 'finished' })
        ])

        res.status(200).json({
            success: true,
            data: {
                total,
                on_process,
                finished
            }
        })
    })

    getAllContract = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals
        const { status, search, company, createdAt, finishedAt, skip = 1, limit = 10 } = req.body

        let filter: any = {}

        if (status) {
            if (status === 'process') {
                filter.status = { $ne: 'finished' }
            } else {
                filter.status = 'finished'
            }
        }
        if (search) {
            const regex = new RegExp(search, 'i')
            filter.product_name = { $regex: regex }
        }
        if (company) {
            filter.company = company
        }
        if (createdAt && finishedAt) {
            const startedDate: any = createdAt
            const start_date = new Date(startedDate)
            const endedDate: any = finishedAt
            const end_date = new Date(endedDate)
            filter.createdAt = {
                $gte: start_date,
                $lte: end_date
            }
        }

        const contracts = await Contract.find({ ...filter })
            .skip(skip - 1)
            .limit(limit)
            .populate([
                {
                    path: 'application',
                    populate: [
                        {
                            path: 'user',
                            populate: [{ path: 'branches', select: { name: 1 } }]
                        }
                    ]
                }
            ])

        const total = Math.ceil((await Contract.countDocuments({})) / limit)

        res.status(200).json({
            success: true,
            data: { total, contracts }
        })
    })

    getSingleContract = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals

        res.status(200).json({
            success: true,
            data: {}
        })
    })
}
