import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  countListing,
} from "../controllers/createListing.controller.js";

const listingRouter = express.Router();

listingRouter.post("/create", verifyToken, createListing);
listingRouter.delete("/delete/:id", verifyToken, deleteListing);
listingRouter.post("/update/:id", verifyToken, updateListing);
listingRouter.get("/get/:id", getListing);
listingRouter.get("/get", getListings);
listingRouter.get("/get/countListings", countListing);

listingRouter.post("/create-paypal-order", verifyToken, sendOrder);


export default listingRouter;
