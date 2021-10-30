// Start your typescript here

/**************************************************************
* Author: Jeremy Duong
***************************************************************/

function getOrders() {
    fetch("/api/designOrders")
        .then((response) => response.json(), (reason) => {console.log("promise rejected!")})
        .then((data) => console.log(data), (reason) => {console.log("promise rejected!")})
        .catch(error => {console.log(error)})
}

getOrders()