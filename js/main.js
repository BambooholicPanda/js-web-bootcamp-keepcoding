// Declare global variables to store the total expenses, incomes and saved money
let totalExpenses = 0;
let totalIncomes = 0;
let totalSaved = 0;

// Array that will save the records history
let records = [];

// Function to add new records to the "ul" element
function addRecord(record) {
  //Creates a new item in the list
  let item = document.createElement("li");

  // Creates the elements that will be inside the li
  let textDiv = document.createElement("div");
  let typeText = document.createElement("p");
  let amountText = document.createElement("p");
  let conceptText = document.createElement("p");

  // Adds a class to the item depending on the type of transaction
  if (record.type === "expense") {
    item.classList.add("record-expenses");
  } else {
    item.classList.add("record-incomes");
  }

  // Adds a class to the type paragraph and changes its content
  typeText.classList.add("record-type");
  typeText.innerHTML = `${record.type}`;

  // Adds the + symbol if the number is positive and rounds it to 2 decimals
  amountText.innerHTML = `${
    (record.amount.toFixed(2) < 0 ? "" : "+") + record.amount.toFixed(2)
  }`;
  amountText.classList.add("record-amount");

  // Adds a default message if no concept is specified
  if (record.concept == "") {
    conceptText.innerHTML = "(no concept)";
  } else {
    conceptText.innerHTML = `(${record.concept})`;
  }

  // Appends all paragraphs to the div, and then the div to the item
  textDiv.appendChild(typeText);
  textDiv.appendChild(amountText);
  textDiv.appendChild(conceptText);
  item.appendChild(textDiv);

  // Creates the button
  let button = document.createElement("button");
  button.innerHTML = `X`;

  // Add an event listener to the button
  button.addEventListener("click", function () {
    // This function will be called when the button is clicked
    deleteRecord(button);
  });
  button.title = "Delete record";

  // Appends the button to the item
  item.appendChild(button);

  // Appends the item to the list
  document.getElementById("records-list").appendChild(item);

  // Saves all changes into local storage
  saveInLocalStorage();
}

// Function that deletes a record from the list
function deleteRecord(button) {
  // If cancel, function ends
  if (!confirm("Are you sure you want to delete this record?")) {
    return false;
  }

  // Gets the parent element of the button
  let parent = button.parentElement;

  // Gets the parent of the parent element (the grandparent of the button)
  let grandparent = parent.parentElement;

  // Gets the index position of the item in the list
  let recordList = grandparent.children;
  let recordIndex = Array.prototype.indexOf.call(recordList, parent);

  // Retrieves the type of transaction and money amount from the records array
  let typeText = records[recordIndex].type;
  let amountNumber = records[recordIndex].amount;

  let amount = parseFloat(amountNumber);

  // Reverts the total expenses or incomes depending on the type
  if (typeText === "expense") {
    totalExpenses += amount;

    // Display the updated values on the website
    document.getElementById("total-expenses").innerHTML =
      totalExpenses.toFixed(2);
  } else {
    totalIncomes -= amount;

    // Display the updated values on the website
    document.getElementById("total-incomes").innerHTML =
      totalIncomes.toFixed(2);
  }

  // Prevents rounding errors that sometimes make totalSaved 0.01 when all records are deleted
  if (records == []) {
    totalSaved = 0;
  } else {
    totalSaved -= amount;
  }
  // Displays the updated values on the website
  document.getElementById("total-saved").innerHTML = totalSaved.toFixed(2);

  // Deletes the element from the array
  records.splice(recordIndex, 1);

  // Removes the parent element from the grandparent element in the website
  grandparent.removeChild(parent);

  // Checks if the changes caused bankruptcy and saves all changes in local storage
  checkBankrupt();
  saveInLocalStorage();
}

// Updates the savings and creates a record
function updateSavings(amount, concept, isLocalStorageLoad) {
  amount = parseFloat(amount);
  totalSaved += amount;

  // Selects the type of transaction depending on number sign (+/-)
  // Then updates the text on the website
  let typeText;
  if (amount > 0) {
    totalIncomes += amount;
    typeText = "income";
    document.getElementById("total-incomes").innerHTML =
      totalIncomes.toFixed(2);
  } else {
    totalExpenses -= amount;
    typeText = "expense";
    document.getElementById("total-expenses").innerHTML =
      totalExpenses.toFixed(2);
  }
  // Creates a record object with all the data
  let record = { type: typeText, amount: amount, concept: concept };
  // Only saves the record to the array if this function is not being called when loading the website from local storage
  if (!isLocalStorageLoad) {
    records.push(record);
  }
  // Calls the function to add the record to the website list
  addRecord(record);
  // Displays the updated values on the website
  document.getElementById("total-saved").innerHTML = totalSaved.toFixed(2);

  // Cleans the inputs and disables the button
  document.getElementById("money-amount").value = "";
  document.getElementById("transaction-concept").value = "";
  document.getElementById("add-button").disabled = true;

  // Checks for possible bankruptcy and saves all data into local storage
  checkBankrupt();
  saveInLocalStorage();
}

// Disables the button if the input is empty or 0
function isAmountEmpty() {
  if (
    document.getElementById("money-amount").value === "" ||
    document.getElementById("money-amount").value == 0
  ) {
    document.getElementById("add-button").disabled = true;
  } else {
    document.getElementById("add-button").disabled = false;
  }
}

// Checks if total savings are below 0
function checkBankrupt() {
  if (totalSaved < 0) {
    document.getElementById("total-saved").classList.add("bankrupt");
  } else {
    document.getElementById("total-saved").classList.remove("bankrupt");
  }
}

// Saves all records into local storage
function saveInLocalStorage() {
  localStorage.setItem("records", JSON.stringify(records));
}

// Creates all the records when website is loaded. Creating the records will also update the savings
function loadFromLocalStorage() {
  // The array will be empty if there are no records stored
  records = JSON.parse(localStorage.getItem("records")) ?? [];

  for (let index = 0; index < records.length; index++) {
    updateSavings(records[index].amount, records[index].concept, true);
  }
}
