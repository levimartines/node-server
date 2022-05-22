import test from 'node:test'
import assert from 'node:assert'
import {promisify} from 'node:util'

test('Hero Integration Test Suite', async (t) => {
    const testPort = '9009'

    process.env.PORT = testPort

    const {server} = await import('../../src/index.js')
    const testServerAddress = `http://localhost:${testPort}/heroes`

    async function postHero(hero) {
        return await fetch(testServerAddress, {
            method: 'POST',
            body: JSON.stringify(hero)
        })
    }

    async function createHero({name, age, power}) {
        const data = {name, age, power};
        const request = await postHero(data)
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

    await t.test('Should validate hero creation', async (t) => {
        const hero = {
            name: '',
            age: null,
            power: ''
        }
        let request = await postHero(hero)
        assert.deepStrictEqual(request.headers.get('content-type'), 'application/json', 'Should return a JSON')
        assert.strictEqual(request.status, 500, 'Should return 500')

        let body = await request.json()
        assert.strictEqual(body.error, 'Hero name cannot be null or empty', 'Should return the respective error message')

        hero.name = 'Spider Man'
        request = await postHero(hero)
        body = await request.json()
        assert.strictEqual(body.error, 'Hero age cannot be null or less than 0', 'Should return the respective error message')

        hero.age = 18
        request = await postHero(hero)
        body = await request.json()
        assert.strictEqual(body.error, 'Hero power cannot be null or empty', 'Should return the respective error message')
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

    await t.test('Should update a hero', async (t) => {
        const data = {
            name: 'Aquaman',
            age: 32,
            power: 'talk with fishes'
        }
        let {id} = await createHero(data)
        data.id = id
        data.age = 38
        const request = await fetch(testServerAddress, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
        assert.strictEqual(request.status, 204, 'Should return 204')
    })

    await t.test('Should validate hero update', async (t) => {
        const data = {
            name: 'Fallen',
            age: 32,
            power: 'CSGO god'
        }
        let request = await fetch(testServerAddress, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
        assert.strictEqual(request.status, 500, 'Should return 500')

        data.id = "aRandomUUID"
        request = await fetch(testServerAddress, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
        assert.strictEqual(request.status, 404, 'Should return 404')
    })

    await t.test('Should return the default route', async (t) => {
        const request = await fetch(testServerAddress, {method: 'PATCH'})
        assert.deepStrictEqual(request.headers.get('content-type'), 'application/json', 'Should return a JSON')
        assert.strictEqual(request.status, 404, 'Should return 404 status')

        const response = await request.text()
        assert.equal(response, 'Oooooops! Not found!', 'Should return the default error message')
    })

    await promisify(server.close.bind(server))()
})