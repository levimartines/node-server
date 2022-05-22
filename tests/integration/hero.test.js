import test from 'node:test'
import assert from 'node:assert'
import {promisify} from 'node:util'

test('Hero Integration Test Suite', async (t) => {
    const testPort = '9009'

    process.env.PORT = testPort

    const {server} = await import('../../src/index.js')
    const testServerAddress = `http://localhost:${testPort}/heroes`

    async function createHero({name, age, power}) {
        const data = {name, age, power};
        const request = await fetch(testServerAddress, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        assert.deepStrictEqual(request.headers.get('content-type'), 'application/json', 'Should return a JSON')
        assert.strictEqual(request.status, 201, 'Should return 201')

        const result = await request.json()
        assert.deepStrictEqual(result.message, 'Hero created with success', 'Should return a valid message')
        const {id} = result
        assert.ok(id.length === 36, 'Should return a valid UUID')
        return {
            id, name, age, power
        }
    }

    await t.test('Should create a hero', async (t) => {
        const data = {
            name: 'Batman',
            age: 50,
            power: 'rich'
        }
        await createHero(data)
    })

    await t.test('Should find all heroes', async (t) => {
        const flash = await createHero({
            name: 'Flash',
            age: 22,
            power: 'fast'
        })
        const kratos = await createHero({
            name: 'Kratos',
            age: 38,
            power: 'God of War'
        })
        const request = await fetch(testServerAddress, {method: 'GET'})

        assert.strictEqual(request.status, 200, 'Should return 200')
        const result = await request.json()

        assert.ok(result.length > 2, 'Response should contain at least 2 heroes')

        const resultFlash = result.find(hero => hero.id === flash.id)
        assert.ok(resultFlash, 'Response should contain the saved Flash hero')

        const resultKratos = result.find(hero => hero.id === kratos.id)
        assert.ok(resultKratos, 'Response should contain the saved Flash hero')
    })

    await promisify(server.close.bind(server))()
})