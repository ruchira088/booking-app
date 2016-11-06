const {doTableExist, executeQuery} = require("./common")

const verifyUserTable = () => 
(
	doTableExist("user_details")
		.then(exists => 
		{
			if(!exists)
			{
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
	.then(({rows}) => 
	{
		const [user] = rows
		return user
	})
)

const addUser = ({firstName, lastName, username, password}) => 
(
	executeQuery(
		"INSERT INTO user_details VALUES ($1, $2, $3, $4);", 
		[firstName, lastName, username, password]
	)
)

module.exports = {
	getUser,
	addUser,
	verifyUserTable
}