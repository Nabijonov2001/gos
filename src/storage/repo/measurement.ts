import { IMeasurement } from '../../models/Measurement'

export interface MeasurementRepo {
    find(query: Object): Promise<IMeasurement[]>
    create(payload: IMeasurement): Promise<IMeasurement>
    update(query: Object, payload: IMeasurement): Promise<IMeasurement>
    delete(query: Object): Promise<IMeasurement>
}
