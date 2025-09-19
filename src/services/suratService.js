const suratModel = require("../models/SuratModel");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSurat = () => {
    return suratModel.findAll({
        include: { user: true }
    });
};
exports.getSuratById = (id) => {
    return suratModel.findById(id, {
        include: { user: true }
    });
};
exports.findByNIK = (nik) => suratModel.findByNIK(nik);

exports.createSurat = async (data) => {
    const newSurat = await suratModel.create(data);
    
    return suratModel.findById(newSurat.surat_id, {
        include: { user: true }
    });
};

exports.updateSurat = async (id, data) => {
    const existingSurat = await suratModel.findById(id);
    if (!existingSurat) return null;
    const updatedSurat = await suratModel.update(id, data);
    return suratModel.findById(updatedSurat.surat_id, {
        include: { user: true }
    });
}

exports.deleteSurat = (id) => suratModel.remove(id);