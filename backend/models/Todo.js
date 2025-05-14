const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Todo = sequelize.define('Todo', {
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Genel'
    }
});

// İlişkileri tanımla
Todo.belongsTo(User);
User.hasMany(Todo);

module.exports = Todo; 