//...................importing...................................../
const mongoose = require('mongoose');

//.............................create model.........................../

const userSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			unique: true,
		},
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePic: {
			type: String,
		},
		publicId: {
			type: String,
		},
		address: {
			city: {
				type: String,
			},
			county: {
				type: String,
			},
			state: {
				type: String,
			},
			pinCode: {
				type: Number,
			},
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

//.....................exporting...................................../
module.exports = mongoose.model('User', userSchema);
