import axios from 'axios';

const API_URL = 'http://localhost:5000/api/categories';

export const categoryService = {
    async getCategories() {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async createCategory(categoryData) {
        const response = await axios.post(API_URL, categoryData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async updateCategory(id, categoryData) {
        const response = await axios.put(`${API_URL}/${id}`, categoryData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    async deleteCategory(id) {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
}; 