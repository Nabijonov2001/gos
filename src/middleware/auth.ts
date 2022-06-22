import { NextFunction, Request, Response } from 'express'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { storage } from '../storage/main'
import { ResponseWithUser } from '../types/types'

type DecodedToken = {
    id: string
    role: string
}

export const signToken = async (id: string, role: string): Promise<string> => {
    return jwt.sign({ id, role }, config.JwtSecret)
}

export const decodeToken = async (token: string): Promise<DecodedToken> => {
    const decoded = (await jwt.verify(token, config.JwtSecret)) as DecodedToken
    return decoded
}

export class AuthMiddleware {
    auth = (roles: string[]) => {
        return catchAsync(async (req: Request, res: ResponseWithUser, next: NextFunction) => {
            const token = req.headers.authorization

            if (!token) {
                return next(new AppError(401, 'auth_401'))
            }

            const decoded = decodeToken(token)
            const role = (await decoded).role
            console.log(role)
            const id = (await decoded).id
            if (!roles.includes(role)) {
                return next(new AppError(401, 'auth_401'))
            }
            const user = await storage.user.findOne({ _id: id, status: 'active' })
            res.locals.id = id
            res.locals.role = role
            res.locals.type = user.type
            next()
        })
    }
}
