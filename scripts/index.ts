// Start your typescript here

/**************************************************************
* Author: Jeremy Duong
***************************************************************/
let ORDERS = []
let currentTab : Number = 1

function getButtonName(tab : Number) {
    if (tab == 1) {
        return "Claim";
    } else if (tab == 2) {
        return "Mark Complete";
    } else if (tab == 3) {
        return "Request Revision";
    } else {
        return "Progress...";
    }
}

function updateTabLength() {
    let lengthTab1 = 0;
    let lengthTab2 = 0;
    let lengthTab3 = 0;
    let lengthTab4 = 0;

    for (let order of ORDERS) {
        if (order.status == 1) {
            lengthTab1 += 1;
        } else if (order.status == 2) {
            lengthTab2 += 1;
        } else if (order.status == 3) {
            lengthTab3 += 1;
        } else if (order.status == 4) {
            lengthTab4 += 1;
        }
    }

    document.getElementById("tab-length-1").innerHTML = String(lengthTab1);
    document.getElementById("tab-length-2").innerHTML = String(lengthTab2);
    document.getElementById("tab-length-3").innerHTML = String(lengthTab3);
    document.getElementById("tab-length-4").innerHTML = String(lengthTab4);
}

function progressOrderToNextStage(orderId : Number) {
    for (let order of ORDERS) {
        if (order.id == orderId) {
            order.status += 1;
        }
    }
    updateTabLength();
}

function appendTableRow(order : any) {
    let targetDivElement = document.getElementById("table-rows");
    let rowElement = document.createElement("div");
    rowElement.id = "table-row-" + order.id;
    rowElement.className = "table-row";

    let idEntry = document.createElement("div");
    idEntry.className = "order-id";
    idEntry.innerHTML = order.id;

    let leadNameEntry = document.createElement("div");
    leadNameEntry.innerHTML = order.leadName;

    let dateCreatedEntry = document.createElement("div");
    dateCreatedEntry.innerHTML = order.dateCreated;

    let progressButton = document.createElement("div");
    progressButton.className = "progress-button";
    progressButton.id = "progress-id-" + order.id;
    progressButton.innerHTML = getButtonName(order.status);
    progressButton.onclick = function (event) {

        let orderId = Number((<HTMLAreaElement>event.currentTarget).id.slice(12));
        document.getElementById("table-row-" + order.id).remove();
        progressOrderToNextStage(orderId);
    }

    rowElement.appendChild(idEntry);
    rowElement.appendChild(leadNameEntry);
    rowElement.appendChild(dateCreatedEntry);
    rowElement.appendChild(progressButton);

    targetDivElement.appendChild(rowElement);
}

function tabOnclickHandler(tab : Number) {
    // first, mark the current tab as whatever is given
    currentTab = tab;

    // Next, mark the tab on the page as current by switching background to white
    let targetTabElement = document.getElementById("tab-id-" + String(tab));
    targetTabElement.style.background = "white";

    // Look at all other tabs, if they're not currentTab, set background to blank
    for (let i = 1; i <= 4; i++) {
        if (i != tab) {
            document.getElementById("tab-id-" + String(i)).style.background = "";
        }
    }

    // Next, populate the table with appropriate data
    document.getElementById("table-rows").innerHTML = ""

    // Look at all the orders to see which one can be put in the currentTab
    for (let order of ORDERS) {
        if (order.status == tab) {
            appendTableRow(order);
        }
    }
}

function getOrders() {
    fetch("/api/designOrders")
        .then((response) => response.json())
        .then((data) => {
            ORDERS = data;
            updateTabLength();
            return data;
        })
        .then((data) => {
            console.log(data);
            tabOnclickHandler(currentTab);
        })
        .catch(error => {console.log(error)})
}

function appendTabOnclickEvents() {
    let tabElements = document.getElementsByClassName("tab");

    for (let i=0; i < tabElements.length; i++) {
        (<HTMLAreaElement>tabElements[i]).onclick = function (event) {
            let targetTabId = Number((<HTMLAreaElement>event.currentTarget).id.slice(7));
            tabOnclickHandler(targetTabId);
        }
    }
}

appendTabOnclickEvents()
getOrders()