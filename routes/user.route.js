import express from "express";

import {
  deleteUser,
  test,
  updateUser,
  updateUserFavorites,
  getUserListings,
  getUser,
  getUsersCount,
} from "../controllers/user.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.post("/updateFavorites/:id",verifyToken,updateUserFavorites)
router.get("/listings/:id", verifyToken, getUserListings);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/allUsers", getUsersCount);
router.get("/:id", verifyToken, getUser);

export default router;
