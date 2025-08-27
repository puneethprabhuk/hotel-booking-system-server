import { Router } from "express";
import { UserController } from "./controllers/UserController";

const router = Router();

new UserController(router);

export default router;
