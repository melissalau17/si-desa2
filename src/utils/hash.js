const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password harus string dan tidak boleh kosong");
  }
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  verifyPassword,
};
