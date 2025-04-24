const Joi = require("joi");

// Skema validasi Joi
const keuanganSchema = Joi.object({
  jenisTransaksi: Joi.string().required(),
  keterangan: Joi.string().required(),
  kategori: Joi.string().required(),
  tanggal: Joi.date().required(),
  jumlah: Joi.number().required(),
  catatan: Joi.string().allow(""),
});

const validateKeuanganInput = (req, res, next) => {
  try {
    const { tanggal } = req.body;

    if (tanggal && /^\d{2}-\d{2}-\d{4}$/.test(tanggal)) {
      const [day, month, year] = tanggal.split("-");
      req.body.tanggal = new Date(`${year}-${month}-${day}`);
    }

    const { error } = keuanganSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = validateKeuanganInput;
