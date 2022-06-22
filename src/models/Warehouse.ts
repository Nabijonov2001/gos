import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IBranch } from './Branch'

export interface IWarehouse extends Document {
    _id: string
    branch: string | IBranch
    name: string
    cipher_code: string
}

const warehouseSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        branch: {
            type: String,
            required: true,
            ref: 'Branch'
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

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema)
