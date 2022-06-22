import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IBidder extends Document {
    _id: string
    purchase: string
    main_docs: {
        original_name: string
        unique_name: string
    }[]
    requirement_operation: {
        requirement: string
        basis: {
            basisName: string
        }
        file: {
            original_name: string
            unique_name: string
        }
        score: number
        commissions: {
            id: string
            score: number
            description: string
        }[]
    }[]
}

const bidderSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        purchase: {
            type: String,
            required: true
        },
        main_docs: [
            {
                original_name: {
                    type: String,
                    required: true
                },
                unique_name: {
                    type: String,
                    required: true
                }
            }
        ],
        requirement_operation: [
            {
                requirement: {
                    type: String,
                    required: true,
                    ref: 'Requirement'
                },
                basis_name: String,
                file: {
                    original_name: String,
                    unique_name: String
                },
                score: {
                    type: Number,
                    default: 0
                },
                commissions: [
                    {
                        id: {
                            type: String,
                            ref: 'User'
                        },
                        score: Number,
                        description: String
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBidder>('Bidder', bidderSchema)
