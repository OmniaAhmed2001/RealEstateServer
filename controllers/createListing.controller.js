import stripe from "stripe";

import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    console.log("done");
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
    console.log("error");
  }
};
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing is Not Found"));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(404, "You can Only delete your own Listings"));
  }
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Lising is not found"));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only update your own Listings"));
  }
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Not Found Listing"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  //make sure user is a previous buyer or renter

  if (!listing) {
    return next(errorHandler(404, "Listing is Not Found"));
  } else if (!listing.previousBuyers.find((e) => e === req.body.id))
    return next(errorHandler(403, "User is not a buyer/renter"));

  const userIndex = listing.reviews.findIndex(
    (review) => review.id === req.body.id
  );
  try {
    //check if user already reviewed then update only
    if (userIndex !== -1) {
      listing.reviews[userIndex] = req.body;
    } else {
      listing.reviews.push(req.body);
    }

    await listing.save();
    console.log("sent to backend", req.body, "\nNEW", listing);
    res.status(200).json(listing);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

export const getFavoriteListings = async (req, res, next) => {
  try {
    
    if (req.user.id !== req.params.id)
      return next(
        errorHandler(401, "you can only update your own favorite list!")
      );

    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found!"));

    const listings = await Listing.find({
      _id: { $in: user.favorites },
    });
    console.log("listings", listings);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }
    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const countListing = async (req, res, next) => {
  try {
    const count = await Listing.countDocuments();
    return res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const maxPrice = async (req, res, next) => {
  try {
    const maxRegularPriceListing = await Listing.find()
      .sort({ regularPrice: -1 })
      .limit(1)
      .select({ name: 1, regularPrice: 1 });

    const maxRegularPrice =
      maxRegularPriceListing.length > 0
        ? maxRegularPriceListing[0].regularPrice
        : null;
    console.log("Maximum Regular Price:", maxRegularPrice);
    res.status(200).json({
      maxPrice: maxRegularPriceListing[0].regularPrice,
      name: maxRegularPriceListing[0].name,
    });
  } catch (error) {
    next(error);
  }
};

export const sendOrder = async (req, res, next) => {
  try {
    const price = {
      currency: "usd",
      product_data: {
        name: req.body.name,
      },
      unit_amount:
        req.body.offer && req.body.discountPrice > 0
          ? req.body.discountPrice * 100
          : req.body.regularPrice * 100,
    };
    if (req.body.type === "rent") {
      price.recurring = {
        interval: "month", // Billing interval (day, week, month, or year)
        interval_count: 1, // Number of intervals between subscription billings
      };
    }
    const session = await stripe(process.env.STRIPE).checkout.sessions.create({
      line_items: [
        {
          price_data: price,
          quantity: 1,
        },
      ],
      mode: req.body.type === "rent" ? "subscription" : "payment",
      success_url: `${process.env.FRONT_END_URL}/listing/${req.body._id}?success={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/listing/${req.body._id}`,
    });
    // console.log(session);
    res.status(200).json({ session: session.url });
  } catch (error) {
    next(error);
  }
};

export const paymentUpdateListing = async (req, res, next) => {
  try {
    const session = await stripe(process.env.STRIPE).checkout.sessions.retrieve(
      req.body.session_ID
    );
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }
    console.log("sessionUpdate: ", session);

    const listing = await Listing.findById(req.params.id);
    // Check the type property
    console.log("Listing:", listing);
    const condition = listing.type === "rent" ? "rented" : "sold";

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          condition: condition,
        },
        $push: {
          previousBuyers: req.body.user_id,
        },
      },
      { new: true }
    );
    console.log({ updatedListing });
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};
