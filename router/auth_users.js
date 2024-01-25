const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const JWT_SECRETE_KEY = "my_Secret_key";

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    return username && username.trim() !== "";
}

const authenticatedUser = async (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    const user = await users.find(user => user.username === username);
    return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", async (req, res) => {
    //Write your code here

    const { username, password } = req.body;

    // Check if the username is valid
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    // Check if the user is authenticated
    if (await authenticatedUser(username, password)) {
        // Generate a JWT token
        const user = users.find(user => user.username === username);
        delete user['password'];
        const token = jwt.sign({ user }, JWT_SECRETE_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ message: "Invalid credentials" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    //Write your code here
    const { isbn } = req.params;
    const { review } = req.body;

    // Check if the book with the given ISBN exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add the review to the book
    book.reviews[req.user.id] = review;

    // Return the updated book
    return res.status(201).json(book);
});

// Modify a book review (only the user who wrote the review can modify it)
regd_users.put("/auth/review/:isbn/:reviewId", async (req, res) => {
    const { isbn, reviewId } = req.params;
    const { newReview } = req.body;
    const userId = req.user.id;

    // Check if the book with the given ISBN exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    // Check if the review with the given reviewId exists for the current user
    const existingReview = book.reviews[reviewId];
    if (!existingReview || !book.reviews.hasOwnProperty(userId)) {
        return res.status(403).json({ message: "You are not allowed to modify this review" });
    }

    // Modify the review
    book.reviews[reviewId] = newReview;

    // Return the updated book
    return res.status(200).json(book);
});


regd_users.delete("/auth/review/:isbn/:reviewId", async (req, res) => {
    const { isbn, reviewId } = req.params;
    const userId = req.user.id;

    // Check if the book with the given ISBN exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review with the given reviewId exists for the current user
    const existingReview = book.reviews[reviewId];
    if (!existingReview || !book.reviews.hasOwnProperty(userId)) {
        return res.status(403).json({ message: "You are not allowed to delete this review" });
    }

    // Delete the review
    delete book.reviews[reviewId];

    // Return the updated book
    return res.status(200).json(book);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
