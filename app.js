const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

app.post("/resetDb", (req, res) => {
    res.setHeader("Content-type", "application/text")
    fs.readFile(__dirname + '/db-initial.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        fs.writeFile(__dirname + '/db.json', data, (err_w) => {
            if (err_w) {
                console.log(err_w);
                res.send("Something was wrong!")
                return;
            }
            res.status = 200;
            res.send("Database reset!");
        })
    })
})

app.get("/api/designOrders", (req, res) => {
    fs.readFile(__dirname + '/db.json', 'utf-8', (err, data) => {
        let dataObject = JSON.parse(data);
        let responseString = JSON.stringify(dataObject.solarDesignOrders);

        if (Object.keys(req.query).length > 0) {
            responseString = getItemsByQuery(req.query, dataObject.solarDesignOrders)
        }

        res.setHeader("Content-Type", 'application/json');
        res.end(responseString);
    })
})

app.get("/api/orderStatuses", (req, res) => {
    fs.readFile(__dirname + '/db.json', 'utf-8', (err, data) => {
        let dataObject = JSON.parse(data);
        let responseString = JSON.stringify(dataObject.orderStatuses);

        if (Object.keys(req.query).length > 0) {
            responseString = getItemsByQuery(req.query, dataObject.orderStatuses)
        }

        res.setHeader("Content-Type", 'application/json');
        res.end(responseString);
    })
})

/******************************************************
 * Input:
 *  - query: all the parameters of a request
 *  - itemList: the list of objects in the db that we're
 *              interested in.
 * Behavior:
 *      - Loop through the itemList.
 *      - If an item matches all the requirements in the query,
 *          then add that item to the response list
 *      - Return a list of all matched items as a JSON string
 ******************************************************/
function getItemsByQuery (query, itemList) {
    let queryLength = Object.keys(query).length;
    let responseList = [];
    for (let item of itemList) {
        let matchesCount = 0;
        for (let key in query) {
            if (query[key] == item[key]) {
                matchesCount++;
            }
        }
        if (matchesCount == queryLength) {
            responseList.push(item);
        }
    }
    let responseString = JSON.stringify(responseList);
    return responseString;
}

app.listen(port, () => console.log('listening ' + port))
