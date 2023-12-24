//............................................importing......................../

const Post = require('../model/postModel');
const Like = require('../model/likeModel');
const Comment = require('../model/commentModel');
const User = require('../model/userModel');
const { fileUploadToCloudinary } = require('../utils');
const { isFileTypeSupported } = require('../utils');
const cloudinary = require('cloudinary').v2;

//............................................create post................................................../

exports.postCreate = async (req, res) => {
	try {
		//destructured feild from req.body
		const { caption } = req.body;
		const postImage = req.files.images;

		//take user objectId from req.user(we added decode token into req.user)
		const userId = req.user._id;

		//validation

		if (!caption || !postImage) {
			return res.status(400).json({
				success: false,
				message: 'No post Image and caption are uploaded',
			});
		}

		//check if file type supported or not

		const supportedFile = ['jpg', 'jpeg', 'png'];
		const fileType = postImage.name.split('.')[1].toLowerCase();

		if (!isFileTypeSupported(fileType, supportedFile)) {
			return res.status(415).json({
				message: 'File format not supported',
			});
		}

		//file upload to cloudinary
		const response = await fileUploadToCloudinary(postImage, 'insta-clon');

		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'file not upload to cloudinary',
			});
		}

		//entry in db

		const createdPost = await Post.create({
			caption: caption,
			mediaLink: response.secure_url,
			author: userId,
			public_id: response.public_id,
		});

		//response

		res.status(200).json({
			success: true,
			message: 'Post created successfully',
			data: {
				post: createdPost,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'found some error while creating post',
		});
	}
};

//...........................................update post(only her/his post)..................................................../

exports.postUpdate = async (req, res) => {
	try {
		//destructured  post id from req.params
		const { _id } = req.params;
		const userId = req.user._id;

		//destructured  fields from req.body
		const { caption } = req.body;
		const postImage = req.files.images;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _id,
			author: userId,
		});

		//if post not found then return with error message

		if (!postFind) {
			return res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//find old post(for remove old image from cloudinary)

		const oldPost = await Post.findOne({ _id: _id });

		//check if file type supported or not

		const supportedFile = ['jpg', 'jpeg', 'png'];
		const fileType = postImage.name.split('.')[1].toLowerCase();

		if (!isFileTypeSupported(fileType, supportedFile)) {
			return res.status(415).json({
				message: 'File format not supported',
			});
		}

		//file upload to cloudinary
		const uploaded = await fileUploadToCloudinary(postImage, 'insta-clon');

		//if file not uploaded successfully then return with error
		if (!uploaded) {
			return res.status(400).json({
				success: false,
				message: 'file not upload to cloudinary',
			});
		}

		//find post and update

		const response = await Post.findOneAndUpdate(
			{
				_id: _id,
				author: userId,
			},
			{
				$set: {
					caption: caption,
					mediaLink: uploaded.secure_url,
					public_id: uploaded.public_id,
				},
			},
			{ new: true }
		);

		//if user want to update others post then retuen with error message

		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'You can not update others post',
			});
		}

		//post update at cloudinary........................

		// Public ID of the image you want to delete
		const publicId = oldPost.public_id;

		// Delete image
		cloudinary.uploader.destroy(publicId, (error, result) => {
			if (error) {
				console.error('Error deleting image:', error);
			} else {
			}
		});

		//response
		res.status(200).json({
			success: true,
			message: 'Post updated successfully',
			data: {
				post: response,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some while updating post',
		});
	}
};

//...........................................delete post(only her/his post)..................................................../
exports.postDelete = async (req, res) => {
	try {
		//destructured  post id from req.params
		const { _id } = req.params;
		const userId = req.user._id;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _id,
			author: userId,
		});

		//if post not found then return with error message

		if (!postFind) {
			return res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//find and delete post
		const response = await Post.findOneAndDelete(
			{
				_id: _id,
				author: userId,
			},
			{ new: true }
		);

		//if user want to delete others post then retuen with error message

		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'You can not delete others post',
			});
		}

		//response
		res.status(200).json({
			success: true,
			message: 'Post deleted successfully',
			data: {
				post: response,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some  error while deleting post',
		});
	}
};

