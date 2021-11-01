const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000
app.use(express.static(__dirname));

/*****************************************************************
 * Home page
 *****************************************************************/
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

/*****************************************************************
 * Completely reset db.json to the initial state (db-initial.json)
 *****************************************************************/
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

/*****************************************************************
 * This endpoint is hit when the user want to progress an order
 * to the next stage. For example, from Unassigned to In Progress.
 * 
 * This will update the status of the order in db.json
 * 
 * Return:
 *      - 2 if there's anything wrong
 *      - 1 if update succeeded
 *****************************************************************/
app.post("/updateOrderStatus", (req, res) => {
    console.log(req.query);
    // If the parameters don't add up to 3 and either
    // orderId, currentStatus, or newStatus is missing,
    // then it's not being called correctly
    if (Object.keys(req.query).length != 3
        || !req.query.orderId
        || !req.query.currentStatus
        || !req.query.newStatus) {
        console.log("Query params error!");
        res.send("2");
        return;
    }

    res.setHeader("Content-type", "application/text")
    
    // Read from the database
    fs.readFile(__dirname + '/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            res.send("2");
            return;
        }

        // Look for the order in the db, then update it!
        let dataObject = JSON.parse(data);
        let orderFound = false;
        let updateValid = false;
        for (order of dataObject.solarDesignOrders) {
            if (Number(order.id) == Number(req.query.orderId)) {
                orderFound = true;
                if (Number(order.status) == Number(req.query.currentStatus)) {
                    order.status = Number(req.query.newStatus);
                    updateValid = true;
                }
            }
        }

        // Fail if order is not found in the db, or the current
        // status sent from front-end does not match.
        // In the real world, this means that a different designer has taken
        // the order and your page is not updated.
        if (!orderFound || !updateValid) {
            res.send("2");
            return;
        }

        let updatedDataString = JSON.stringify(dataObject);

        fs.writeFile(__dirname + '/db.json', updatedDataString, (err_w) => {
            if (err_w) {
                console.log(err_w);
                res.send("2")
                return;
            }
            res.status = 200;
            res.send("1");
        })
    })
})

/*****************************************************************
 * Return all the design orders stored in db.json
 *****************************************************************/
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

/******************************************************************
 * I actually never used this end point but I just added it here for fun
 * and in case I needed it.
 ******************************************************************/
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
 * This function basically makes sure to return all the items
 * in a list whose attributes match the query.
 * 
 * NOTE: Don't worrry too much about this function. It's just
 *      an algorithm helper.
 * 
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
