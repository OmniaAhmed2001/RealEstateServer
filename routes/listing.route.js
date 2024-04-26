import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { createListing } from "../controllers/createListing.controller.js";

const listingRouter = express.Router();

listingRouter.post("/listing", verifyToken, createListing);

export default listingRouter;
