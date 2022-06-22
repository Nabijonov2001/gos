import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IUser } from './User'
export interface IRequest extends Document {
    _id: string
    user: string | IUser
    type: string
    name: string
    description: string
    sup_type: string
    section: string
}

const requestSchema = new Schema(
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
        type: {
            type: String,
            required: true,
            enum: ['category', 'unit', 'warehouse', 'branch']
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        sup_type: {
            type: String
        },
        section: {
            type: String,
            ref: 'Section'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IRequest>('Request', requestSchema)
