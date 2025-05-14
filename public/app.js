document.addEventListener("DOMContentLoaded", () => {
    /* ---------- Offline Queue & Cache Keys ---------- */
    const OFFLINE_QUEUE_KEY = "todo_offline_queue";
    const OFFLINE_CACHE_KEY = "todo_offline_cache";

    /* ---------- Helper: Queue & Cache Management ---------- */
    function getQueue() {
        return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    }
    function setQueue(q) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
    }
    function getCache() {
        return JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || "[]");
    }
    function setCache(data) {
        localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(data));
    }

    /* ---------- syncFetch Wrapper ---------- */
    function syncFetch(url, options = {}) {
        if (navigator.onLine) {
            return fetch(url, options)
                .then(res => res.json())
                .then(data => {
                    if (url === "/api/todos" && options.method === "GET") {
                        setCache(data);
                    }
                    return data;
                });
        } else {
            const queue = getQueue();
            queue.push({ url, options });
            setQueue(queue);
            return Promise.resolve(
                options.method === "GET"
                    ? getCache()
                    : {}
            );
        }
    }

    /* ---------- Element Referansları ---------- */
    const form          = document.getElementById("todoForm");
    const input         = document.getElementById("todoInput");
    const categoryInput = document.getElementById("todoCategory");
    const list          = document.getElementById("todoList");
    const submitBtn     = form.querySelector("button[type='submit']");
    const toggleBtn     = document.getElementById("toggleCompleted");
    const filterSelect  = document.getElementById("filterCategory");

    /* ---------- State ---------- */
    let hideCompleted = false;

    /* ---------- Sayfa Açılışında & Senkronize Online Olduğunda ---------- */
    function loadTodos() {
        list.innerHTML = "";
        syncFetch("/api/todos", { method: "GET" })
            .then(todos => todos.forEach(addTodoToUI));
    }

    window.addEventListener("online", () => {
        const queue = getQueue();
        // sıradaki tüm istekleri işleyip sonra temizle
        queue.reduce((p, req) => {
            return p.then(() => fetch(req.url, req.options));
        }, Promise.resolve())
            .then(() => {
                setQueue([]);
                loadTodos();
            });
    });

    loadTodos();

    /* ---------- Form Submit: Ekle / Güncelle ---------- */
    form.addEventListener("submit", e => {
        e.preventDefault();
        const text     = input.value.trim();
        const category = categoryInput.value || "Genel";
        const editId   = form.getAttribute("data-edit-id");
        if (!text) return alert("Boş todo eklenemez!");

        if (editId) {
            // Güncelle
            syncFetch(`/api/todos/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, category })
            }).then(() => {
                resetForm();
                loadTodos();
            });
        } else {
            // Yeni
            syncFetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, category })
            }).then(todo => {
                addTodoToUI(todo);
                resetForm();
            });
        }
    });

    /* ---------- UI: Todo Ekleme ---------- */
    function addTodoToUI(todo) {
        if (filterSelect.value !== "Hepsi" && todo.category !== filterSelect.value) return;

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        if (todo.completed && hideCompleted) li.classList.add("d-none");

        const span = document.createElement("span");
        span.innerHTML = `<strong>${todo.text}</strong><br><small class="text-muted">${todo.category}</small>`;
        if (todo.completed) span.style.textDecoration = "line-through";

        const controls = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn btn-success btn-sm me-1";
        doneBtn.textContent = "✔";
        doneBtn.onclick = () => {
            todo.completed = !todo.completed;
            syncFetch(`/api/todos/${todo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: todo.completed })
            }).then(updated => {
                span.style.textDecoration = updated.completed ? "line-through" : "none";
                if (hideCompleted && updated.completed) li.classList.add("d-none");
                if (!updated.completed) li.classList.remove("d-none");
            });
        };

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-warning btn-sm me-1";
        editBtn.textContent = "✏️";
        editBtn.onclick = () => {
            input.value         = todo.text;
            categoryInput.value = todo.category;
            submitBtn.textContent = "Güncelle";
            form.setAttribute("data-edit-id", todo.id);
            input.focus();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = () => {
            syncFetch(`/api/todos/${todo.id}`, { method: "DELETE" })
                .then(() => li.remove());
        };

        controls.append(doneBtn, editBtn, deleteBtn);
        li.append(span, controls);
        list.appendChild(li);
    }

    /* ---------- Toggle Completed ---------- */
    toggleBtn.addEventListener("click", () => {
        hideCompleted = !hideCompleted;
        document.querySelectorAll("#todoList li").forEach(li => {
            const isCompleted = li.querySelector("span").style.textDecoration === "line-through";
            if (isCompleted) li.classList.toggle("d-none", hideCompleted);
        });
        toggleBtn.textContent = hideCompleted
            ? "👁️ Tamamlananları Göster"
            : "🫣 Tamamlananları Gizle";
    });

    /* ---------- Filter by Category ---------- */
    filterSelect.addEventListener("change", loadTodos);

    /* ---------- Helper: Form Reset ---------- */
    function resetForm() {
        input.value = "";
        categoryInput.value = "Genel";
        form.removeAttribute("data-edit-id");
        submitBtn.textContent = "Ekle";
        input.focus();
    }
});
