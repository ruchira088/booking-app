const generateRandomString = () => Math.random().toString(36).slice(2)

const delay = (action, timeout = 1000) => new Promise(resolve => {
    setTimeout(() => {
        resolve(action())
    }, timeout)
})

module.exports = {
    generateRandomString,
    delay
}