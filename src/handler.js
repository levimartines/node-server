import {fileURLToPath, parse} from 'node:url'
import {dirname, join} from 'node:path'
import {DEFAULT_HEADER} from "./util/util.js";
import {routes} from "./routes/hero-route.js";
import {generateInstance} from "./factories/hero-factory.js";

const currentDir = dirname(fileURLToPath(import.meta.url))
const filePath = join(currentDir, '../database', 'data.json')
const heroService = generateInstance({filePath})
const heroRoutes = routes({heroService})

const allRoutes = {
    ...heroRoutes,
    default: (req, res) => {
        res.writeHead(404, DEFAULT_HEADER)
        res.write('Oooooops! Not found!')
        res.end()
    }
}

function handler(req, res) {
    const {url, method} = req
    const {pathname} = parse(url, true)

    const key = `${pathname}:${method.toLowerCase()}`
    const route = allRoutes[key] || allRoutes.default
    return Promise.resolve(route(req, res))
        .catch(handlerError(res))
}

function handlerError(res) {
    return error => {
        console.error('Some error happened: ', error.stack)
        res.writeHead(500, DEFAULT_HEADER)
        res.write(JSON.stringify({
            error: error.message
        }))
        return res.end()
    }
}

export default handler;