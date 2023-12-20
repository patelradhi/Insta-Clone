//...................importing...................................../
const mongoose = require('mongoose');

//.............................create model.........................../

const postSchema = new mongoose.Schema(
	{
		caption: {
			type: String,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		mediaLink: {
			type: String,
		},
		like: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Like',
		},
		comment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

//..................................exporting......................................../
module.exports = mongoose.model('Post', commentSchema);
