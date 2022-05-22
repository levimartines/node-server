const validate = ({name, age, power}) => {
    if (!name) {
        throw new Error('Hero name cannot be null or empty')
    }
    if (!age || age < 0) {
        throw new Error('Hero age cannot be null or less than 0')
    }
    if (!power) {
        throw new Error('Hero power cannot be null or empty')
    }
}

export {
    validate
}