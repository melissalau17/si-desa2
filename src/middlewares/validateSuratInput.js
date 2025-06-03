const Joi = require("joi");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

const base64Pattern = /^data:([a-zA-Z0-9\/\.\-]+);base64,/;

const suratSchema = Joi.object({
  NIK: Joi.string().required(),
  nama: Joi.string().required(),
  tempat_lahir: Joi.string().required(),
  tanggal_lahir: Joi.date().required(),
  jenis_kelamin: Joi.string().required(),
  agama: Joi.string().required(),
  alamat: Joi.string().required(),
  no_hp: Joi.string().required(),
  email: Joi.string().email().required(),
  tujuan_surat: Joi.string().required(),
  jenis_surat: Joi.string().required(),

  photo_ktp: Joi.string()
    .optional()
    .custom((value, helpers) => {
      const match = value.match(base64Pattern);
      if (!match) {
        return helpers.message(
          "photo_ktp harus berupa data Base64 dengan tipe MIME yang valid."
        );
      }

      const mimeType = match[1];
      if (!allowedMimeTypes.includes(mimeType)) {
        return helpers.message(
          `Tipe file photo_ktp '${mimeType}' tidak didukung.`
        );
      }

      const base64Data = value.split(",")[1];
      if (Buffer.from(base64Data, "base64").length > 10 * 1024 * 1024) {
        return helpers.message("Ukuran file photo_ktp harus kurang dari 10MB.");
      }

      return value;
    }),

  photo_kk: Joi.string()
    .optional()
    .custom((value, helpers) => {
      const match = value.match(base64Pattern);
      if (!match) {
        return helpers.message(
          "photo_kk harus berupa data Base64 dengan tipe MIME yang valid."
        );
      }

      const mimeType = match[1];
      if (!allowedMimeTypes.includes(mimeType)) {
        return helpers.message(
          `Tipe file photo_kk '${mimeType}' tidak didukung.`
        );
      }

      const base64Data = value.split(",")[1];
      if (Buffer.from(base64Data, "base64").length > 10 * 1024 * 1024) {
        return helpers.message("Ukuran file photo_kk harus kurang dari 10MB.");
      }

      return value;
    }),
});

const validateSuratInput = (req, res, next) => {
  const { error } = suratSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

module.exports = validateSuratInput;
