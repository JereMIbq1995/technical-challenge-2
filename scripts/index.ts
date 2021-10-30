// Start your typescript here

/**************************************************************
* Author: Jeremy Duong
***************************************************************/

/**************************************************************
 * Input: one item of the todo list
 * Behavior: Creates a <li> element for that item and attaches
 *          onto the <ul> element with id of 'modal-content'
 **************************************************************/
function appendTodoItem(todo : any) {
    let targetDiv = document.getElementById("modal-content");
    let todoItemElement = document.createElement("li");
    todoItemElement.innerHTML = todo.title;
    targetDiv.appendChild(todoItemElement);
}

/**************************************************************
 * Input: Takes in the userId as a string
 * Behavior:
 *   - Send a GET request to "https://jsonplaceholder.typicode.com/todos",
 *        using userId as a parameter
 *   - Parse the JSON response into the todoList Array
 *   - Loop through the todoList array and pass each item to appendTodoItem.
 **************************************************************/
function getUserTodoList(userId : String) {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function () {
        const todoList = JSON.parse(this.responseText);
        console.log(todoList)
        for (let todo of todoList) {
            appendTodoItem(todo);
        }
    }
    let urlString = "https://jsonplaceholder.typicode.com/todos?userId=" + userId;
    console.log(urlString);
    xhttp.open("GET", urlString)
    xhttp.send()
}

/**************************************************************
 * Input: Takes in a user
 * Behavior:
 *   - Creates a <tr> element which contains:
 *      + A <td> element for the user's name
 *      + A <td> element for the user's website
 *      + A <td> element for the user's email
 *      + A <td> element for the user's address
 *   - Appends the <tr> element created to the <table> element #user-table
 **************************************************************/
function appendTableRow(user : any) {
    // First, get the table
    let tableElement = document.getElementById("user-table")
    
    // Create the table row element
    let rowElement = document.createElement("tr")
    rowElement.className = "table-data"
    rowElement.id = "user-id-" + String(user.id) //Use this as a way to store the user id
    
    // Add onclick event handler to the table row:
    rowElement.onclick = function (event) {
        if ((<HTMLAreaElement>event.currentTarget).className == "table-data") {
            //First open the modal
            openModal();
            
            //Look at the id of the table row, and pull the user id out of that
            let userId = (<HTMLAreaElement>event.currentTarget).id.slice(8);

            console.log(userId);

            // Pass the userId to getUserTodoList
            getUserTodoList(userId);
        }
    }

    // Create the td elements for users' names, websites, emails and addresses
    let nameColumn = document.createElement("td")
    nameColumn.className = "user-name"
    nameColumn.innerHTML = user.name
    let websiteColumn = document.createElement("td")
    websiteColumn.innerHTML = user.website
    let emailColumn = document.createElement("td")
    emailColumn.innerHTML = user.email
    let addressColumn = document.createElement("td")
    addressColumn.innerHTML = user.address.street + ", " + user.address.city + " " + user.address.zipcode

    //Append all the <td> elements just created to the <tr> element
    rowElement.appendChild(nameColumn)
    rowElement.appendChild(websiteColumn)
    rowElement.appendChild(emailColumn)
    rowElement.appendChild(addressColumn)

    //Append the <tr> element to the <table> element
    tableElement.appendChild(rowElement)
}

/**************************************************************
 * Input: None
 * Behavior:
 *   - Send a GET request to "https://jsonplaceholder.typicode.com/users"
 *   - With the list of users received, loop through it and
 *      pass each user to the appendTableRow() function
 **************************************************************/
function getAllUsers() {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function() {
        const responseList = JSON.parse(this.responseText);
        for (let user of responseList) {
            appendTableRow(user)
        }
    }
    xhttp.open("GET", "https://jsonplaceholder.typicode.com/users")
    xhttp.send()
}


/**************************************************************
 * The following code is for the purpose of managing the Modal
 **************************************************************/
let modal = document.getElementById("modal")

function openModal() {
    //Simply change the display attribute so the modal shows up
    modal.style.display = "block";
}

function closeModal() {
    //First clear the content of the modal (to make sure the next
    // time it's open, there's no left over info from previous click)
    document.getElementById("modal-content").innerHTML = "";

    //Simply set display attribute to "none" to hide it
    modal.style.display = "none";
}

// If at any time the window is clicked, and the IMMEDIATE target
//  is the modal (actually the background, not the modal-content),
//  then call closeModal
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal()
    }
}

// Run this function everytime the page is loaded since the first
//  thing we want to load is all the users.
getAllUsers()