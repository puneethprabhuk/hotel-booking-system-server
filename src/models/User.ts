import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database/db";
import { config } from "../utils/config";
import { sendSuccess, sendError } from "../utils/response";
import { LoginReq, ProfilePicUpdateReq, RegisterReq } from "../types";

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
        INSERT INTO users (firstname, lastname, contactnumber, email, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, firstname, lastname, email, contactnumber
      `;

      const values = [
        userData.firstName,
        userData.lastName,
        userData.contactNumber,
        userData.email,
        hashedPassword,
      ];

      const result = await pool.query(query, values);
      const user = result.rows[0];

      // 4. Insert into userroles (default: 'user')
      const roleRes = await client.query(`SELECT id FROM roles WHERE rolename = $1`, ["user"]);
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
        { id: user.id, email: user.email, roles: [{ role_id: roleId, role_name: "user" }] },
        config.jwtSecret,
        { expiresIn: "1d" }
      );

      user.roles = [{ role_id: roleId, role_name: "user" }];
      return sendSuccess({ user, token }, "Signup success", 201);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Register error:", error);
      return sendError("Server error during registration", 500);
    } finally {
      client.release();
    }
  }

  static async login(loginReq: LoginReq) {
    try {
      const { identifier, password } = loginReq;
      const result = await pool.query(`SELECT * FROM users WHERE email = $1 or contactnumber = $1 LIMIT 1`, [identifier]);

      if (result.rows.length === 0) {
        return sendError('User not found', 400);
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendError("Invalid credentials", 401);
      }
      const rolesResult = await pool.query(
        `
          SELECT r.id, r.rolename
          FROM userroles ur
          JOIN roles r ON r.id = ur.roleid
          WHERE ur.userid = $1
      `,
        [user.id]
      );

      const roles = rolesResult.rows.map((r) => ({
        id: r.id,
        name: r.rolename,
      }));

      // 4. Generate JWT
      const token = jwt.sign({ id: user.id, email: user.email, roles }, config.jwtSecret, {
        expiresIn: "1d",
      });

      return sendSuccess(
        {
          user: {
            id: user.id,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            contactNumber: user.contactnumber,
            profilePicUrl: user.profilepicurl,
            roles,
          },
          token,
        },
        "Login successful",
        200
      );
    } catch (error) {
      console.error("Login error:", error);
      return sendError("Internal Server Error", 500);
    }
  }

  static async updateProfilePic(userData: ProfilePicUpdateReq) {
    try {
      const query = `
        UPDATE users
        SET profilepicurl = $1
        WHERE id = $2
        RETURNING id`;

      const updateResult = await pool.query(query, [
        userData.profilePicUrl,
        userData.id
      ]);

      if (updateResult.rowCount === 0) {
        return sendError("User not found", 404);
      }
      return sendSuccess(updateResult.rows[0], "Profile picture updated successfully", 200);
    } catch (error) {
      console.log("Error updating profile pic", error);
      return sendError("Internal Server Error", 500);
    }
  }

  static async getAllUsers() {
    try {
      const query = `
        SELECT 
          u.id AS user_id,
          u.firstname AS first_name,
          u.lastname AS last_name,
          u.email AS email,
          u.contactnumber AS contact_number,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'role_id', r.id,
              'role_name', r.rolename
            )
          ) AS roles
        FROM users u
        LEFT JOIN userroles ur ON ur.userid = u.id
        LEFT JOIN roles r ON r.id = ur.roleid
        GROUP BY u.id, u.firstname, u.lastname, u.email, u.contactnumber
        ORDER BY u.id
      `;

      const result = await pool.query(query);
      const responseData = result.rows;
      return sendSuccess(responseData, "User Record", 200);
    } catch (error) {
      console.error("Error while fetching user record:", error);
      return sendError("Server error fetching user record", 500);
    }
  }
}
