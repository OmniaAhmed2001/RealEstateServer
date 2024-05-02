import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  countListing,
  maxPrice,
  sendOrder,
  paymentUpdateListing,
} from "../controllers/createListing.controller.js";

const listingRouter = express.Router();

listingRouter.post("/create", verifyToken, createListing);
listingRouter.delete("/delete/:id", verifyToken, deleteListing);
listingRouter.post("/update/:id", verifyToken, updateListing);
listingRouter.get("/get/countListings", countListing);
listingRouter.get("/get/maxPrice", maxPrice);
listingRouter.get("/get/:id", getListing);
listingRouter.get("/get", getListings);
listingRouter.post("/create-checkout-session", verifyToken, sendOrder);
listingRouter.post(`/updatePayment/:id`, verifyToken, paymentUpdateListing);



export default listingRouter;
