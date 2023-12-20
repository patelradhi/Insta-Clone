//......................import mongoose......................./

const mongoose = require('mongoose');

require('dotenv').config();

//.......................function creation......................../

const connectWithDb = () => {
	mongoose
		.connect(process.env.DATABASE_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('db connected succesfully');
		})
		.catch((error) => {
			console.log(error);
			console.log('db is not connected');
			process.exit(1);
		});
};

//........................... exporting ........................./

module.exports = connectWithDb;
