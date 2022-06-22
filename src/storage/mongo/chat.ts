import { logger } from '../../config/logger'
import Chat, { IChat } from '../../models/Chat'
import { ChatRepo } from '../repo/chat'

export class ChatStorage implements ChatRepo {
    private scope = 'storage.chat'

    async find(query: Object): Promise<IChat[]> {
        try {
            const chats = await Chat.find(query).populate('user', 'name').sort({ createdAt: 1 })

            return chats
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IChat): Promise<IChat> {
        try {
            const chat = await Chat.create(payload)

            return chat
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<Object> {
        try {
            const db_res = await Chat.deleteMany(query)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
