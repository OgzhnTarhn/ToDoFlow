console.log("JS yüklendi!");
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("todoForm");
    const input = document.getElementById("todoInput");
    const list = document.getElementById("todoList");

    // 1. Sayfa açıldığında tüm todo'ları backend'den getir
    fetch("/api/todos")
        .then(res => res.json())
        .then(data => {
            data.forEach(todo => addTodoToUI(todo));
        });

    // 2. Form gönderilince backend'e POST yap
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        fetch("/api/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        })
            .then(res => res.json())
            .then(newTodo => {
                addTodoToUI(newTodo);
                input.value = "";
            });
    });

    // 3. Todo'yu HTML'e ekle
    function addTodoToUI(todo) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = todo.text;

        const btn = document.createElement("button");
        btn.textContent = "Sil";
        btn.className = "btn btn-danger btn-sm";
        btn.onclick = () => deleteTodo(todo.id, li);

        li.appendChild(btn);
        list.appendChild(li);
    }

    // 4. Todo silme
    function deleteTodo(id, element) {
        fetch(`/api/todos/${id}`, { method: "DELETE" })
            .then(() => {
                element.remove();
            });
    }
});
