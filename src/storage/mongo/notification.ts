import { NotificationRepo } from '../repo/notification'
import Notification, { INotification } from '../../models/Notification'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class NotificationStorage implements NotificationRepo {
    private scope = 'storage.notification'

    async findOne(query: Object): Promise<INotification> {
        try {
            const notification = await Notification.findOne(query)

            if (!notification) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'notification_404')
            }

            return notification
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: INotification): Promise<INotification> {
        try {
            const notification = await Notification.create(payload)

            return notification
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: Object): Promise<INotification> {
        try {
            const notification = await Notification.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!notification) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'notification_404')
            }

            return notification
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: Object): Promise<Object> {
        try {
            const notifications = await Notification.updateMany(query, payload)

            return notifications
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }
}
