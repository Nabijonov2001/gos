import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface INotification extends Document {
    _id: string
    user: string
    user_type: string
    request_count: string
}

const notificationSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        user: {
            type: String,
            ref: 'User',
            required: true
        },
        user_type: {
            type: String,
            required: true
        },
        request_count: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<INotification>('Notification', notificationSchema)
