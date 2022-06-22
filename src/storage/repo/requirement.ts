import { IRequirement } from '../../models/Requirement'

export interface RequirementRepo {
    findOne(query: Object): Promise<IRequirement>
    find(query: Object): Promise<IRequirement[]>
    create(payload: IRequirement): Promise<IRequirement>
    delete(query: Object): Promise<IRequirement>
}
