import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { todoService } from '../../services/api';

// Async thunks
export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await todoService.getAll();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createTodo = createAsyncThunk(
    'todos/createTodo',
    async (todoData, { rejectWithValue }) => {
        try {
            const response = await todoService.create(todoData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateTodo = createAsyncThunk(
    'todos/updateTodo',
    async ({ id, todoData }, { rejectWithValue }) => {
        try {
            const response = await todoService.update(id, todoData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteTodo = createAsyncThunk(
    'todos/deleteTodo',
    async (id, { rejectWithValue }) => {
        try {
            await todoService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    todos: [],
    loading: false,
    error: null
};

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Todos
            .addCase(fetchTodos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.loading = false;
                state.todos = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch todos';
            })
            // Create Todo
            .addCase(createTodo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.loading = false;
                state.todos.push(action.payload);
            })
            .addCase(createTodo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to create todo';
            })
            // Update Todo
            .addCase(updateTodo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.todos.findIndex(todo => todo._id === action.payload._id);
                if (index !== -1) {
                    state.todos[index] = action.payload;
                }
            })
            .addCase(updateTodo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to update todo';
            })
            // Delete Todo
            .addCase(deleteTodo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.loading = false;
                state.todos = state.todos.filter(todo => todo._id !== action.payload);
            })
            .addCase(deleteTodo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to delete todo';
            });
    }
});

export const { clearError } = todoSlice.actions;
export default todoSlice.reducer; 