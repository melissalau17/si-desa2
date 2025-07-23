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

const validateBase64File = (fieldName) =>
    Joi.string()
        .optional()
        .custom((value, helpers) => {
            const match = value.match(base64Pattern);
            if (!match) {
                return helpers.message(
                    `${fieldName} harus berupa data Base64 yang valid.`
                );
            }

            const mimeType = match[1];
            if (!allowedMimeTypes.includes(mimeType)) {
                return helpers.message(
                    `Tipe file ${fieldName} '${mimeType}' tidak didukung.`
                );
            }

            const base64Data = value.split(",")[1];
            if (Buffer.from(base64Data, "base64").length > 10 * 1024 * 1024) {
                return helpers.message(
                    `Ukuran file ${fieldName} harus kurang dari 10MB.`
                );
            }

            return value;
        });

const suratSchema = Joi.object({
    nik: Joi.string().required(),
    nama: Joi.string().required(),
    tempat_lahir: Joi.string().optional().allow(null, ""),
    tanggal_lahir: Joi.string()
        .optional()
        .allow(null, "")
        .custom((value, helpers) => {
            if (!value) return value

            const regex = /^\d{2}-\d{2}-\d{4}$/
            if (!regex.test(value)) {
                return helpers.error("any.invalid")
            }

            return value
        }),
    no_hp: Joi.string().optional().allow(null, ""),
    email: Joi.string().optional().allow(null, ""),
    jenis_kelamin: Joi.string().optional().allow(null, ""),
    agama: Joi.string().optional().allow(null, ""),
    alamat: Joi.string().required(),
    tujuan_surat: Joi.string().required(),
    jenis_surat: Joi.string().required(),
    waktu_kematian: Joi.string().optional(), // bisa juga null

    // Optional file fields in Base64 format
    photo_ktp: validateBase64File("photo_ktp"),
    photo_kk: validateBase64File("photo_kk"),
    foto_usaha: validateBase64File("foto_usaha"),
    gaji_ortu: validateBase64File("gaji_ortu"),
});

const validateSuratInput = (req, res, next) => {
    const { error } = suratSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
};

module.exports = validateSuratInput;
