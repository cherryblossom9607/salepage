import bcryptjs from "bcryptjs";

const hashPassword = async (password) => {
  // Added a try-catch block for error handling
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password."); // Re-throw or handle the error appropriately
  }
};

export { hashPassword };
