import pool from './db';

export const createTables = async (): Promise<void> => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        contactNumber VARCHAR(15),
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profilePicUrl TEXT,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Roles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Roles (
        id SERIAL PRIMARY KEY,
        roleName VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    // UserRoles Table (many-to-many)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS UserRoles (
        userId INT REFERENCES Users(id) ON DELETE CASCADE,
        roleId INT REFERENCES Roles(id) ON DELETE CASCADE,
        PRIMARY KEY (userId, roleId)
      );
    `);

    // Hotels Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Hotels (
        id SERIAL PRIMARY KEY,
        hostId INT REFERENCES Users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        roomCount INT,
        location VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rooms Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Rooms (
        id SERIAL PRIMARY KEY,
        hotelId INT REFERENCES Hotels(id) ON DELETE CASCADE,
        roomType VARCHAR(100),
        title VARCHAR(200),
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        capacity INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Images Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Images (
        id SERIAL PRIMARY KEY,
        roomId INT REFERENCES Rooms(id) ON DELETE CASCADE,
        imageUrl TEXT NOT NULL
      );
    `);

    // Amenities Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Amenities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100),
        roomId INT REFERENCES Rooms(id) ON DELETE CASCADE
      );
    `);

    // Bookings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Bookings (
        id SERIAL PRIMARY KEY,
        userId INT REFERENCES Users(id) ON DELETE CASCADE,
        roomId INT REFERENCES Rooms(id) ON DELETE CASCADE,
        bookingFrom DATE NOT NULL,
        bookingTill DATE NOT NULL,
        totalNights INT,
        numberOfOccupants INT,
        costPerNight DECIMAL(10,2),
        totalCost DECIMAL(10,2),
        bookedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending'
      );
    `);

    // Wishlists Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Wishlists (
        id SERIAL PRIMARY KEY,
        userId INT REFERENCES Users(id) ON DELETE CASCADE,
        roomId INT REFERENCES Rooms(id) ON DELETE CASCADE
      );
    `);

    // Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Reviews (
        id SERIAL PRIMARY KEY,
        roomId INT REFERENCES Rooms(id) ON DELETE CASCADE,
        userId INT REFERENCES Users(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.log("Error creating tables:", err);
  }
};
