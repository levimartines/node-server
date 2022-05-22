import test from 'node:test'
import {routes} from "../../src/routes/hero-route.js";
import assert from "node:assert";

const callTracker = new assert.CallTracker()
process.on('exit', () => callTracker.verify())

test('Hero routes Unit Tests suite', async (t) => {

    await t.test('Should call /heroes:get route', async (t) => {
        const dbMock = [{
            "id": "6022eded-c054-4060-87ba-0e8b20d879ef",
            "name": "Batman",
            "age": 50,
            "power": "rich"
        }]
        const heroServiceStub = {
            find: async () => dbMock
        }
        const endpoints = routes({heroService: heroServiceStub})

        const endpoint = '/heroes:get'
        const request = {}
        const response = {
            write: callTracker.calls(item => {
                const expected = JSON.stringify(dbMock)
                assert.strictEqual(item, expected, 'Write method should be called with the correct payload')
            }),
            end: callTracker.calls(item => {
                assert.strictEqual(item, undefined, 'End method should be callend without parameters')
            })
        }

        const route = endpoints[endpoint]
        await route(request, response)
    })
    await t.todo('Should call /heroes:get route')
})