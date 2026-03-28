let token = "";

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
    token = data.token;
    window.location = "dashboard.html";
  });
}

function createTask() {
  fetch("http://127.0.0.1:8000/tasks", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      title: document.getElementById("title").value,
      description: document.getElementById("desc").value
    })
  });
}