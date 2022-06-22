import { ApplicationRepo } from '../repo/application'
import Application, { IApplication } from '../../models/Application'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ApplicationStorage implements ApplicationRepo {
    private scope = 'storage.application'

    async find(query: Object, page?: number): Promise<IApplication[]> {
        try {
            const applications = await Application.find(query)
                .sort({ createdAt: -1 })
                .populate('user', '-_id')

            return applications
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IApplication> {
        try {
            const application = await Application.findOne(query).populate([
                { path: 'user' },
                { path: 'type' },
                { path: 'category' },
                { path: 'sections' },
                { path: 'units' }
            ])

            if (!application) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'application_404')
            }

            return application
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IApplication): Promise<IApplication> {
        try {
            const application = await Application.create(payload)

            return application
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IApplication): Promise<IApplication> {
        try {
            const application = await Application.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!application) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'application_404')
            }

            return application
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IApplication> {
        try {
            const application = await Application.findOneAndDelete(query)

            if (!application) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'application_404')
            }

            return application
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
