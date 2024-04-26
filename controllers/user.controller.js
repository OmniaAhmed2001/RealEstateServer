import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  res.json({ message: "Api is working!" });
};
export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {}
  } else {
    return next(errorHandler(401, "You can only view Your own Listings!"));
  }
};
export const deleteUser = () => {};
export const updateUser = () => {};
