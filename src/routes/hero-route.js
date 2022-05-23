import {once} from 'node:events'
import Hero from "../entities/hero.js";
import {DEFAULT_HEADER} from "../util/util.js";
import {validateCreate, validateUpdate} from "../util/hero-validator.js";

const routes = ({heroService}) => ({
    '/heroes:get': async (req, res) => {
        const heroes = await heroService.find()
        res.write(JSON.stringify(heroes))
        res.end()
    },
    '/heroes:post': async (req, res) => {
        const data = String(await once(req, 'data'))
        const item = JSON.parse(data)
        const hero = new Hero(item)
        validateCreate(hero)
        const id = await heroService.create(hero)
        res.writeHead(201, DEFAULT_HEADER)
        res.write(JSON.stringify({
            id,
            message: 'Hero created with success'
        }))
        return res.end()
    },
    '/heroes:put': async (req, res) => {
        const data = String(await once(req, 'data'))
        const hero = JSON.parse(data)
        validateUpdate(hero)
        const id = await heroService.update(hero.id, hero)
        res.writeHead(!id ? 404 : 204, DEFAULT_HEADER)
        return res.end()
    },
    '/heroes:delete': async (req, res) => {
        const data = String(await once(req, 'data'))
        const {id} = JSON.parse(data)
        if (!id) {
            throw new Error('ID cannot be null')
        }
        const isDeleted = await heroService.delete(id)
        res.writeHead(isDeleted ? 204 : 404, DEFAULT_HEADER)
        return res.end()
    },
})

export {
    routes
}