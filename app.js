// ===== STORAGE KEY =====
const STORAGE_KEY = "examCountdownData";

// ===== LOAD EXAMS FROM LOCALSTORAGE =====
function loadExams() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// ===== SAVE EXAMS TO LOCALSTORAGE =====
function saveExams(exams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
}

// ===== GENERATE UNIQUE ID =====
function generateID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ===== CALCULATE DAYS LEFT =====
function calculateDaysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  const examDate = new Date(dateStr);
  examDate.setHours(0, 0, 0, 0);

  const diffMs = examDate - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ===== GET URGENCY LEVEL =====
function getUrgencyLevel(daysLeft) {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 3) return "red";
  if (daysLeft <= 7) return "yellow";
  return "green";
}

// ===== FORMAT DATE FOR DISPLAY =====
function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-IN", options);
}

// ===== SORT EXAMS BY DATE (nearest first) =====
function sortByDate(exams) {
  return exams.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ===== CREATE EXAM CARD HTML =====
function createExamCard(exam) {
  const daysLeft = calculateDaysLeft(exam.date);
  const urgency = getUrgencyLevel(daysLeft);

  let daysText = "";
  if (daysLeft < 0) {
    daysText = "Expired";
  } else if (daysLeft === 0) {
    daysText = "TODAY!";
  } else if (daysLeft === 1) {
    daysText = "1";
  } else {
    daysText = daysLeft;
  }

  let daysLabel = "";
  if (daysLeft < 0) {
    daysLabel = "Exam has passed";
  } else if (daysLeft === 0) {
    daysLabel = "Exam is today!";
  } else {
    daysLabel = "days remaining";
  }

  const card = document.createElement("div");
  card.classList.add("card", urgency);
  card.innerHTML = `
    <h3>${exam.name}</h3>
    <p class="exam-date">📅 ${formatDate(exam.date)}</p>
    <div class="days-left">${daysText}</div>
    <div class="days-label">${daysLabel}</div>
    <button class="delete-btn" onclick="deleteExam('${exam.id}')">🗑 Remove</button>
  `;
  return card;
}

// ===== RENDER DASHBOARD =====
function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  const emptyMsg = document.getElementById("emptyMsg");
  dashboard.innerHTML = "";

  let exams = loadExams();
  exams = sortByDate(exams);

  if (exams.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  exams.forEach((exam) => {
    const card = createExamCard(exam);
    dashboard.appendChild(card);
  });
}

// ===== ADD EXAM =====
function addExam() {
  const nameInput = document.getElementById("examName");
  const dateInput = document.getElementById("examDate");
  const errorMsg = document.getElementById("errorMsg");

  const name = nameInput.value.trim();
  const date = dateInput.value;

  // Validation
  if (!name && !date) {
    errorMsg.textContent = "Please enter exam name and date.";
    return;
  }
  if (!name) {
    errorMsg.textContent = "Please enter the exam name.";
    return;
  }
  if (!date) {
    errorMsg.textContent = "Please select the exam date.";
    return;
  }

  // Clear error
  errorMsg.textContent = "";

  const exams = loadExams();

  const newExam = {
    id: generateID(),
    name: name,
    date: date,
  };

  exams.push(newExam);
  saveExams(exams);

  // Clear inputs
  nameInput.value = "";
  dateInput.value = "";

  renderDashboard();
}

// ===== DELETE EXAM =====
function deleteExam(id) {
  let exams = loadExams();
  exams = exams.filter((exam) => exam.id !== id);
  saveExams(exams);
  renderDashboard();
}

// ===== ALLOW ENTER KEY TO ADD EXAM =====
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addExam();
  }
});

// ===== INIT =====
renderDashboard();
