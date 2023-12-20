//.............................................................../

const express = require('express');
const app = express();
require('dotenv').config();
const connectWithDb = require('./config/dataBase');
const { cloudinaryConnect } = require('./config/cloudinary');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

//...........................middelwares to read req.body............................../
app.use(express.json());

//.....................midelwares to read req.cookie................/
app.use(cookieParser());

//...................... middelwares for interact with file
app.use(
	fileupload({
		useTempFiles: true,
		tempFileDir: '/tmp/',
	})
);

//......................... mounting..................................../

//.............................port................................../
const PORT = process.env.PORT;

//............................db call................................../
connectWithDb();

//............................cloudinary call........................./

//...............................server Started.........................../

app.listen(PORT, () => {
	console.log(`Server started at port number ${PORT} `);
});
