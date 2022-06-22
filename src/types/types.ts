import { Response } from 'express'

interface   ResponseWithUser extends Response{
    user:any
}
export {
    ResponseWithUser
}