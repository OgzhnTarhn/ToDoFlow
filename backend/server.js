const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

function readData() {
    try {
        const data = fs.readFileSync(path.join(__dirname, "data.json"), "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Veri okuma hatası:", err.message);
        return [];
    }
}

function writeData(todos) {
    try {
        fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(todos, null, 2));
    } catch (err) {
        console.error("Veri yazma hatası:", err.message);
    }
}

app.get("/api/todos", (req, res) => {
    const todos = readData();
    res.json(todos);
});

app.post("/api/todos", (req, res) => {
    const todos = readData();
    const newTodo = {
        id: Date.now(),
        text: req.body.text,
        createdAt: new Date().toISOString(),
        completed: false
    };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

app.delete("/api/todos/:id", (req, res) => {
    let todos = readData();
    todos = todos.filter(todo => todo.id != req.params.id);
    writeData(todos);
    res.status(200).json({ message: "Silindi" });
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
