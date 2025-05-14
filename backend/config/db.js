const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite veritabanına bağlantı başarılı.');
        await sequelize.sync();
        console.log('Veritabanı modelleri senkronize edildi.');
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB }; 