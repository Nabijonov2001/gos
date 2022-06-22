import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IApplication } from './Application'

export interface IApplicationState extends Document {
    _id: string
    is_new: boolean
    application: string | IApplication
    user_type: string
    status: string
    selected_user: string
    members: string[]
}

const applicationStateSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        is_new: {
            type: Boolean,
            default: true
        },
        application: {
            type: String,
            ref: 'Application',
            required: true
        },
        user_type: {
            type: String
        },
        status: {
            type: String,
            enum: [
                'received',
                'approved',
                'accepted',
                'disapproved',
                'canceled',
                'on_discussion',
                'discussion_ended',
                'ask_sent',
                'ask_end',
                'executed',
                'marketing'
            ],
            default: 'received'
        },
        selected_user: {
            type: String,
            ref: 'User'
        },
        members: {
            type: [String],
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IApplicationState>('ApplicationState', applicationStateSchema)
