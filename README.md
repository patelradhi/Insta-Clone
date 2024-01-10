# Project Overview

Welcome to Blogging-Site, a dynamic Node.js application designed to provide a seamless blogging experience for users. Leveraging the power of the MERN stack, this platform ensures a robust schema accommodating user roles. The user-centric features include secure authentication, allowing users to register, login, and customize profiles.

# Key Features

## Users Features

-   User Login
-   User Signup
-   Update-profile --> (User can update only his/her profile)
-   View-profile --> (User can view his/her profile)
-   View --> (User can view other user's profile by id)
-   Follow
-   Unfollow
-   View-Followers --> (User can veiw his/her followers)
-   View-Followings --> (User can veiw his/her following)

## post Features

-   Post-Create --> (User can create post)
-   Post-update --> (User can update only his/her post)
-   Post-delete --> (User can delete only his/her post)
-   post-view --> (User can veiw only his/her post)
-   Post-like
-   Post-unlike --> (User can unlike post after liked it)
-   post-comment --> ( user can view all posts of the users he/she is following )  
     (likeinstagram feed)
-   post-deleteComment
-   Post-feed

# Schema

### User-Schema

```js
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
```

### Like-Schema

```js
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
```

### post-Schema

```js
const postSchema = new mongoose.Schema(
	{
		caption: {
			type: String,
			required: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		mediaLink: {
			type: String,
		},
		public_id: {
			type: String,
		},
		like: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Like',
			},
		],

		comment: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment',
			},
		],
	},
	{
		timestamps: true,
		versionKey: false,
	}
);
```

### comment-Schema

```js
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
```
