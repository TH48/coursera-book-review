const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Check if the username is already taken
  if (users.includes(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the list
  users.push({ id: Date.now(), username: username, password: password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const { isbn } = req.params;
  const book = await books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const { author } = req.params;
  const booksArray = Object.values(books);

  const booksByAuthor = booksArray.filter(book => book.author === author);

  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const { title } = req.params;
  const booksArray = Object.values(books);

  const booksByTitle = booksArray.filter(book => book.title.includes(title));

  return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  //Write your code here
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
