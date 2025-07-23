const prisma = require("../prisma/prismaClient");
exports.findAll = () => prisma.User.findMany();

exports.findById = (id) =>
  prisma.User.findUnique({ where: { user_id: Number(id) } });

exports.create = ({
  nama,
  username,
  email,
  password,
  photo,
  NIK,
  agama,
  alamat,
  jenis_kel,
  no_hp,
  role,
}) =>
  prisma.User.create({
    data: {
      nama,
      username,
      email,
      password,
      photo,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
      role,
    },
  });

exports.update = (id, data) =>
  prisma.User.update({ where: { user_id: Number(id) }, data }).catch(
    () => null
  );

exports.remove = (id) =>
  prisma.User.delete({ where: { user_id: Number(id) } }).catch(() => null);

exports.findUsername = (where) => {
  return prisma.User.findFirst({
    where: {
      username: where,
    },
  });
};

exports.findUserByUsernameOrEmailAndRole = async (identifier, role) => {
  return prisma.user.findFirst({
    where: {
      role,
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });
};

exports.findByEmail = (email) => {
  return prisma.User.findUnique({ where: { email } });
};

exports.findByUsernameOrEmail = (identifier) => {
  return prisma.User.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });
};


exports.findRole = (where) => {
  return prisma.User.findFirst({
    where: {
      role: where,
    },
  });
};

exports.findByNIK = (NIK) => {
  return prisma.User.findUnique({ 
    where: { NIK },
  });
};

