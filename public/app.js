document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("todoForm");
    const input = document.getElementById("todoInput");
    const list = document.getElementById("todoList");
    const submitBtn = form.querySelector("button[type='submit']");
    const toggleBtn = document.getElementById("toggleCompleted");
    let hideCompleted = false;

    fetch("/api/todos")
        .then(res => res.json())
        .then(data => data.forEach(todo => addTodoToUI(todo)));

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return alert("Boş todo eklenemez!");

        const editId = form.getAttribute("data-edit-id");

        if (editId) {
            // Güncelleme modu
            fetch("/api/todos/" + editId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            })
                .then(res => res.json())
                .then(() => {
                    list.innerHTML = "";
                    fetch("/api/todos")
                        .then(res => res.json())
                        .then(data => data.forEach(todo => addTodoToUI(todo)));

                    form.removeAttribute("data-edit-id");
                    submitBtn.textContent = "Ekle";
                    input.value = "";
                });
        } else {
            // Yeni ekleme modu
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
        }
    });

    function addTodoToUI(todo) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        if (todo.completed && hideCompleted) {
            li.classList.add("d-none");
        }

        const span = document.createElement("span");
        span.textContent = todo.text;
        if (todo.completed) {
            span.style.textDecoration = "line-through";
        }

        const controls = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn btn-success btn-sm me-1";
        doneBtn.textContent = "✔";
        doneBtn.onclick = () => {
            todo.completed = !todo.completed;
            fetch("/api/todos/" + todo.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: todo.completed })
            }).then(res => res.json())
                .then(updatedTodo => {
                    span.style.textDecoration = updatedTodo.completed ? "line-through" : "none";
                    if (hideCompleted && updatedTodo.completed) {
                        li.classList.add("d-none");
                    } else {
                        li.classList.remove("d-none");
                    }
                });
        };

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-warning btn-sm me-1";
        editBtn.textContent = "✏️";
        editBtn.onclick = () => {
            input.value = todo.text;
            input.focus();
            submitBtn.textContent = "Güncelle";
            form.setAttribute("data-edit-id", todo.id);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = () => {
            fetch("/api/todos/" + todo.id, { method: "DELETE" })
                .then(() => li.remove());
        };

        controls.appendChild(doneBtn);
        controls.appendChild(editBtn);
        controls.appendChild(deleteBtn);
        li.appendChild(span);
        li.appendChild(controls);
        list.appendChild(li);
    }

    toggleBtn.addEventListener("click", () => {
        hideCompleted = !hideCompleted;

        const items = document.querySelectorAll("#todoList li");
        items.forEach(item => {
            const isCompleted = item.querySelector("span").style.textDecoration === "line-through";
            if (isCompleted) {
                item.classList.toggle("d-none", hideCompleted);
            }
        });

        toggleBtn.textContent = hideCompleted
            ? "👁️ Tamamlananları Göster"
            : "🫣 Tamamlananları Gizle";
    });
});
