const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.User.findMany();

exports.findById = (id) =>
  prisma.User.findUnique({ where: { user_id: Number(id) } });

exports.create = ({ nama, email, password, photo }) =>
  prisma.User.create({ data: { nama, email, password, photo } });

exports.update = (id, data) =>
  prisma.User.update({ where: { user_id: Number(id) }, data }).catch(
    () => null
  );

exports.remove = (id) =>
  prisma.User.delete({ where: { user_id: Number(id) } }).catch(() => null);
