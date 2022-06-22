import { ICompany } from '../../models/Company'

export interface CompanyRepo {
    find(query: Object): Promise<ICompany[]>
    findOne(query: Object): Promise<ICompany>
    create(payload: ICompany): Promise<ICompany>
    update(query: Object, payload: ICompany): Promise<ICompany>
    delete(query: Object): Promise<ICompany>
}
