import {readFile, writeFile} from 'node:fs/promises'

export default class HeroRepository {
    constructor({filePath}) {
        this.filePath = filePath
    }

    async #currentFileContent() {
        return JSON.parse(await readFile(this.filePath))
    }

    find() {
        return this.#currentFileContent()
    }

    async create(data) {
        const currentFile = await this.#currentFileContent()
        currentFile.push(data)
        await writeFile(this.filePath, JSON.stringify(currentFile))
        return data.id
    }

}
