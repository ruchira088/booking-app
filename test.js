const {verifyUserTable, addUser, getUser} = require("./database/userDetails")

verifyUserTable()
	// .then(() => 
	// 	addUser({
	// 		firstName: "Jane",
	// 		lastName: "Doe",
	// 		username: "john",
	// 		password: "john123"
	// 	})
	// )
	// .then(() =>
	// {
	// 	console.log("Successfully created user.")
	// })
	.then(() => 
		getUser({username: "john", password: "john123"})
	)
	.then(({rows}) => 
	{
		const [user] = rows
		return user
	})
	.then(console.log)

