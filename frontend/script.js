let token = localStorage.getItem("token");

// 🔐 Login function
function login() {
  fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location = "dashboard.html";
    } else {
      alert("Login failed");
    }
  })
  .catch(() => alert("Server error"));
}

// ➕ Create Task
function createTask() {
  if (!token) {
    alert("Please login first!");
    window.location = "index.html";
    return;
  }

  fetch("http://127.0.0.1:8000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title: document.getElementById("title").value,
      description: document.getElementById("desc").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg) {
      alert("Task Added");
      loadTasks();
    } else {
      alert("Error");
    }
  })
  .catch(() => alert("Server error"));
}

// 📥 Load Tasks
function loadTasks() {
  if (!token) return;

  fetch("http://127.0.0.1:8000/tasks", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    let list = document.getElementById("tasks");

    if (!list) return; // dashboard check

    list.innerHTML = "";

    if (Array.isArray(data)) {
      data.forEach(task => {
        let li = document.createElement("li");
        li.innerText = task.title + " - " + task.description;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>No tasks found</li>";
    }
  })
  .catch(() => alert("Error loading tasks"));
}

// 🔄 Auto load tasks (only dashboard page)
window.onload = function () {
  if (window.location.pathname.includes("dashboard.html")) {
    loadTasks();
  }
};