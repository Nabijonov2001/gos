import config from '../config/config'
import { MongoClient, ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const filter = {}
const client = new MongoClient(
    `mongodb://${config.MongoUser}:${config.MongoPassword}@127.0.0.1:${config.MongoPort}`
)

async function migrateSchema() {
    await client.connect()
    console.log('Connected correctly to server')

    const userC = client.db(config.MongoDatabase).collection('users')
    const notificationC = client.db(config.MongoDatabase).collection('notifications')

    const users = await userC.find(filter).toArray()

    for (let i = 0; i < users.length; i++) {
        const user = users[i]

        await notificationC.insertOne({
            _id: uuidv4() as unknown as ObjectId,
            user: user._id,
            user_type: user.type,
            request_count: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    return 'ok'
}

migrateSchema()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close())
