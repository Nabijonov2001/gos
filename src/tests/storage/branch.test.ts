import { IBranch } from '../../models/Branch'
import { BranchStorage } from '../../storage/mongo/branch'
import Database from '../../core/db'

const storage = new BranchStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.branch', () => {
    const branch = {
        _id: '8bf5fc5c-0558-408c-a12-5995dca952a0cd',
        name: 'Olmazor',
        cipher_code: '01'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new branch: success', () => {
        return storage.create(branch as IBranch).then((data) => {
            expect(data._id).toEqual(branch._id)
            expect(data.name).toEqual(branch.name)
        })
    })

    test('Get all branch: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one branch: success', () => {
        return storage.findOne({ _id: branch._id }).then((data) => {
            expect(data._id).toEqual(branch._id)
            expect(data.name).toEqual(branch.name)
        })
    })

    test('Get one branch: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update branch: success', () => {
        const name = 'Chilonzor'
        return storage.update(branch._id, { name } as IBranch).then((data) => {
            expect(data._id).toEqual(branch._id)
            expect(data.name).toEqual(name)
        })
    })

    test('Get update branch: fail', () => {
        const name = 'Name not updated'
        return storage.update(fake_id, { name } as IBranch).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete branch: succes', () => {
        return storage.delete(branch._id).then((data) => {
            expect(data._id).toEqual(branch._id)
        })
    })

    test('Get delete branch: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
