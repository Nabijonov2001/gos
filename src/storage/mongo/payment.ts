import { PaymentRepo } from '../repo/payment'
import Payment, { IPayment } from '../../models/Payment'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class PaymentStorage implements PaymentRepo {
    private scope = 'storage.payment'

    async find(query: Object): Promise<IPayment[]> {
        try {
            const payments = await Payment.find({ ...query })

            return payments
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IPayment> {
        try {
            const payment = await Payment.findOne({ ...query })

            if (!payment) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'sample_404')
            }

            return payment
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IPayment): Promise<IPayment> {
        try {
            const payment = await Payment.create(payload)

            return payment
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(id: string, payload: IPayment): Promise<IPayment> {
        try {
            const payment = await Payment.findByIdAndUpdate(id, payload, {
                new: true
            })

            if (!payment) {
                logger.warn(`${this.scope}.update failed to findByIdAndUpdate`)
                throw new AppError(404, 'sample_404')
            }

            return payment
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(id: string): Promise<any> {
        try {
            const payment = await Payment.findByIdAndDelete(id)

            if (!payment) {
                logger.warn(`${this.scope}.delete failed to findByIdAndDelete`)
                throw new AppError(404, 'sample_404')
            }

            return payment
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
