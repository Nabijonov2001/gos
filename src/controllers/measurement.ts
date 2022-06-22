import { NextFunction, Request, Response } from 'express'
import { message } from '../locales/get_message'
import { IMeasurement } from '../models/Measurement'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'

export class MeasurementController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        const measurements = await storage.measurement.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                measurements
            },
            message: message('mesurement_getAll_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        const measurement = await storage.measurement.create({ ...req.body } as IMeasurement)

        res.status(201).json({
            success: true,
            data: {
                measurement
            },
            message: message('mesurement_create_201', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        const measurement = await storage.measurement.update({ _id: req.params.id }, {
            name: req.body.name
        } as IMeasurement)

        res.status(200).json({
            success: true,
            data: {
                measurement
            },
            message: message('mesurement_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { measurement_id } = req.body

        await storage.measurement.delete({ _id: measurement_id })

        res.status(200).json({
            success: true,
            message: message('mesurement_delete_200', lang)
        })
    })
}
