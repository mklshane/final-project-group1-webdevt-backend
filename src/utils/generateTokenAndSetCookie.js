// utils/generateTokenAndSetCookie.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateTokenAndSetCookie = (userData, res) => {
  const token = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in prod, false in dev
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // critical!
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/", // ensure cookie is sent to all routes
  });

  return token;
};

export default generateTokenAndSetCookie;
