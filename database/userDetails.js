const Sequelize = require("sequelize")
const {generateRandomString, delay} = require("../utils")
const {
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
    DB_DIALECT,
    DB_PORT,
    RECONNECTION_ATTEMPTS,
    RECONNECTION_DELAYS
} = require("./config")

const sanitizeUser = user => {
    const clonedUser = Object.assign({}, user)
    delete clonedUser.password
    delete clonedUser.id

    return clonedUser
}

const loginTokens = (() => {
    const tokenMap = new Map()

    const getUser = token => tokenMap.get(token)

    const addUser = username => {
        const token = generateRandomString()
        tokenMap.set(token, username)

        return token
    }

    const removeUser = token => tokenMap.delete(token)

    return {
        getUser,
        addUser,
        removeUser
    }
})()

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT
})

const User = sequelize.define("user", {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
})

const verifyDatabaseTable = (attempts = RECONNECTION_ATTEMPTS) =>
(
    sequelize.authenticate()
        .then(() => {
            console.log("Successfully connected to the database.")
            return User.sync()
        })
        .catch(err => {
            console.warn(`Unable to connect to the database: ${err}`)

            if(attempts >= 0) {
                console.log(`Attempting to connect to the database again. ${attempts} connection attempts remaining...`)
                return delay(() => verifyDatabaseTable(attempts - 1), RECONNECTION_DELAYS)
            } else {
                console.error("Database NOT available.")
                return Promise.reject(err)
            }
        })
)

const getUser = ({username, password}) =>
(
    User.findOne({
        where: {
            username,
            password
        }
    })
        .then(({dataValues: user}) =>
            sanitizeUser(Object.assign(user, {token: loginTokens.addUser(username)}))
        )
)

const addUser = ({firstName, lastName, username, password}) =>
(
    User.create({
        firstName, lastName, username, password
    })
    .then(() => {
        console.log(`Created user with username: ${username}`)
        return loginTokens.addUser(username)
    })
)

const logoutUser = userApiKey => loginTokens.removeUser(userApiKey)

const getUsernameFromUserKey = userKey => loginTokens.getUser(userKey)

module.exports = {
    getUser,
    addUser,
    getUsernameFromUserKey,
    logoutUser,
    verifyDatabaseTable
}