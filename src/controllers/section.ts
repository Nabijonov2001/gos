import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'

export class SectionController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const sections = await storage.section.find({ category: req.query.category_id })
        const units = await storage.unit.find({ section: sections[0] })

        res.status(200).json({
            success: true,
            data: {
                sections,
                units
            },
            message: message('section_getAll_200', lang)
        })
    })
}
