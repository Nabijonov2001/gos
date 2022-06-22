import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IUser extends Document {
    _id: string
    full_name: string
    phone_number: number
    user_name: string
    password: string
    position: string
    branches: string[]
    type: string
    is_commission_member: boolean
    photo: string
    language: string
    status: string
}

const userSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        full_name: {
            type: String,
            required: true
        },
        phone_number: {
            type: Number,
            required: true,
            unique: true
        },
        user_name: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        branches: {
            type: [String],
            ref: 'Branch'
        },
        type: {
            type: String,
            enum: [
                'super_admin',
                'admin',
                'user1',
                'user2',
                'user3',
                'user4',
                'user5',
                'user8',
                'user9',
                'user11',
                'user12',
                'user16'
            ],
            required: true
        },
        is_commission_member: {
            type: Boolean,
            default: false
        },
        photo: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'blocked'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IUser>('User', userSchema)
