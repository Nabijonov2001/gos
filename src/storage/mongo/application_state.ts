import { ApplicationStateRepo } from '../repo/application_state'
import ApplicationState, { IApplicationState } from '../../models/ApplicationState'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ApplicationStateStorage implements ApplicationStateRepo {
    private scope = 'storage.application_state'

    async find(query: Object): Promise<IApplicationState[]> {
        try {
            const application_states = await ApplicationState.find(query)
                .populate([
                    {
                        path: 'application',
                        populate: [
                            { path: 'user', populate: [{ path: 'branches', select: { name: 1 } }] },
                            { path: 'members' }
                        ]
                    }
                ])
                .sort({ createdAt: -1 })

            return application_states
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IApplicationState> {
        try {
            const application_state = await ApplicationState.findOne(query).populate([
                {
                    path: 'application',
                    populate: [
                        { path: 'user', populate: [{ path: 'branches', select: { name: 1 } }] },
                        { path: 'type' },
                        { path: 'category' },
                        { path: 'sections' },
                        { path: 'units' }
                    ]
                },
                {
                    path: 'members'
                }
            ])

            if (!application_state) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'application_state_404')
            }

            return application_state
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IApplicationState): Promise<IApplicationState> {
        try {
            const application_state = await ApplicationState.create(payload)

            return application_state
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IApplicationState): Promise<IApplicationState> {
        try {
            const application_state = await ApplicationState.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!application_state) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'application_state_404')
            }

            return application_state
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IApplicationState | Object): Promise<Object> {
        try {
            const application_states = await ApplicationState.updateMany(query, payload)

            return application_states
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IApplicationState> {
        try {
            const application_state = await ApplicationState.findOneAndDelete(query)

            if (!application_state) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'application_state_404')
            }

            return application_state
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
