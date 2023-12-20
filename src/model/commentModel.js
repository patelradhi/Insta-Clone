//...................importing...................................../
const mongoose = require('mongoose');

//.............................create model.........................../

const commentSchema = new mongoose.Schema(
	{
		body: {
			type: String,
			required: true,
		},
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
module.exports = mongoose.model('Comment', commentSchema);
