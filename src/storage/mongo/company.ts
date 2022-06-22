import { CompanyRepo } from '../repo/company'
import Company, { ICompany } from '../../models/Company'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class CompanyStorage implements CompanyRepo {
    private scope = 'storage.company'

    async find(query: Object): Promise<ICompany[]> {
        try {
            let companies = await Company.find({ ...query }).sort({ createdAt: -1 })

            return companies
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ICompany> {
        try {
            let company = await Company.findOne({ ...query })

            if (!company) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: ICompany): Promise<ICompany> {
        try {
            let company = await Company.create(payload)

            return company
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: ICompany): Promise<ICompany> {
        try {
            let company = await Company.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!company) {
                logger.warn(`${this.scope}.update failed to findByIdAndUpdate`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<any> {
        try {
            let company = await Company.findOneAndDelete(query)

            if (!company) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
