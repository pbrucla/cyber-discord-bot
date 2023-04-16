const axios = require("axios")

const getEvents = async (start, finish, limit) => {

    try {
        const response = await axios.get("https://ctftime.org/api/v1/events/", {
            params: {
                limit,
                start,
                finish
            },
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0" }
        })

        return response.data
    } catch (err) {
        console.error(err)
    }

}

module.exports = {
    getEvents
}
