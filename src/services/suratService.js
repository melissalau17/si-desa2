const suratModel = require("../models/SuratModel");

exports.getAllSurat = () => suratModel.findAll();
exports.getSuratById = (id) => suratModel.findById(id);
exports.findByNIK = (nik) => suratModel.findByNIK(nik);

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
        photo_ktp_url,
        photo_kk_url,
        foto_usaha_url,
        waktu_kematian,
        gaji_ortu_url,
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
        photo_ktp: photo_ktp_url,
        photo_kk: photo_kk_url,
        foto_usaha: foto_usaha_url,
        waktu_kematian,
        gaji_ortu: gaji_ortu_url,
    });
};

exports.updateSurat = async (id, data) => {
    const existingSurat = await suratModel.findById(id);
    if (!existingSurat) return null;
    const updatedSurat = await suratModel.update(id, data);
    return updatedSurat;
}

exports.deleteSurat = (id) => suratModel.remove(id);