const validateCreateUser = (body) => {
  if (body.name !== undefined && body.fullName === undefined) {
    body.fullName = body.name;
  }
  const { fullName, email, password, role, status, phone } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    const error = new Error("Full name is required and must be at least 2 characters");
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("Password is required and must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  if (!role || !["ADMIN", "LECTURER", "STUDENT"].includes(role)) {
    const error = new Error("Role is required and must be ADMIN, LECTURER, or STUDENT");
    error.statusCode = 400;
    throw error;
  }

  if (status && !["ACTIVE", "INACTIVE", "BLOCKED"].includes(status)) {
    const error = new Error("Status must be ACTIVE, INACTIVE, or BLOCKED");
    error.statusCode = 400;
    throw error;
  }

  if (phone && typeof phone !== "string") {
    const error = new Error("Phone number must be a string");
    error.statusCode = 400;
    throw error;
  }
};

const validateUpdateUser = (body) => {
  if (body.name !== undefined && body.fullName === undefined) {
    body.fullName = body.name;
  }
  const { fullName, email, password, role, status, phone } = body;

  if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim().length < 2)) {
    const error = new Error("Full name must be at least 2 characters");
    error.statusCode = 400;
    throw error;
  }

  if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  if (role !== undefined && !["ADMIN", "LECTURER", "STUDENT"].includes(role)) {
    const error = new Error("Role must be ADMIN, LECTURER, or STUDENT");
    error.statusCode = 400;
    throw error;
  }

  if (status !== undefined && !["ACTIVE", "INACTIVE", "BLOCKED"].includes(status)) {
    const error = new Error("Status must be ACTIVE, INACTIVE, or BLOCKED");
    error.statusCode = 400;
    throw error;
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    const error = new Error("Phone number must be a string");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
