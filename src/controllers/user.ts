import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import sharp from 'sharp'
import { unlink } from 'fs/promises'
import { message } from '../locales/get_message'
import { compare, hash, genSalt } from 'bcrypt'
import { signToken } from '../middleware/auth'
import { INotification } from '../models/Notification'

export class AdminController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals

        const users = await storage.user.find({ ...req.body, type: { $ne: 'super_admin' } })

        res.status(200).json({
            success: true,
            data: {
                users
            },
            message: message('user_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals
        const _id = req.params.id
        const user = await storage.user.findOne({ _id })

        if (role.startsWith('user') && _id !== id) {
            return next(new AppError(401, 'user_401'))
        }

        const branches = await storage.branch.find({})

        res.status(200).json({
            success: true,
            data: {
                user,
                branches
            },
            message: message('user_getOne_200', lang)
        })
    })

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { user_name, password } = req.body

        const user = (await storage.user.find({ user_name }))[0]

        if (
            !user ||
            ['inactive', 'blocked'].includes(user.status) ||
            !(await compare(password, user.password))
        ) {
            return next(new AppError(401, 'auth_401'))
        }

        const token =
            user.type === 'admin' || user.type === 'super_admin'
                ? await signToken(user.id, 'admin')
                : await signToken(user.id, user.type)

        res.status(200).json({
            success: true,
            data: {
                user,
                token
            },
            message: message('user_login_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role } = res.locals
        const { password, branch_ids, type } = req.body
        if (['user1', 'user11'].includes(role)) {
            const user = await storage.user.find({ type: role, branches: branch_ids })
            if (user.length) {
                return next(new AppError(400, 'user_create_400'))
            }
        }
        if (type !== 'admin') {
            for (const branch_id of branch_ids) {
                await storage.branch.findOne({ _id: branch_id })
            }
        }

        req.body.branches = branch_ids

        const salt = await genSalt()
        const hashed_password = await hash(password, salt)

        const user = await storage.user.create({ ...req.body, password: hashed_password })

        await storage.notification.create({
            user: user.id,
            user_type: user.type
        } as INotification)

        res.status(201).json({
            success: true,
            data: {
                user
            },
            message: message('user_create_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang, role } = res.locals
        const _id = req.params.id
        const { branch_ids, is_commission_member, new_password, old_password, status } = req.body

        const active_user = await storage.user.findOne({ _id: id })
        let user = await storage.user.findOne({ _id })

        if (['active', 'blocked'].includes(status) && user.status === 'inactive') {
            return next(new AppError(400, 'user_update_400'))
        }

        if (['user1', 'user11'].includes(role)) {
            const user = await storage.user.find({ type: role, branches: branch_ids })
            if (user.length) {
                return next(new AppError(400, 'user_update_400'))
            }
        }

        if (
            (role.startsWith('user') || (role === 'admin' && active_user.type === 'admin')) &&
            id !== _id
        ) {
            return next(new AppError(403, 'user_update_403'))
        }

        if (new_password) {
            console.log(role, user.type)
            if (
                (role.startsWith('user') && id !== _id) ||
                (role == 'admin' && active_user.type == 'admin' && id !== _id) ||
                (active_user.type !== 'super_admin' &&
                    (!old_password || !(await compare(old_password, user.password))))
            ) {
                return next(new AppError(400, 'user_updat_400'))
            }

            const salt = await genSalt()
            req.body.password = await hash(new_password, salt)
        }

        if (branch_ids && `${branch_ids}` !== `${user.branches}`) {
            for (const branch_id of branch_ids) {
                await storage.branch.findOne({ _id: branch_id })
            }
            req.body.branches = branch_ids
        }

        user = await storage.user.update({ _id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                user
            },
            message: message('user_update_200', lang)
        })
    })

    newPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {})

    uploadPhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang } = res.locals

        if (!req.file) {
            return next(new AppError(400, 'user_photo_400'))
        }

        const photo = `photos/${req.file.fieldname}-${uuidv4()}`

        await sharp(req.file.buffer)
            .webp()
            .toFile(path.join(__dirname, '../../../uploads', `${photo}.webp`))

        let user = await storage.user.findOne({ _id: id })

        if (user.photo) {
            await unlink(path.join(__dirname, '../../../uploads', user.photo))
        }

        user.photo = `${photo}.webp`

        user = await user.save()

        res.status(201).json({
            success: true,
            data: {
                user
            },
            message: message('user_photo_200', lang)
        })
    })

    deletePhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang } = res.locals

        let user = await storage.user.findOne({ _id: id })

        if (user.photo) {
            await unlink(path.join(__dirname, '../../../uploads', user.photo))
        }

        user.photo = ''
        user = await user.save()

        res.status(201).json({
            success: true,
            data: {
                user
            },
            message: message('user_photo_200', lang)
        })
    })

    createSuperAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body

        const salt = await genSalt()
        const hashed_password = await hash(password, salt)

        const user = await storage.user.create({
            ...req.body,
            password: hashed_password,
            type: 'super_admin'
        })

        const token = await signToken(user.id, 'admin')

        res.status(201).json({
            success: true,
            data: {
                user,
                token
            }
        })
    })
}
