const express = require("express")
const bodyParser = require("body-parser")
const multer = require("multer")
const pg = require("pg")
const http = require("http")

const {addUser, verifyUserTable} = require("./database/userDetails")

const PORT = 8010

const app = express()

// TODO add multi-part data support 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post("/register", (request, response) => 
{
	const {
		firstName, 
		lastName,
		username,
		password
	} = request.body

	addUser({firstName, lastName, username, password})
		.then(() => 
		{
			response.json({success: true})
		})
})

app.post("/login", (request, response) => 
{
	const {username, password} = request.body

	

})

verifyUserTable().then(() => 
{
	http.createServer(app)
	.listen(PORT, () => 
	{
    	console.log(`Server is listening on port: ${PORT}`)
	})
})
