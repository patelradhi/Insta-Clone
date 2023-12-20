//........................importing.................../

const bcrypt = require('bcrypt');

//.......................function for hashing password................................./

exports.hashPassword = async (password, num) => {
	try {
		const ans = await bcrypt.hash(password, num);
		return ans;
	} catch (error) {
		console.log('ERROR', error);
	}
};

//........................function for check if file type is supported or not..................//

exports.isFileTypeSupported = async (type, supportedTypes) => {
	return supportedTypes.includes(type);
};

//...........................function for file-upload to cloudinary..................//

exports.fileUploadToCloudinary = async (file, folder) => {
	const Options = { folder };
	Options.resource_type = 'auto';
	return await cloudinary.uploader.upload(file.tempFilePath, Options);
};
