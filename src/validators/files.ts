import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class FilesValidator {
    private deleteSingleFile = Joi.object({
        doc: Joi.string().required()
    })

    private deleteMultipleFiles = Joi.object({
        docs: Joi.array().items(Joi.string()).required()
    })

    deleteSingle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.deleteSingleFile.validate(req.body)
        if (error) return next(error)

        next()
    })

    deleteMultiply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.deleteMultipleFiles.validate(req.body)
        if (error) return next(error)

        next()
    })
}
