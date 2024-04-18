import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If email already exists, create an error object with the email attached
      const error = errorHandler(400, "Email already exists");
      throw error; // Throw the error
    }

    // If email doesn't exist, hash the password and create a new user
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json("User Created Successfully");
  } catch (error) {
    //calls the middleware error function in utils
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser)
      return next(
        errorHandler(
          404,
          "Incorrect email address or password, please try again"
        )
      );
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword)
      return next(
        errorHandler(
          401,
          "Incorrect email address or password, please try again"
        )
      );
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};
