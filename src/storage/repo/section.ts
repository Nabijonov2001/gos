import { ISection } from '../../models/Section'

export interface SectionRepo {
    find(query: Object, status?: string): Promise<ISection[]>
    findOne(query: Object): Promise<ISection>
    createMany(payload: ISection[]): Promise<Object>
    update(query: Object, payload: ISection): Promise<ISection>
    deleteMany(query: Object): Promise<any>
    delete(query: Object): Promise<ISection>
}
