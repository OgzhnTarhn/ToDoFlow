document.addEventListener("DOMContentLoaded", () => {
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

    /* ---------- Sayfa Açılışında Todo'ları Yükle ---------- */
    loadTodos();

    function loadTodos() {
        list.innerHTML = "";
        fetch("/api/todos")
            .then(res => res.json())
            .then(todos => todos.forEach(addTodoToUI));
    }

    /* ---------- Yeni Todo Ekleme / Güncelleme ---------- */
    form.addEventListener("submit", e => {
        e.preventDefault();
        const text     = input.value.trim();
        const category = categoryInput.value || "Genel";
        const editId   = form.getAttribute("data-edit-id");

        if (!text) return alert("Boş todo eklenemez!");

        if (editId) {
            // Güncelleme modu
            fetch(`/api/todos/${editId}`, {
                method : "PUT",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ text, category })
            })
                .then(res => res.json())
                .then(() => {
                    resetForm();
                    loadTodos();
                });
        } else {
            // Yeni ekleme modu
            fetch("/api/todos", {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ text, category })
            })
                .then(res => res.json())
                .then(todo => {
                    addTodoToUI(todo);
                    resetForm();
                });
        }
    });

    /* ---------- Todo'yu Arayüze Ekle ---------- */
    function addTodoToUI(todo) {
        // Filtre uygulandıysa ve kategori uymuyorsa ekleme
        if (filterSelect.value !== "Hepsi" && todo.category !== filterSelect.value) return;

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        if (todo.completed && hideCompleted) li.classList.add("d-none");

        // Metin + Kategori Gösterimi
        const span = document.createElement("span");
        span.innerHTML = `
      <strong>${todo.text}</strong><br>
      <small class="text-muted">${todo.category}</small>
    `;
        if (todo.completed) span.style.textDecoration = "line-through";

        // Kontrol Butonları
        const controls = document.createElement("div");

        // ✔ Tamamla
        const doneBtn = document.createElement("button");
        doneBtn.className = "btn btn-success btn-sm me-1";
        doneBtn.textContent = "✔";
        doneBtn.onclick = () => {
            todo.completed = !todo.completed;
            fetch(`/api/todos/${todo.id}`, {
                method : "PUT",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ completed: todo.completed })
            })
                .then(res => res.json())
                .then(updated => {
                    span.style.textDecoration = updated.completed ? "line-through" : "none";
                    if (hideCompleted && updated.completed)   li.classList.add("d-none");
                    if (!updated.completed) li.classList.remove("d-none");
                });
        };

        // ✏️ Düzenle
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

        // 🗑️ Sil
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = () => {
            fetch(`/api/todos/${todo.id}`, { method: "DELETE" })
                .then(() => li.remove());
        };

        controls.append(doneBtn, editBtn, deleteBtn);
        li.append(span, controls);
        list.appendChild(li);
    }

    /* ---------- Tamamlananları Gizle / Göster ---------- */
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

    /* ---------- Kategori Filtresi ---------- */
    filterSelect.addEventListener("change", loadTodos);

    /* ---------- Yardımcı: Formu Sıfırla ---------- */
    function resetForm() {
        input.value         = "";
        categoryInput.value = "Genel";
        form.removeAttribute("data-edit-id");
        submitBtn.textContent = "Ekle";
        input.focus();
    }
});
