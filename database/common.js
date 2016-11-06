const pg = require("pg")
const {dbConfig} = require("./config")

const connectionPool = new pg.Pool(dbConfig)

const executeQuery = (query, params) =>
    (
        new Promise((resolve, reject) => {
            connectionPool.connect((error, client, done) => {
                if (error) {
                    console.error("Error fetching connection from pool", error)
                    reject(error)
                    return
                }

                client.query(query, params, (error, result) => {
                    done()

                    if (error) {
                        console.error("Error executing query", error)
                        reject(error)
                        return
                    }

                    resolve(result)
                })
            })
        })
    )

const doTableExist = tableName =>
    (
        executeQuery(`SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE table_name='${tableName}'`)
            .then(({rows: [result]}) => result.count > 0)
    )

module.exports = {
    executeQuery,
    doTableExist
}