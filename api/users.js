// An instructor can only access their own students' data.
const router = require("express").Router();
const db = require("../db/index");


const isLoggedIn = async (req, res, next) => {
    try {
        req.user = await findUserWithToken(req.headers.authorization);
        next();
    }
    catch (ex) {
        next(ex);
    }
};

const findUserWithToken = async (token) => {
    let id;
    try {
        const payload = await jwt.verify(token, JWT);
        id = payload.id;
    }
    catch (ex) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    const SQL = `
      SELECT id, username
      FROM users
      WHERE id = $1
    `;
    const response = await client.query(SQL, [id]);
    if (!response.rows.length) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    return response.rows[0];

}


// Get all items
router.get("/items", async (req, res, next) => {


    try {
        const { rows: items } = await db.query(
            "SELECT * FROM items",


        );
        res.send(items);
    } catch (error) {
        next(error);
    }
});


// Get all ids for items
router.get("/items/:itemId", async (req, res, next) => {
    try {
        const { rows: items } = await db.query(
            "SELECT * FROM items WHERE id = $1",

            [req.params.itemId]
        );
        res.send(items);
    } catch (error) {
        next(error);
    }
});


// Get all reviews
router.get("/items/:itemId/reviews", async (req, res, next) => {
    try {
        const { rows: reviews } = await db.query(
            "SELECT * FROM reviews WHERE item_id = $1",

            [req.params.itemId]
        );
        res.send(reviews);
    } catch (error) {
        next(error);
    }
});


// Get all ids for reviews
router.get("/items/:itemId/reviews/:reviewId", async (req, res, next) => {
    try {
        const { rows: items } = await db.query(
            "SELECT * FROM reviews WHERE item_id = $1 AND id = $2",

            [req.params.itemId, req.params.reviewId]
        );
        res.send(items);
    } catch (error) {
        next(error);
    }
});

// All reviews current logged in person wrote
router.get("/reviews/me", isLoggedIn, async (req, res, next) => {
    try {
        const { rows: items } = await db.query(
            "SELECT * FROM reviews join comments ON reviews.id = comments.review_id WHERE comments.user_id = $1",

            [req.user.id]
        );
        res.send(items);
    } catch (error) {
        next(error);
    }
});


router.get("/comments/me", isLoggedIn, async (req, res, next) => {
    try {
        const { rows: items } = await db.query(
            "SELECT * FROM comments WHERE user_id = $1",

            [req.user.id]
        );
        res.send(items);
    } catch (error) {
        next(error);
    }
});



// Create a new review
router.post("/items/:itemId/reviews", isLoggedIn, async (req, res, next) => {

    const { text, score } = req.body;
    const { itemId } = req.params;

    try {
        const create_review = await db.query(

            "INSERT INTO reviews (text, score, item_id) VALUES ($1, $2, $3) RETURNING *",
            [text, score, itemId]
        );
        res.status(201).send(create_review);
    } catch (error) {
        next(error);
    }
});

// Create a new comment
router.post("/items/:itemId/reviews/:reviewId/comments", isLoggedIn, async (req, res, next) => {
    const { text } = req.body;
    const { reviewId } = req.params;
    const { id } = req.user;

    try {
        const create_comment = await db.query(

            "INSERT INTO comments (text, user_id, review_id) VALUES ($1, $2, $3) RETURNING *",
            [text, id, reviewId]
        );
        res.status(201).send(create_comment);
    } catch (error) {
        next(error);
    }
});


// Update a review
router.put("/:userId/reviews/:reviewId", isLoggedIn, async (req, res, next) => {
    const { userId, reviewId } = req.params;
    const { new_review, new_score } = req.body;

    try {

        const update_review = await db.query(
            "UPDATE reviews SET text = $1, score = $2 WHERE id = $3 RETURNING *",



            [new_review, new_score, reviewId]
        );


        res.status(201).send(update_review);
    } catch (error) {
        next(error);
    }
});


// Update a comment
router.put("/:userId/comments/:commentId", isLoggedIn, async (req, res, next) => {
    const { userId, commentId } = req.params;
    const { new_comment } = req.body;

    try {

        const update_comment = await db.query(
            "UPDATE comments SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING *",



            [new_comment, commentId, userId]
        );


        res.status(201).send(update_comment);
    } catch (error) {
        next(error);
    }
});



// Delete a comment
router.delete("/:userId/comments/:commentId", isLoggedIn, async (req, res, next) => {
    const { userId, commentId } = req.params

    try {
        const delete_comments = await db.query(
            "DELETE FROM comments WHERE user_id = $1 AND review_id = $2 RETURNING *",
            [req.params.userId, req.params.commentId]
        );

        if (!user) {
            return res.status(404).send("User not found.");
        }

        res.send(user);
    } catch (error) {
        next(error);
    }
});

// Delete a review
router.delete("/:userId/reviews/:reviewId", isLoggedIn, async (req, res, next) => {
    const { userId, reviewId } = req.params

    try {
        const delete_reviews = await db.query(
            "DELETE FROM reviews WHERE review_id = $1 RETURNING *",
            [req.params.reviewId]
        );

        if (!user) {
            return res.status(404).send("User not found.");
        }

        res.send(user);
    } catch (error) {
        next(error);
    }
});

// Deny access if user is not logged in
router.use((req, res, next) => {
    if (!req.user) {
        return res.status(401).send("You must be logged in to do that.");
    }
    next();
});


module.exports = { router, isLoggedIn }


