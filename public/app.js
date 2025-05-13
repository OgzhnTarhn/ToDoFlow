document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("todoForm");
    const input = document.getElementById("todoInput");
    const list = document.getElementById("todoList");

    fetch("/api/todos")
        .then(res => res.json())
        .then(data => data.forEach(todo => addTodoToUI(todo)));

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return alert("Boş todo eklenemez!");

        fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        })
            .then(res => res.json())
            .then(todo => {
                addTodoToUI(todo);
                input.value = "";
                input.focus();
            });
    });

    function addTodoToUI(todo) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const span = document.createElement("span");
        span.textContent = todo.text;
        if (todo.completed) span.style.textDecoration = "line-through";

        const controls = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn btn-success btn-sm me-1";
        doneBtn.textContent = "✔";
        doneBtn.onclick = () => {
            todo.completed = !todo.completed;
            span.style.textDecoration = todo.completed ? "line-through" : "none";
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = () => {
            fetch("/api/todos/" + todo.id, { method: "DELETE" })
                .then(() => li.remove());
        };

        controls.appendChild(doneBtn);
        controls.appendChild(deleteBtn);
        li.appendChild(span);
        li.appendChild(controls);
        list.appendChild(li);
    }
});
