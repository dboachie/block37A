// Clear and repopulate the database.

const db = require("./index");
const { faker } = require("@faker-js/faker");

async function seed() {
  console.log("Seeding the database.");
  try {
    // Clear the database.
    await db.query("DROP TABLE IF EXISTS store, items, reviews, users, comments;");

    // Recreate the tables
    await db.query(`
      CREATE TABLE store (
        id SERIAL PRIMARY KEY,
        details TEXT NOT NULL,
        title TEXT NOT NULL

      );

      CREATE TABLE items(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        price INT NOT NULL

        );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        score INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items(id)

      );

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
        
      );

      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        user_id SERIAL REFERENCES users(id) NOT NULL,
        review_id SERIAL REFERENCES reviews(id) NOT NULL,
        CONSTRAINT unique_user_id_and_review_id UNIQUE (user_id, review_id)
      );


    `);

  } catch (err) {
    console.error(err);
  }

}

// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;