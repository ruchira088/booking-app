const {doTableExist, executeQuery} = require("./common")
const {generateRandomString} = require("../utils")

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

const verifyUserTable = () =>
    (
        doTableExist("user_details")
            .then(exists => {
                if (!exists) {
                    console.log("Creating user_details TABLE.")

                    const query = `CREATE TABLE user_details ( 
					firstName VARCHAR(255), 
					lastName VARCHAR(255), 
					username VARCHAR(255), 
					password VARCHAR(255)
				);`

                    return executeQuery(query)
                }

                console.log("userdetails TABLE already exists.")
                return exists
            })
    )

const getUser = ({username, password}) =>
    (
        executeQuery("SELECT * FROM user_details WHERE username=$1 AND password=$2",
            [username, password])
            .then(({rows}) => {
                const [user] = rows
                const token = loginTokens.addUser(username)
                return Object.assign({}, user, {token})
            })
    )

const addUser = ({firstName, lastName, username, password}) =>
    (
        executeQuery(
            "INSERT INTO user_details VALUES ($1, $2, $3, $4);",
            [firstName, lastName, username, password]
        ).then(result =>
            loginTokens.addUser(username)
        )
    )

const logoutUser = userApiKey => loginTokens.removeUser(userApiKey)

const getUsernameFromUserKey = userKey => loginTokens.getUser(userKey)

module.exports = {
    getUser,
    addUser,
    getUsernameFromUserKey,
    logoutUser,
    verifyUserTable
}