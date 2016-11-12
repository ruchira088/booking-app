const Sequelize = require("sequelize")
const {generateRandomString} = require("../utils")
const {
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
    DB_DIALECT,
    DB_PORT
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

const verifyDatabaseTable = () =>
(
    sequelize.authenticate()
        .then(() => {
            console.log("Successfully connected to the database.")

            return User.sync()
        })
        .catch(err => {
            console.error(`Unable to connect to the database: ${err}`)
            return Promise.reject(err)
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