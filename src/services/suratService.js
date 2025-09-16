const suratModel = require("../models/SuratModel");
const { Buffer } = require("buffer");

exports.getAllSurat = () => suratModel.findAll();
exports.getSuratById = (id) => suratModel.findById(id);
exports.findByNIK = (nik) => suratModel.findByNIK(nik);
const convertBase64ToBinary = (base64String) => {
    const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
    return buffer;
}

exports.createSurat = (data) => {
    const {
        nik,
        nama,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        agama,
        alamat,
        no_hp,
        email,
        jenis_surat,
        tujuan_surat,
        photo_ktp,
        photo_kk,
        foto_usaha,
        waktu_kematian,
        gaji_ortu,
    } = data;

    return suratModel.create({
        nik,
        nama,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        agama,
        alamat,
        jenis_surat,
        tujuan_surat,
        no_hp,
        email,
        photo_ktp: photo_ktp ? convertBase64ToBinary(photo_ktp) : null,
        photo_kk: photo_kk ? convertBase64ToBinary(photo_kk) : null,
        foto_usaha: foto_usaha ? convertBase64ToBinary(foto_usaha) : null,
        waktu_kematian,
        gaji_ortu: gaji_ortu ? convertBase64ToBinary(gaji_ortu) : null,
    });
};

exports.updateSurat = async (id, data) => {
    const existingSurat = await suratModel.findById(id);
    if (!existingSurat) return null;
    const updatedSurat = await suratModel.update(id, data);
    return updatedSurat;
}

exports.deleteSurat = (id) => suratModel.remove(id);