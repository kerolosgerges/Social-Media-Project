import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me";

export function signAccessToken(user) {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}
