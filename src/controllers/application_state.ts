import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IApplicationState } from '../models/ApplicationState'
import { IResponse } from '../models/Response'
import { IMarketing } from '../models/Marketing'
import { IApplication } from '../models/Application'
import { Upload } from '../helpers/upload'

export class ApplicationStateController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let application_states

        if (role === 'admin') {
            application_states = await storage.application_state.find(req.query)
        } else if (['user4', 'user5', 'user11'].includes(role)) {
            application_states = await storage.application_state.find({
                user_type: role,
                status: { $ne: 'marketing' },
                selected_user: id,
                ...req.query
            })
        } else {
            application_states = await storage.application_state.find({
                user_type: role,
                status: { $ne: 'marketing' },
                ...req.query
            })
        }

        const responses = await storage.response.find({
            type: 'application',
            user_type: 'user4'
        })

        res.status(200).json({
            success: true,
            data: {
                application_states,
                responses
            },
            message: message('application_state_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id
        let application_state: IApplicationState

        if (['user4', 'user5', 'user11'].includes(role)) {
            application_state = await storage.application_state.findOne({ _id, selected_user: id })
        } else {
            application_state = await storage.application_state.findOne({ _id, user_type: role })
        }

        application_state.is_new = false
        application_state = await application_state.save()

        const application = application_state.application as IApplication
        const not_regex = new RegExp(`^(?!${application.cipher_code.slice(0, 12)})`)
        const regex = new RegExp(`^${application.cipher_code.slice(0, 12)}`)

        const same_products = await storage.product.find({ cipher_code: { $regex: regex } })
        const similar_products = await storage.product.find({
            category: application.category,
            cipher_code: { $regex: not_regex }
        })

        const responses = await storage.response.find({
            type_id: application._id,
            type: 'application'
        })

        res.status(200).json({
            success: true,
            data: {
                application_state,
                same_products,
                similar_products,
                responses
            },
            message: message('application_state_getOne_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals
        const { text, member_ids, product_ids, selected_user } = req.body
        let status = req.body.status

        let application_state = await storage.application_state.findOne({
            _id: req.params.id,
            user_type: role
        })

        const application = application_state.application as IApplication

        let response

        if (
            (application_state.status === status && status !== 'ask_sent') ||
            (status &&
                ![
                    'received',
                    'on_discussion',
                    'discussion_ended',
                    'ask_sent',
                    'ask_end',
                    'accepted'
                ].includes(application_state.status)) ||
            (role === 'user2' && !['approved', 'disapproved'].includes(status)) ||
            (status === 'disapproved' && !text) ||
            (role === 'user3' &&
                (![
                    'approved',
                    'on_discussion',
                    'discussion_ended',
                    'canceled',
                    'ask_sent',
                    'marketing'
                ].includes(status) ||
                    (status === 'ask_sent' && product_ids.length !== 1 && !text) ||
                    (status === 'approved' &&
                        product_ids &&
                        product_ids.length !== 1 &&
                        !text &&
                        (await storage.product.findOne({ _id: product_ids[0] }))) ||
                    (status === 'canceled' && !text))) ||
            ((role === 'user4' || role === 'user11') &&
                (!['approved', 'canceled'].includes(status) || !text)) ||
            (role === 'user4' && application_state.status === 'discussion_ended') ||
            (role === 'user5' && !['accepted', 'canceled'].includes(status))
        ) {
            return next(new AppError(400, 'application_state_400'))
        }

        if (role === 'user2') {
            if (status === 'approved') {
                await storage.application_state.create({
                    application: application.id,
                    user_type: 'user3'
                } as IApplicationState)
            } else {
                if (req.file) {
                    req.body.file = await Upload.uploadFile(req.file)
                }
                await storage.response.create({
                    user: id,
                    user_type: role,
                    type: 'application',
                    type_id: application.id,
                    text: text,
                    file: req.body.file,
                    status
                } as IResponse)

                application.status = status
                await application.save()
            }

            application_state.status = status
        } else if (role === 'user3') {
            if (status === 'on_discussion') {
                if (!member_ids.length) {
                    return next(new AppError(400, 'memeber ids are required'))
                }
                for (const member_id of member_ids) {
                    const user4 = await storage.user.findOne({
                        _id: member_id,
                        type: 'user4',
                        status: 'active'
                    })

                    await storage.application_state.create({
                        application: application.id,
                        user_type: 'user4',
                        selected_user: user4.id
                    } as IApplicationState)
                }

                application_state.members = member_ids
                application_state.is_new = true
            } else if (status === 'discussion_ended') {
                const responses_of_user4s = await storage.response.find({
                    type: 'application',
                    type_id: application.id,
                    user_type: 'user4'
                })

                if (!responses_of_user4s.length) {
                    return next(new AppError(400, 'You cannot end discussion yet.'))
                }

                if (req.file) {
                    req.body.file = await Upload.uploadFile(req.file)
                }
                await storage.response.create({
                    user: id,
                    user_type: role,
                    type: 'application',
                    type_id: application.id,
                    text: text,
                    file: req.body.file,
                    status: 'idle'
                } as IResponse)

                await storage.application_state.updateMany(
                    { application: application.id, status: 'received', user_type: 'user4' },
                    { status: 'discussion_ended' }
                )
                application_state.is_new = true
            } else if (status === 'ask_sent') {
                const user11 = await storage.user.findOne({
                    _id: selected_user,
                    type: 'user11',
                    status: 'active'
                })

                await storage.product.findOne({
                    _id: product_ids[0],
                    branch: user11.branches[0]
                })

                const responses = await storage.response.find({
                    type: 'application',
                    type_id: application.id,
                    user_type: 'user3',
                    products: product_ids
                })

                if (responses.length) {
                    return next(new AppError(400, 'Already asked from this user'))
                }

                await storage.application_state.create({
                    application: application.id,
                    user_type: user11.type,
                    selected_user: user11.id
                } as IApplicationState)

                application_state.selected_user = user11.id
                application_state.is_new = true
            } else if (status === 'approved') {
                const user5 = await storage.user.findOne({
                    _id: selected_user,
                    type: 'user5',
                    status: 'active'
                })

                await storage.application_state.create({
                    application: application.id,
                    user_type: 'user5',
                    selected_user: user5.id
                } as IApplicationState)

                application_state.selected_user = selected_user
                application_state.is_new = true
            } else if (status === 'canceled') {
                await storage.application_state.updateMany(
                    { application: application.id },
                    { status, is_new: true }
                )

                application.status = status
                await application.save()
            } else if (status === 'marketing') {
                await storage.user.findOne({ _id: selected_user, type: 'user2', status: 'active' })

                if (application_state.status !== 'accepted') {
                    return next(new AppError(400, 'application must be accepted'))
                }

                await storage.marketing.create({
                    application: application.id,
                    user: id,
                    market_researcher: selected_user,
                    date: req.body.date
                } as IMarketing)

                application_state.status = status
                application.status = status
                await application.save()
            }

            if (['approved', 'canceled', 'ask_sent'].includes(status)) {
                if (req.file) {
                    req.body.file = await Upload.uploadFile(req.file)
                }
                response = await storage.response.create({
                    user: id,
                    user_type: role,
                    type: 'application',
                    type_id: application.id,
                    text: text,
                    file: req.body.file,
                    status: status === 'canceled' ? 'disapproved' : status,
                    products: product_ids
                } as IResponse)
            }

            application_state.status = status
        } else if (role === 'user4') {
            if (product_ids) {
                for (const product_id of product_ids) {
                    await storage.product.findOne({ _id: product_id })
                }
            }
            if (req.file) {
                req.body.file = await Upload.uploadFile(req.file)
            }
            response = await storage.response.create({
                user: id,
                user_type: role,
                type: 'application',
                type_id: application.id,
                text: text,
                file: req.body.file,
                status: status === 'canceled' ? 'disapproved' : status,
                products: product_ids
            } as IResponse)

            const responses_of_user4s = await storage.response.find({
                type_id: application.id,
                user_type: 'user4'
            })

            const user3_application_state = await storage.application_state.findOne({
                application: application.id,
                user_type: 'user3'
            })

            if (user3_application_state.members.length === responses_of_user4s.length) {
                user3_application_state.status = 'discussion_ended'
                user3_application_state.is_new = true
                await user3_application_state.save()
            }

            application_state.status = status
        } else if (role === 'user5') {
            if (status === 'canceled') {
                await storage.application_state.updateMany(
                    { application: application.id },
                    { status, is_new: true }
                )
            } else {
                const user3_application_state = await storage.application_state.findOne({
                    application: application.id,
                    user_type: 'user3'
                })
                user3_application_state.status = status
                user3_application_state.is_new = true
                await user3_application_state.save()
            }

            if (req.file) {
                req.body.file = await Upload.uploadFile(req.file)
            }

            await storage.response.create({
                user: id,
                user_type: role,
                type: 'application',
                type_id: application.id,
                text: text,
                file: req.body.file,
                status: status === 'canceled' ? 'disapproved' : 'approved'
            } as IResponse)

            application_state.status = status
            application.status = status
            await application.save()
        } else if (role === 'user11') {
            if (!text) {
                return next(new AppError(400, 'application_state_update_400'))
            }

            const user3_application_state = await storage.application_state.findOne({
                application: application.id,
                user_type: 'user3'
            })
            if (req.file) {
                req.body.file = await Upload.uploadFile(req.file)
            }
            await storage.response.create({
                user: id,
                user_type: role,
                type: 'application',
                type_id: application.id,
                text,
                status: status === 'canceled' ? 'disapproved' : status
            } as IResponse)

            user3_application_state.status = 'ask_end'
            user3_application_state.is_new = true
            await user3_application_state.save()
            application_state.status = status
        }

        if (application_state) {
            application_state = await application_state.save()
        }

        res.status(200).json({
            success: true,
            data: {
                application_state,
                response
            },
            message: message('application_state_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { id } = req.params

        await storage.application_state.delete(id)

        res.status(200).json({
            success: true,
            message: message('application_state_delete_200', lang)
        })
    })

    deleteMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { id: application_id, user_id } = req.params

        let application_state = await storage.application_state.findOne({
            _id: application_id,
            user_type: 'user3',
            status: 'on_discussion'
        })

        const user4 = await storage.application_state.delete({
            application: application_state.application,
            selected_user: user_id,
            user_type: 'user4',
            status: 'received'
        })

        application_state.members = application_state.members.filter(
            (item: any) => item._id !== user_id
        )
        await application_state.save()

        res.status(200).json({
            success: true,
            message: message('member_deleted_200', lang)
        })
    })

    changeSelectedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { id: application_id } = req.params
        const { user_id } = req.body

        const user = await storage.user.findOne({ _id: user_id })

        if (user.type === 'user4') {
            let application_state = await storage.application_state.findOne({
                _id: application_id,
                user_type: 'user3',
                status: 'on_discussion'
            })

            if (application_state.members.includes(user_id)) {
                return next(new AppError(400, 'this user has already selected!'))
            }

            await storage.user.findOne({
                _id: user_id,
                type: 'user4',
                status: 'active'
            })

            const user4 = await storage.application_state.create({
                application: application_state.application,
                user_type: 'user4',
                selected_user: user_id
            } as IApplicationState)

            application_state.members.push(user4.selected_user)
            await application_state.save()
        } else if (user.type === 'user5') {
            let application_state = await storage.application_state.findOne({
                application: application_id,
                user_type: 'user3',
                status: 'approved'
            })

            await storage.application_state.create({
                application: application_state.application,
                user_type: 'user5',
                selected_user: user.id
            } as IApplicationState)

            application_state.selected_user = user.id
            await application_state.save()

            // deleting old user5
            await storage.application_state.delete({
                application: application_state.application,
                user_type: 'user5',
                status: 'received'
            })
        }

        res.status(200).json({
            success: true,
            message: message('member_add_200', lang)
        })
    })
}
