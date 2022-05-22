import HeroRepository from "../repositories/hero-repository.js";
import HeroService from "../services/hero-service.js";

const generateInstance = ({filePath}) => {
    const heroRepository = new HeroRepository({filePath})
    return new HeroService({heroRepository})
}

export {
    generateInstance
}