const prisma = require("../prisma/prismaClient");
exports.findAll = () => prisma.User.findMany();

exports.findById = (id) =>
  prisma.User.findUnique({ where: { user_id: Number(id) } });

exports.create = ({
  nama,
  username,
  password,
  photo,
  NIK,
  agama,
  alamat,
  jenis_kel,
  no_hp,
}) =>
  prisma.User.create({
    data: {
      nama,
      username,
      password,
      photo,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
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

exports.findByNIK = (NIK) => {
  return prisma.user.findUnique({
    where: { NIK },
  });
};
