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
      // If email already exists, create an error with a custom message.
      const error = errorHandler(400, "Email already exists.");
      throw error; // Throw the error
    } else if (password.length < 6) {
      //If no password entered, create an error with a custom message.
      const error = errorHandler(400, "Password not valid.");
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
    console.log(token)
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true,secure:false,domain:"localhost",path:"/" })
      .status(200)
      .json({...rest,token});
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  console.log("google account info", req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // Update the avatar with the req.body.photo value
      if (
        user.avatar ===
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
      ) {
        user.avatar = req.body.photo;
        await user.save();
      }

      //if the email already exists in the database, we will generate a token and send it to the client as access_token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      console.log(token)
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { secure: false })
        .status(200)
        .json(rest);
      console.log("user already here", user);
    } else {
      //if email doesn't exist generate a password for the user and add the user to the database
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase(),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      //save the new user
      await newUser.save();
      //generate a token and send it as a cookie access_token to the client
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ message: "Sign out success" });
  } catch (error) {
    next(error);
  }
};

