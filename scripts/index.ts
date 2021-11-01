// Start your typescript here

/**************************************************************
* Author: Jeremy Duong
***************************************************************/

// Assign a constant for each of the 4 tabs
const UNASSIGNED = 1;
const IN_PROGRESS = 2;
const COMPLETE = 3;
const REQUESTED_REVISION = 4;

let ORDERS = []
let currentTab : Number = 0 // Initially, no tab is selected

/**************************************************************
* Given the tab id, determine which name to give its progress button
***************************************************************/
function getButtonName(tab : Number) {
    if (tab == UNASSIGNED) {
        return "Claim";
    } else if (tab == IN_PROGRESS) {
        return "Mark Complete";
    } else if (tab == COMPLETE) {
        return "Request Revision";
    } else {
        return "Progress...";
    }
}

/**************************************************************
* Look at the status of each order (the stage it's in) to determine 
* how many orders must be stored in each tab.
* This function should be called every time any order's status changes
***************************************************************/
function updateTabsLength() {
    let lengthTab1 = 0;   // UNASSIGNED
    let lengthTab2 = 0;   // IN PROGRESS
    let lengthTab3 = 0;   // COMPLETE
    let lengthTab4 = 0;   // REQUESTED REVISION

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

    // Update the number next to each tab
    document.getElementById("tab-length-1").innerHTML = String(lengthTab1);
    document.getElementById("tab-length-2").innerHTML = String(lengthTab2);
    document.getElementById("tab-length-3").innerHTML = String(lengthTab3);
    document.getElementById("tab-length-4").innerHTML = String(lengthTab4);
}

/**************************************************************
* This function is the onclick handler of the progress button.
***************************************************************/
function progressOrder(event : any) {
    // First, look at what is being clicked and its id
    let orderId = Number((<HTMLAreaElement>event.currentTarget).id.slice(12));
    let currentStatus = 0
    for (let order of ORDERS) {
        if (order.id == orderId) {
            currentStatus = order.status;
            break;
        }
    }
    let newStatus = Number(currentStatus) + 1;

    // A call to the server to update the order's status in the database
    // This is probably not necessary
    let queryString = "/updateOrderStatus?orderId=" + orderId + "&currentStatus=" + currentStatus + "&newStatus=" + newStatus;
    fetch(queryString, {
        method: 'POST'
    })
    .then((response) => response.text())
    .then((responseText) => {

        // 1 means it updated ok!
        // If the update was a success, do the front-end stuff...
        if (Number(responseText) == 1) {
            // Remove that element from the page
            document.getElementById("table-row-" + orderId).remove();

            // Loop through all the orders to see which one needs to be progressed
            // to the next stage
            for (let order of ORDERS) {
                if (order.id == orderId) {
                    order.status += 1;
                    break;
                }
            }

            // Since an order's status has changed, the tabs' lengths need to be updated 
            updateTabsLength();
        } else {
            alert("Update was unsucessful for some reason!");
        }
    })
}

/**************************************************************
* Input: an order from the ORDERS list
* Behavior:
*   - Creates a <div> as a ".table-row" with the id of the order attached.
*   - Creates a child <div> as a row entry to store the order's id
*   - Creates a child <div> as a row entry to store the lead's name
*   - Creates a child <div> as a row entry to store the date created
*   - Creates a child <div> as a row entry to store the progress button
    - Append the table row to the <div> with id "rows-container"
***************************************************************/
function appendTableRow(order : any) {
    // Where to append the row
    let containerElement = document.getElementById("rows-container");

    // Row element
    let rowElement = document.createElement("div");
    rowElement.id = "table-row-" + order.id; // So that we can remove it
    rowElement.className = "table-row";

    // Create entries for orderId, leadName, date created, and progress button
    let idEntry = document.createElement("div");
    idEntry.className = "order-id";
    idEntry.innerHTML = order.id;
    let leadNameEntry = document.createElement("div");
    leadNameEntry.innerHTML = order.leadName;
    let dateCreatedEntry = document.createElement("div");
    dateCreatedEntry.innerHTML = order.dateCreated;
    let progressButton = document.createElement("div");
    progressButton.className = "progress-button"; // For styling purposes
    progressButton.id = "progress-id-" + order.id; // To know what we click on
    progressButton.innerHTML = getButtonName(order.status);
    progressButton.onclick = progressOrder;

    //Append entries to row, row to table
    rowElement.appendChild(idEntry);
    rowElement.appendChild(leadNameEntry);
    rowElement.appendChild(dateCreatedEntry);
    rowElement.appendChild(progressButton);
    containerElement.appendChild(rowElement);
}

/**************************************************************
* Does 2 things:
*    - Highlight the current tab with a white background
*    - Assign empty background to other tabs
***************************************************************/
function handleTabsStyling() {
    document.getElementById("tab-id-" + String(currentTab)).style.background = "white";
    for (let i = 1; i <= 4; i++) {
        if (i != currentTab) {
            document.getElementById("tab-id-" + String(i)).style.background = "";
        }
    }
}

/**************************************************************
* This function is the onclick handler of the tabs
***************************************************************/
function tabOnclickHandler(event : any) {
    // First, determine what was clicked on and its Id
    let targetTabId = Number((<HTMLAreaElement>event.currentTarget).id.slice(7));

    // Only do this if the clicked tab's id is different from the current id:
    if (targetTabId != currentTab) {

        // mark the current tab as whatever is given
        currentTab = targetTabId;

        // Style tab correctly so user can see visually which one is current
        handleTabsStyling();

        // Next, populate the table with appropriate data
        // Clear the table first to avoid left-overs from other tabs
        document.getElementById("rows-container").innerHTML = ""

        // Look at all the orders to see which one can be put in the currentTab
        for (let order of ORDERS) {
            if (order.status == targetTabId) {
                appendTableRow(order);
            }
        }
    }
}

/**************************************************************
* Add the onclick handler to all the tabs
***************************************************************/
function assignTabOnclickHandler() {
    // Find all the "tab" elements
    let tabElements = document.getElementsByClassName("tab");

    // For each tab element, give it an onclick handler
    for (let i = 0; i < tabElements.length; i++) {
        (<HTMLAreaElement>tabElements[i]).onclick = tabOnclickHandler;
    }
}

/**************************************************************
* This function gets called immediately when the page is loaded.
* Behavior:
*   - Make HTTP Get request to the end point '/api/designOrders'
*        to get all the desgin orders
*   - Call updateTabsLength() and assignTabOnclickHandlers()
***************************************************************/
function getOrders() {
    fetch("/api/designOrders")
        .then((response) => response.json())
        .then((data) => {
            // First, store all the orders for later use
            ORDERS = data;
        })
        .then(() => {

            // Determine how many orders are in each tab and update accordingly
            updateTabsLength();

            // Add onclick handlers to the tabs
            assignTabOnclickHandler();
        })
        .catch(error => {console.log(error)})
}

// Call this function first when the page is loaded
getOrders()

/*****************************************************************
 * This is for testing purposes. If you ever want to reset the database,
 * just hit the Reset Database button and this will run.
 *****************************************************************/
function resetDatabase() {
    fetch("/resetDb", {method: 'POST'})
        .then(response => response.text())
        .then((responseText) => {
            console.log(responseText);
            location.reload();
        })
}
document.getElementById("resetDatabase").addEventListener("click", resetDatabase)