// Global variables
let labs = {};
let labTimetable = {};

// Function to load CSV and parse data
function loadCSV() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const csvContent = event.target.result;
    parseCSV(csvContent);
    alert("CSV data loaded successfully!");
  };
  reader.readAsText(file);
}

// Function to parse CSV file
function parseCSV(data) {
  const rows = data.split("\n");
  rows.forEach((row, index) => {
    const columns = row.split(",");
    if (index === 0) {
      // Header row, skip or process header logic here
      return;
    }

    if (columns.length === 2) {
      // Lab capacity data
      const labName = columns[0].trim();
      const capacity = parseInt(columns[1].trim());
      if (labName && !isNaN(capacity)) {
        labs[labName] = capacity;
      }
    } else if (columns.length > 2) {
      // Lab timetable data
      const timeSlot = columns[0].trim();
      const labNames = columns.slice(1).map((lab) => lab.trim());
      labTimetable[timeSlot] = labNames;
    }
  });
}

// Function to allocate students
function allocateStudents() {
  const numStudents = parseInt(document.getElementById("numStudents").value);
  const startTime = parseInt(document.getElementById("startTime").value);
  const endTime = parseInt(document.getElementById("endTime").value);
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = ""; // Clear previous results

  if (isNaN(numStudents) || isNaN(startTime) || isNaN(endTime) || numStudents <= 0 || startTime >= endTime) {
    resultDiv.innerHTML = `<p class="error">Please enter valid inputs.</p>`;
    return;
  }

  // Process time slots and allocate students
  for (let t = startTime; t < endTime; t += 2) {
    const timeSlotKey = `${t},${t + 2}`;
    const assignedLabs = labTimetable[timeSlotKey];

    if (!assignedLabs) {
      resultDiv.innerHTML += `<p class="error">No labs available for ${t}:00 - ${t + 2}:00.</p>`;
      continue;
    }

    let remaining = numStudents;
    let allocation = {};

    // Sort labs by capacity for optimal allocation
    const sortedLabs = assignedLabs.sort((a, b) => labs[a] - labs[b]);

    for (const lab of sortedLabs) {
      if (remaining <= 0) break;

      const labCapacity = labs[lab];
      const allocated = Math.min(remaining, labCapacity);

      allocation[lab] = allocated;
      remaining -= allocated;
    }

    // Display allocation results
    resultDiv.innerHTML += `<h3>Lab Allocation for ${t}:00 - ${t + 2}:00</h3>`;
    for (const lab in allocation) {
      resultDiv.innerHTML += `<p>${lab}: ${allocation[lab]} students</p>`;
    }

    if (remaining > 0) {
      resultDiv.innerHTML += `<p class="error">Unable to allocate ${remaining} students for ${t}:00 - ${t + 2}:00 due to insufficient space.</p>`;
    }
  }
}
