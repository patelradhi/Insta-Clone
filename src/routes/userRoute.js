//....................importing.......................
const express = require('express');
const router = express.Router();

//.............................importing controllers..................../

const {
	signUp,
	logIn,
	updateProfile,
	follow,
	ufollow,
	viewProfile,
	view,
	viewFollowers,
	viewFollowings,
} = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

//.....................Handling HTTP request for  user  signup (Post API).................//

router.post('/user/signUp', signUp);

//.....................Handling HTTP request for  user  login (Post API).................//
router.post('/user/logIn', logIn);

//.....................Handling HTTP request for    update-profile (put API).................//
router.put('/user/updateProfile', auth, updateProfile);

//.....................Handling HTTP request for  follow user   (put API).................//
router.put('/user/follow/:_id', auth, follow);

//.....................Handling HTTP request for  unfollow user (put API).................//
router.put('/user/unfollow/:_id', auth, ufollow);

//.....................Handling HTTP request for  fetch profile of user (get API).................//
router.get('/user/profile', auth, viewProfile);

//.....................Handling HTTP request for  fetch profile of user (get API).................//
router.get('/user/profile/:_Id', auth, view);

//.....................Handling HTTP request for  fetch profile of user (get API).................//
router.get('/user/followers', auth, viewFollowers);

//.....................Handling HTTP request for  fetch profile of user (get API).................//
router.get('/user/followings', auth, viewFollowings);

//................exportin...................../

module.exports = router;
