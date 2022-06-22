import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IUser } from './User'

export interface ICommission extends Document {
    _id: string
    user: string | IUser
    added_base_doc: {
        original_name: string
        unique_name: string
    }
    removed_base_doc: {
        original_name: string
        unique_name: string
    }
    reason: string
    is_commission: boolean
}

const commissionSchema = new Schema(
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
        added_base_doc: {
            original_name: {
                type: String,
                required: true
            },
            unique_name: {
                type: String,
                required: true
            }
        },
        removed_base_doc: {
            original_name: {
                type: String
            },
            unique_name: {
                type: String
            }
        },
        reason: {
            type: String,
            required: true
        },
        is_commission: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICommission>('Commission', commissionSchema)
