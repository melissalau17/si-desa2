const Joi = require("joi");

const userSchema = Joi.object({
  nama: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().optional().allow(null, ""),
  password: Joi.string().min(6).required(),
  NIK: Joi.string().required(),
  agama: Joi.string().required(),
  alamat: Joi.string().required(),
  no_hp: Joi.string().required(),
  jenis_kel: Joi.string().required(),
  role: Joi.string().required(),

  // Validasi foto profil
  photo: Joi.string()
    .optional()
    .custom((value, helpers) => {
      // Cek apakah format Base64 valid
      const base64Pattern = /^data:image\/(jpeg|png|jpg);base64,/;
      if (!base64Pattern.test(value)) {
        return helpers.message(
          "Invalid photo format. Must be a base64 encoded image."
        );
      }
      // Cek ukuran base64 (contohnya maksimal 10MB)
      const base64Data = value.split(",")[1]; // Ambil bagian setelah "data:image/png;base64,"
      if (Buffer.from(base64Data, "base64").length > 10 * 1024 * 1024) {
        return helpers.message("Photo size must be less than 10MB.");
      }
      return value; // Jika valid, lanjutkan
    }),
});

const validateUserInput = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
};

module.exports = validateUserInput;
