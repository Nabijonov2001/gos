import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IChat extends Document {
    _id: string
    user: string
    request: string
    text: string
}

const chatSchema = new Schema(
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
        request: {
            type: String,
            ref: 'Request',
            required: true
        },
        text: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IChat>('Chat', chatSchema)
