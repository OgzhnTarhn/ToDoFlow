const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// JSON dosyasını oku
function readData() {
    const data = fs.readFileSync("backend/data.json", "utf-8");
    return JSON.parse(data);
}

// JSON dosyasına yaz
function writeData(todos) {
    fs.writeFileSync("backend/data.json", JSON.stringify(todos, null, 2));
}

// Tüm todo'ları getir
app.get("/api/todos", (req, res) => {
    const todos = readData();
    res.json(todos);
});

// Yeni todo ekle
app.post("/api/todos", (req, res) => {
    const todos = readData();
    const newTodo = {
        id: Date.now(),
        text: req.body.text
    };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

// Todo sil (ID ile)
app.delete("/api/todos/:id", (req, res) => {
    let todos = readData();
    todos = todos.filter(todo => todo.id != req.params.id);
    writeData(todos);
    res.status(200).json({ message: "Silindi" });
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