//...........................................veiw post(only her/his post)..................................................../
exports.viewPost = async (req, res) => {
	try {
		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//fins post

		const response = await Post.find({
			author: userId,
		});

		//if post not found then return with error message
		if (!response) {
			return res.status(400).json({
				success: false,
				message: 'No any post created by you',
			});
		}

		//response
		res.status(200).json({
			success: true,
			message: 'Posts fetched successfully',
			data: {
				response,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Found some error while fetching post',
		});
	}
};

//........................................... like post ..................................................../
exports.likePost = async (req, res) => {
	try {
		//destructured postId from req.params

		const { _postId } = req.params;

		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _postId,
		});

		//if post not found then return with error message

		if (!postFind) {
			return res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//check user allready liked this post or not

		const likedPost = await Like.findOne({ user: userId, post: _postId });

		//if user allready liked this post then return with message

		if (likedPost) {
			return res.status(400).json({
				success: false,
				message: 'You have allready liked this post',
			});
		}

		//create like

		const response = await Like.create({
			user: userId,
			post: _postId,
		});

		const likeId = response._id;

		//add like into user like array

		const ans = await Post.findByIdAndUpdate(
			_postId,
			{
				$push: {
					like: likeId,
				},
			},
			{
				new: true,
			}
		);

		//response

		res.status(200).json({
			success: true,
			message: 'Post liked successfully',
			like: {
				response,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while unlike',
		});
	}
};

//........................................... unlike post ..................................................../
exports.unlikePost = async (req, res) => {
	try {
		//destructured postId from req.params

		const { _postId } = req.params;

		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _postId,
		});

		//if post not found then return with error message

		if (!postFind) {
			return res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//check user like  this post or not

		const likedPost = await Like.findOne({ user: userId, post: _postId });

		//if user not liked  this post then user can not unlike this post so  return with error message

		if (!likedPost) {
			return res.status(400).json({
				success: false,
				message: 'You can not unlike this post,before like it',
			});
		}

		//unlike like

		const response = await Like.findOneAndDelete({ user: userId, post: _postId });

		//pull like from user like array

		const ans = await Post.findByIdAndUpdate(
			_postId,
			{
				$pull: {
					like: response._id,
				},
			},
			{
				new: true,
			}
		);

		if (response.deletedCount == 0) {
			res.status(400).json({
				success: false,
				message: 'You have not liked this post yet',
			});
		}
		//response

		res.status(200).json({
			success: true,
			message: 'Post unliked successfully',
			like: {
				response,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while unlike',
		});
	}
};

//...............................................comment on postpost............................................./

exports.commentPost = async (req, res) => {
	try {
		//destructured post id from req.params
		const { _postId } = req.params;

		//destructured body from req.params
		const { newComment } = req.body;

		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _postId,
		});

		//if post not found then return with error message

		if (!postFind) {
			return res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//create comment

		const commented = await Comment.create({
			body: newComment,
			post: _postId,
			user: userId,
		});

		const commentId = commented._id;
		//add comment into post comment array

		const ans = await Post.findByIdAndUpdate(
			_postId,
			{
				$push: {
					comment: commentId,
				},
			},
			{
				new: true,
			}
		);

		//response

		res.status(200).json({
			success: true,
			message: 'Comment created successfully',
			data: {
				comment: commented,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while  created comment on post',
		});
	}
};

//............................................... delete comment on post............................................./

exports.deleteCommentPost = async (req, res) => {
	try {
		//destructured post id from req.params
		const { _postId } = req.params;
		const { _id } = req.body;

		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//check post exist or not

		const postFind = await Post.findOne({
			_id: _postId,
		});

		//if post not found then return with error message

		if (!postFind) {
			res.status(400).json({
				success: false,
				message: 'This post is not exist',
			});
		}

		//delete comment

		const response = await Comment.deleteOne({ user: userId, _id: _id });

		if (response.deletedCount == 0) {
			return res.status(400).json({
				success: false,
				message: 'You did not comment on this post',
			});
		}

		//add comment into post comment array

		const ans = await Post.findByIdAndUpdate(_postId, {
			$pull: {
				comment: _id,
			},
		});

		//response

		res.status(200).json({
			success: true,
			message: 'Comment deleted successfully',
			data: {
				id: _id,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			success: false,
			message: 'Found some error while  deleted comment on post',
		});
	}
};

//...................... user can view all posts of the users he/she is following (like instagram feed).................../

exports.feed = async (req, res) => {
	try {
		//take user objectId from req.user(we added decode token into req.user)

		const userId = req.user._id;

		//find following
		const following = await User.find(
			{
				followers: userId,
			},
			{ userName: 1 }
		);

		//find new array only with  objectId(whome user follow)
		const ab = following.map((item) => {
			return item._id;
		});

		//find post of  all users whose followed by user
		const post = await Post.find({
			author: {
				$in: ab,
			},
		});

		res.status(200).json({
			success: true,
			message: 'Post finded successfully',
			data: {
				posts: post,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Found some error while  find post',
		});
	}
};
