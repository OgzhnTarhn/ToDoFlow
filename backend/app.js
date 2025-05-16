const todoRoutes = require('./routes/todoRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes); 