const { z } = require("zod");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { signToken } = require("../utils/token");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager", "staff"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.create(data);
  const token = signToken({ userId: user._id, role: user.role });

  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });

  if (!user || !(await user.comparePassword(data.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user._id, role: user.role });

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = { register, login, me };
