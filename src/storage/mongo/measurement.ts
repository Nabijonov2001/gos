import { logger } from '../../config/logger'
import Measurement, { IMeasurement } from '../../models/Measurement'
import AppError from '../../utils/appError'
import { MeasurementRepo } from '../repo/measurement'

export class MeasurementStorage implements MeasurementRepo {
    private scope = 'storage.measurement'

    async find(query: Object): Promise<IMeasurement[]> {
        try {
            let measurements = await Measurement.find(query)

            return measurements
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IMeasurement): Promise<IMeasurement> {
        try {
            let measurement = await Measurement.create(payload)

            return measurement
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IMeasurement): Promise<IMeasurement> {
        try {
            let measurement = await Measurement.findOneAndUpdate(query, payload, { new: true })

            if (!measurement) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'measure_404')
            }
            return measurement
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IMeasurement> {
        try {
            let measurements = await Measurement.deleteMany(query)

            return measurements
        } catch (error) {
            logger.error(`${this.scope}.deleteMany: finished with error: ${error}`)
            throw error
        }
    }
}
