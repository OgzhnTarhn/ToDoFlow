import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Box,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Sabit kategoriler
const DEFAULT_CATEGORIES = [
  { name: 'Genel', color: '#808080', id: 1 },
  { name: 'Ev', color: '#4caf50', id: 2 },
  { name: 'Okul', color: '#2196f3', id: 3 },
  { name: 'İş', color: '#ff9800', id: 4 },
  { name: 'Sağlık', color: '#e91e63', id: 5 },
  { name: 'Alışveriş', color: '#9c27b0', id: 6 },
  { name: 'Kişisel', color: '#f44336', id: 7 },
  { name: 'Diğer', color: '#607d8b', id: 8 }
];

function TodoList() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', categoryId: '' });
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [selectedCategory]);

  const fetchTodos = async () => {
    try {
      let url = 'http://localhost:3001/api/todos';
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      const response = await axios.get(url);
      setTodos(response.data);
    } catch (error) {
      setError('Todolar yüklenirken bir hata oluştu');
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/todos', newTodo);
      setTodos([...todos, response.data]);
      setNewTodo({ title: '', description: '', categoryId: '' });
    } catch (error) {
      setError('Todo eklenirken bir hata oluştu');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await axios.put(`http://localhost:3001/api/todos/${id}`, {
        ...todo,
        completed: !completed
      });
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (error) {
      setError('Todo güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      setError('Todo silinirken bir hata oluştu');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hoş geldin, {user?.username}!
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Yeni Todo Ekle
          </Typography>
          <Box component="form" onSubmit={handleAddTodo}>
            <TextField
              fullWidth
              label="Başlık"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Açıklama"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Kategori</InputLabel>
              <Select
                labelId="category-label"
                value={newTodo.categoryId}
                label="Kategori"
                onChange={(e) => setNewTodo({ ...newTodo, categoryId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <span style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: cat.color,
                      marginRight: 8,
                      verticalAlign: 'middle'
                    }} />
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Ekle
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Todolarım
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="filter-category-label">Kategoriye Göre Filtrele</InputLabel>
            <Select
              labelId="filter-category-label"
              value={selectedCategory}
              label="Kategoriye Göre Filtrele"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>Tümü</em>
              </MenuItem>
              {DEFAULT_CATEGORIES.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                    marginRight: 8,
                    verticalAlign: 'middle'
                  }} />
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <List>
            {todos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Checkbox
                  edge="start"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id, todo.completed)}
                />
                <ListItemText
                  primary={
                    <span>
                      {todo.title}
                      <span style={{
                        backgroundColor: (DEFAULT_CATEGORIES.find(c => c.id === todo.categoryId) || {}).color,
                        color: '#fff',
                        borderRadius: 8,
                        padding: '2px 8px',
                        fontSize: 12,
                        marginLeft: 10
                      }}>
                        {(DEFAULT_CATEGORIES.find(c => c.id === todo.categoryId) || {}).name}
                      </span>
                    </span>
                  }
                  secondary={todo.description}
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  );
}

export default TodoList; 