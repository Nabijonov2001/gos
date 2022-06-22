import dotenv from 'dotenv'

dotenv.config()

interface Config {
    HttpPort: string
    MongoUser: string
    MongoPassword: string
    MongoPort: number
    MongoDatabase: string
    JwtSecret: string
    NodeEnv: string
}

let config: Config = {
    HttpPort: getConf('PORT', '7000'),
    MongoUser: getConf('MONGO_USER', 'gos-admin'),
    MongoPassword: getConf('MONGO_PASSWORD', 'gos-super-pwd'),
    MongoPort: parseInt(getConf('MONGO_PORT', '27217')),
    MongoDatabase: getConf('MONGO_DATABASE', 'gos-project'),
    JwtSecret: getConf('JWT_SECRET', 'my_secret'),
    NodeEnv: getConf('NODE_ENV', 'development')
}

function getConf(name: string, def: string = ''): string {
    if (process.env[name]) {
        return process.env[name] || ''
    }

    return def
}

export default config
