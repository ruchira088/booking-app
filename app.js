const express = require("express")
const bodyParser = require("body-parser")
const multer = require("multer")
const pg = require("pg")
const http = require("http")
const PORT = 8010

const {
    addUser,
    verifyDatabaseTable,
    getUser,
    getUsernameFromUserKey,
    logoutUser
} = require("./database/userDetails")

const constants = require("./constants")
const {USER_API_KEY} = constants.keys
const {
    INCLUDE_USER_API_KEY,
    INVALID_CREDENTIALS,
    INVALID_USER_API_KEY
} = constants.messages

const app = express()

// TODO add multi-part data support 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post("/register", (request, response) => {
    const {
        firstName,
        lastName,
        username,
        password
    } = request.body

    addUser({firstName, lastName, username, password})
        .then(() => {
            response.json({success: true})
        })
})

app.post("/login", (request, response) => {
    const {username, password} = request.body

    getUser({username, password})
        .then(result => {
            response.json(result)
        })
        .catch(() => {
            response.json({error: INVALID_CREDENTIALS})
        })
})

app.use((request, response, next) => {
    const userApiKey = request.get(USER_API_KEY)

    if(userApiKey) {
        const username = getUsernameFromUserKey(userApiKey)

        if(username) {
            request.username = username
            next()
        } else {
            response.status(401).json({error: INVALID_USER_API_KEY})
        }
    } else {
        response.status(400).json({error: INCLUDE_USER_API_KEY})
    }
})

app.get("/logout", (request, response) => {
    const {username} = request
    const userApiKey = request.get(USER_API_KEY)

    logoutUser(userApiKey)
    response.json({result: `${username} was logged out.`})
})

verifyDatabaseTable().then(() => {
    http.createServer(app)
        .listen(PORT, () => {
            console.log(`Server is listening on port: ${PORT}`)
        })
})
