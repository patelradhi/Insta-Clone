//...................importing...................................../
const mongoose = require('mongoose');

//.............................create model.........................../

const likeSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

//..................................exporting......................................../
module.exports = mongoose.model('Like', likeSchema);
