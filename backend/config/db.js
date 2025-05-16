const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: console.log,
    define: {
        timestamps: true
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite veritabanına bağlantı başarılı.');
        
        await sequelize.sync({ force: false });
        console.log('Veritabanı modelleri senkronize edildi.');
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB }; 