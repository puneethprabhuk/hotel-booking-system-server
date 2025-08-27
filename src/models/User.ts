import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database/db";
import { config } from "../utils/config";
import { sendSuccess, sendError } from "../utils/response";
import { RegisterReq } from "../types";

export class User {
  static async register(userData: RegisterReq) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // 1. Validate if email or phone already exists
      const exists = await pool.query(
        `SELECT id FROM users WHERE email = $1 OR contactnumber = $2`,
        [userData.email, userData.contactNumber]
      );

      if (exists.rowCount > 0) {
        await client.query("ROLLBACK");
        return sendError("Email or Contact number already exists", 400);
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(userData.password, config.bcryptSaltRounds);

      // 3. Insert user
      const query = `
        INSERT INTO users (firstname, lastname, contactnumber, email, password, profilepicurl)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, firstname, lastname, email, contactnumber, profilepicurl
      `;

      const values = [
        userData.firstName,
        userData.lastName,
        userData.contactNumber,
        userData.email,
        hashedPassword,
        userData.profilePicUrl
      ];

      const result = await pool.query(query, values);
      const user = result.rows[0];

      // 4. Insert into userroles (default: 'user')
      const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, ["user"]);
      if (roleRes.rowCount === 0) {
        throw new Error("Default role 'user' not found in roles table");
      }

      const roleId = roleRes.rows[0].id;

      await client.query(
        `INSERT INTO userroles (userid, roleid) VALUES ($1, $2)`,
        [user.id, roleId]
      );

      await client.query("COMMIT");
      // 5. JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: "1d" }
      );

      return sendSuccess({ user, token }, "Signup success", 201);
    } catch (error) {
      console.error("Register error:", error);
      return sendError("Server error during registration", 500);
    }
  }
}
