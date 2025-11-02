import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateTokenAndSetCookie = (userData, res) => {
  const token = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // utils/generateTokenAndSetCookie.js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,                    // REQUIRED in production
  sameSite: "none",                // REQUIRED for cross-site (frontend ≠ backend domain)
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
  domain: ".onrender.com",         // Critical: share cookie across subdomains
});

  return token;
};

export default generateTokenAndSetCookie;
