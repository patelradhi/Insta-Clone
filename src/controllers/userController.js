//...................importing model................................................................../

const User = require('../model/userModel');
const { hashPassword } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { fileUploadToCloudinary } = require('../utils');
const { isFileTypeSupported } = require('../utils');
const cloudinary = require('cloudinary').v2;

//.........................signUp............................................................................./

exports.signUp = async (req, res) => {
	try {
		//destructured feild from req.body

		const { email, password, userName } = req.body;

		//validation

		if (!email || !password || !userName) {
			return res.json({
				success: false,
				message: 'All details are required',
			});
		}

		//check user exist or not, if exist return with error message

		const userExist = await User.findOne({ email });

		if (userExist) {
			return res.json({
				success: false,
				message: 'User allready exist',
			});
		}

		//if user not exist then encrypte password

		const encryptedPassword = await hashPassword(password, 10);

		//create entry in db

		const creatUser = await User.create({
			email,
			password: encryptedPassword,
			userName,
		});

		const ans = await User.findOne({ email }, { password: 0, followers: 0, following: 0 });

		//response

		res.json({
			success: true,
			message: 'User created successfully',
			data: {
				user: ans,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'found some error while signup',
		});
	}
};

//............................................logIn........................................................../

exports.logIn = async (req, res) => {
	try {
		//destructured feild from req.body

		const { email, password, userName } = req.body;

		//validation

		if (!password || (!email && !userName)) {
			return res.json({
				success: false,
				message: 'All details are required',
			});
		}

		//check user exist or not, if exist return with error message

		let userExist;
		if (email) {
			userExist = await User.findOne({ email });
		} else {
			userExist = await User.findOne({ userName });
		}

		if (!userExist) {
			return res.json({
				success: false,
				message: 'User not exist',
			});
		}

		//if user exist then compare the password

		const comparedPassword = await bcrypt.compare(password, userExist.password);

		//if password matched then generate token and sent into cookie

		if (comparedPassword) {
			const payload = {
				email: userExist.email,
				_id: userExist._id,
			};

			const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
				expiresIn: '3h',
			});
			//response

			let ans;

			if (email) {
				ans = await User.findOne({ email }, { email: 1, userName: 1 });
			} else {
				ans = await User.findOne({ userName }, { email: 1, userName: 1 });
			}

			let Options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};

			res.cookie('token', token, Options).json({
				status: 'success',
				message: 'User logged in successfully',
				data: {
					...ans._doc,
					token,
				},
			});
		} else {
			return res.json({
				success: true,
				message: 'User not login successfully',
			});
		}
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'Found some error while login',
		});
	}
};

//............................................update profile..................................................../

