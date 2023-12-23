//....................importing.......................
const express = require('express');
const router = express.Router();

//.............................importing controllers............................../

const { auth } = require('../middlewares/auth');
const {
	postCreate,
	postUpdate,
	postDelete,
	viewPost,
	likePost,
	unlikePost,
	commentPost,
	deleteCommentPost,
	feed,
} = require('../controllers/postController');

//.....................Handling HTTP request for  create post (Post API).................//

router.post('/posts/create', auth, postCreate);

//.....................Handling HTTP request for  update post (put API).................//

router.put('/posts/update/:_id', auth, postUpdate);

//.....................Handling HTTP request for  delete post (delete API).................//

router.delete('/posts/delete/:_id', auth, postDelete);

//.....................Handling HTTP request for  view post (get API).................//

router.get('/posts/view', auth, viewPost);

//.....................Handling HTTP request for  like post (post API).................//

router.post('/posts/like/:_postId', auth, likePost);

//.....................Handling HTTP request for  unlike post (post API).................//

router.post('/posts/unlike/:_postId', auth, unlikePost);

//.....................Handling HTTP request for  comment  post (post API).................//

router.post('/posts/Comment/:_postId', auth, commentPost);

//.....................Handling HTTP request for   delete comment  post (post API).................//

router.post('/posts/unComment/:_postId', auth, deleteCommentPost);

//.....................Handling HTTP request for   delete comment  post (post API).................//

router.get('/posts/feed', auth, feed);

//................exportin........................................................../

module.exports = router;
