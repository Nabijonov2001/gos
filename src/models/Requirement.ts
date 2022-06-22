import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IRequirement extends Document {
    _id: string
    purchase: string
    name: string
    score: number
    share: number
}

const requirementSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        purchase: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        share: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IRequirement>('Requirement', requirementSchema)
