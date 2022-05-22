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

    async update(id, {name, age, power}) {
        const currentFile = await this.#currentFileContent()
        const indexToUpdate = currentFile.findIndex(hero => hero.id === id)
        if (indexToUpdate === -1) {
            return null;
        }
        const hero = currentFile[indexToUpdate]
        hero.name = name
        hero.age = age
        hero.power = power
        await writeFile(this.filePath, JSON.stringify(currentFile))
        return hero.id
    }

}
