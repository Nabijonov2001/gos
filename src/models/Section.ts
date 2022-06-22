import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ISection extends Document {
    _id: string
    category: string
    order: number
    name: string
}

const sectionSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        category: {
            type: String,
            required: true,
            ref: 'Category'
        },
        order: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ISection>('Section', sectionSchema)