exports.updateProfile = async (req, res) => {
	try {
		//destructured feils from req.body

		const { firstName, lastName, address } = req.body;
		const file = req.files.userEnteredFiles;

		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//check if file type supported or not

		const supportedFile = ['jpg', 'jpeg', 'png'];
		const fileType = file.name.split('.')[1].toLowerCase();

		if (!isFileTypeSupported(fileType, supportedFile)) {
			return res.json({
				message: 'File format not supported',
			});
		}

		//find old user data for taking public_id from it
		const oldUserData = await User.findOne({ _id: userId });

		//file upload to cloudinary
		const response = await fileUploadToCloudinary(file, 'insta-clon');

		//create entry in db

		const profile = await User.findByIdAndUpdate(
			userId,
			{
				firstName: firstName,
				lastName: lastName,
				address: address,
				profilePic: response.secure_url,
				publicId: response.public_id,
			},
			{
				new: true,
			}
		);

		profile.password = undefined;

		//image update at cloudinary

		// Public ID of the image you want to delete
		const publicId = oldUserData.publicId;

		// Delete image
		cloudinary.uploader.destroy(publicId, (error, result) => {
			if (error) {
				console.error('Error deleting image:', error);
			} else {
			}
		});

		//response
		res.json({
			success: true,
			message: 'User updated successfully',
			data: {
				user: profile,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'found some error while updated user',
		});
	}
};

//................................user can follow other user................................................/

exports.follow = async (req, res) => {
	try {
		//destructured fiels from req.params

		const { _id } = req.params;
		const userId = req.user._id;

		// if user try to follow himself/herself then return with error message
		if (userId == _id) {
			return res.json({
				success: false,
				message: 'You can not follow your self',
			});
		}

		//chech that you are  allready followed this  user or not
		const findFollower = await User.findOne({ _id: _id, followers: userId });

		//if you are allready followed then return with error message
		if (findFollower) {
			return res.json({
				success: false,
				message: 'You are allready followed this user',
			});
		}

		//user follow other user
		await User.updateOne({ _id: _id }, { $push: { followers: userId } }, { new: true });

		await User.updateOne({ _id: userId }, { $push: { following: _id } }, { new: true });

		//response
		res.status(200).json({
			success: true,
			message: 'User followed successfully',
			data: {
				userIds: _id,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'found some error while follow to other users',
		});
	}
};

//................................user can ufollow other user................................................/

exports.ufollow = async (req, res) => {
	try {
		//destructured fiels from req.params

		const { _id } = req.params;
		const userId = req.user._id;

		// if user try to follow himself/herself then return with error message
		if (userId == _id) {
			return res.json({
				success: false,
				message: 'You can not ufollow your self',
			});
		}

		//chech that user are  follow this ( users) or not
		const findFollower = await User.findOne({ _id: _id, followers: userId });

		//if user are not follow this (users) then return with error message
		if (!findFollower) {
			return res.json({
				success: false,
				message: ' you are not followed this user so you can not unfollow them ',
			});
		}

		//user follow other user
		await User.updateOne({ _id: _id }, { $pull: { followers: userId } }, { new: true });

		await User.updateOne({ _id: userId }, { $pull: { following: _id } }, { new: true });

		//response
		res.status(200).json({
			success: true,
			message: 'User ufollowed successfully',
			data: {
				userIds: _id,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			message: 'found some error while ufollow other users',
		});
	}
};

//...............................user can veiw his or her profile.........................................../

exports.viewProfile = async (req, res) => {
	try {
		//take user email from req.user(we added decode token into req.user)

		const email = req.user.email;

		//find user profile
		const profile = await User.findOne({ email }, { password: 0 });

		//response

		res.status(200).json({
			success: true,
			message: 'User profile fetched successfully',
			data: {
				data: profile,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			messahe: 'Found some error while fetched profil',
		});
	}
};

//.................................user can view other user's profile......................................../

exports.view = async (req, res) => {
	try {
		//destructured user id from req.params
		const { _Id } = req.params;

		//find user
		const profile = await User.findOne({ _id: _Id });

		//if user'profile not found then return with error message
		if (!profile) {
			return res.json({
				success: false,
				message: 'User not exist',
			});
		}
		//response

		res.status(200).json({
			success: true,
			message: 'User profile fetched successfully',
			data: {
				data: profile,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			messahe: 'Found some error while fetched profil',
		});
	}
};

//.................................user can view his or her followers......................................../

exports.viewFollowers = async (req, res) => {
	try {
		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//find follwers
		const follower = await User.find(
			{
				following: userId,
			},
			{ userName: 1 }
		);

		//if user not follow anyone then return with error message
		if (!follower) {
			return res.json({
				success: false,
				message: 'No one following you ,you have not any followers',
			});
		}

		//response

		res.json({
			success: true,
			message: 'Followers fetched successfully',
			data: {
				followers: follower,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			messahe: 'Found some error while fetched followers',
		});
	}
};

//.................................user can view his or her following......................................../

exports.viewFollowings = async (req, res) => {
	try {
		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//find follwers
		const following = await User.find(
			{
				followers: userId,
			},
			{ userName: 1 }
		);

		//if user not follow anyone then return with error message
		if (!following) {
			return res.json({
				success: false,
				message: 'You are not following  to anyone ',
			});
		}

		//response

		res.json({
			success: true,
			message: 'Followings fetched successfully',
			data: {
				followings: following,
			},
		});
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			messahe: 'Found some error while fetched followings',
		});
	}
};
