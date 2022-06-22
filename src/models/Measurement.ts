import { Document, model, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IMeasurement extends Document {
    _id: string
    name: string
}

const MeasurementSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        name: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

export default model<IMeasurement>('Measurement', MeasurementSchema)
