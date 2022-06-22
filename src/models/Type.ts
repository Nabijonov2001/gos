import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IType extends Document {
    _id: string
    icon: string
    name: string
    cipher_code: string
}

const typeSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        icon: {
            type: String
        },
        name: {
            type: String,
            required: true
        },
        cipher_code: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IType>('Type', typeSchema)
