import { SectionRepo } from '../repo/section'
import Section, { ISection } from '../../models/Section'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class SectionStorage implements SectionRepo {
    private scope = 'storage.section'

    async find(query: Object, status?: string): Promise<ISection[]> {
        try {
            let sections: ISection[]

            if (status === 'last') {
                sections = await Section.find(query).sort({ createdAt: -1 }).limit(1)
            } else {
                sections = await Section.find(query).sort({ order: 1 })
            }

            return sections
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ISection> {
        try {
            const section = await Section.findOne(query)

            if (!section) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'section_404')
            }

            return section
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async createMany(payload: ISection[]): Promise<ISection[]> {
        try {
            const sections = await Section.insertMany(payload)

            return sections
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: ISection): Promise<ISection> {
        try {
            const section = await Section.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!section) {
                logger.warn(`${this.scope}.update failed type_id findByIdAndUpdate`)
                throw new AppError(404, 'section_404')
            }

            return section
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<any> {
        try {
            const db_res = await Section.deleteMany(query)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<ISection> {
        try {
            const section = await Section.findOneAndDelete(query)

            if (!section) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'section_404')
            }

            return section
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
