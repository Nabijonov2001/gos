import { RequirementRepo } from '../repo/requirement'
import Requirement, { IRequirement } from '../../models/Requirement'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class RequirementStorage implements RequirementRepo {
    private scope = 'storage.requirement'

    async find(query: Object): Promise<IRequirement[]> {
        try {
            const requirements = await Requirement.find(query)

            return requirements
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IRequirement> {
        try {
            const requirement = await Requirement.findOne(query)

            if (!requirement) {
                logger.warn(`${this.scope}.findOne failed type_id findOne`)
                throw new AppError(404, 'requirement_404')
            }

            return requirement
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error`, error)
            throw error
        }
    }

    async create(payload: IRequirement): Promise<IRequirement> {
        try {
            const requirement = await Requirement.create(payload)

            return requirement
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IRequirement> {
        try {
            const requirement = await Requirement.findOneAndDelete(query)

            if (!requirement) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'requirement_404')
            }

            return requirement
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
