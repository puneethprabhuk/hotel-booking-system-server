import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { authenticateUser } from "../middlewares/auth.middleware";

export class UserController {
  constructor(public router: Router) {
    this.router.get("/user/alluser", this.getAllUser);
    this.router.post("/user/login", this.login);
    this.router.put("/user/updateProfilePic", this.updateProfilePic);
    this.router.put("/user/updateUser", authenticateUser, this.updateUser);
    this.router.post("/user/register", this.register);
  }

  async register(req: Request, res: Response) {
    const response = await User.register(req.body);

    if (!response.success) {
      return res.status(response.statusCode).json(response);
    }

    res.setHeader("Authorization", `Bearer ${response.data?.token}`);
    return res.status(response.statusCode).json(response);
  }

  async login(req: Request, res: Response) {
    const response = await User.login(req.body);

    if (!response.success) {
      return res.status(response.statusCode).json(response);
    }

    res.setHeader("Authorization", `Bearer ${response.data?.token}`);
    return res.status(response.statusCode).json(response);
  }

  async updateProfilePic(req: Request, res: Response) {
    const response = await User.updateProfilePic(req.body);

    if (!response.success) {
      return res.status(response.statusCode).json(response);
    }

    return res.status(response.statusCode).json(response);
  }

  async getAllUser(req: Request, res: Response) {
    const response = await User.getAllUsers();

    if (!response.success) {
      return res.status(response.statusCode).json(response);
    }

    return res.status(response.statusCode).json(response);
  }

  async updateUser(req: Request, res: Response) {
    const response = await User.updateUser(req['user'], req.body);

    if (!response.success) {
      return res.status(response.statusCode).json(response);
    }

    return res.status(response.statusCode).json(response);
  }
}
