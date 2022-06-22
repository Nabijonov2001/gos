import { IUser } from '../../models/User'
import { UserStorage } from '../../storage/mongo/user'
import Database from '../../core/db'

const storage = new UserStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.admin', () => {
    const admin = {
        _id: '38b8acbf-c1db-4341-a2fd-2302ba977d6c',
        full_name: 'Johy Jon',
        user_name: 'Hugo',
        phone_number: 9900712221,
        password: '123rt1y',
        type: 'admin'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new admin: succes', () => {
        return storage.create(admin as IUser).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get all admin: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one admin: success', () => {
        return storage.findOne({ _id: admin._id }).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get one admin: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update admin: success', () => {
        const full_name = 'John Don'

        return storage.update(admin._id, { full_name } as IUser).then((data) => {
            expect(data._id).toEqual(admin._id)
            expect(data.full_name).toEqual(full_name)
        })
    })

    test('Get update admin: fail', () => {
        const full_name = 'John Don'

        return storage.update(fake_id, { full_name } as IUser).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete admin: succes', () => {
        return storage.delete(admin._id).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get delete admin: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
