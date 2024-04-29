import express from "express";

import {
  deleteUser,
  test,
  updateUser,
  getUserListings,
  getUser,
} from "../controllers/user.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/:id", verifyToken, getUser);

export default router;
