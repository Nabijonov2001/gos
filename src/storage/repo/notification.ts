import { INotification } from '../../models/Notification'

export interface NotificationRepo {
    findOne(query: Object): Promise<INotification>
    create(payload: INotification): Promise<INotification>
    update(query: Object, payload: Object): Promise<INotification>
    updateMany(query: Object, payload: Object): Promise<Object>
}
