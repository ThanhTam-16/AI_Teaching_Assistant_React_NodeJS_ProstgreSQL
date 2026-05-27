const prisma = require("../config/database");
const { hashPassword } = require("../utils/bcrypt");
const { formatPaginatedResponse } = require("../utils/pagination");

const getUsers = async ({ page, limit, skip, search, role, status }) => {
  const where = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return formatPaginatedResponse(users, total, page, limit);
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const createUser = async (userData) => {
  const { email, password, fullName, role, phone, avatarUrl, status } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role,
      phone,
      avatarUrl,
      status: status || "ACTIVE",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return newUser;
};

const updateUser = async (id, updateData) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const data = { ...updateData };

  if (data.email && data.email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      const error = new Error("Email is already in use by another account");
      error.statusCode = 400;
      throw error;
    }
  }

  if (data.password) {
    data.password = await hashPassword(data.password);
  } else {
    delete data.password;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.user.delete({
    where: { id },
  });

  return { id };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
