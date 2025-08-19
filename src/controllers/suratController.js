const suratService = require("../services/suratService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");
const { io } = require("../index");
const puppeteer = require("puppeteer");
const suratTemplate = require("../templates/suratTemplate");
const QRCode = require("qrcode");

exports.getAllSurat = async (req, res) => {
    try {
        const surat = await suratService.getAllSurat();
        if (!surat || surat.length === 0) {
            return res.status(200).json({
                message: "Tidak ada data surat tersedia!",
                data: [],
            });
        }
        res.status(200).json({
            message: "Data surat berhasil dimuat!",
            data: surat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getSuratById = async (req, res) => {
    try {
        const surat = await suratService.getSuratById(req.params.id);
        if (!surat) {
            return res.status(404).json({
                message: `Surat dengan ID ${req.params.id} tidak ditemukan!`,
            });
        }
        res.status(200).json({
            message: `Surat dengan ID ${req.params.id} berhasil dimuat!`,
            data: surat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createSurat = async (req, res) => {
    try {
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
            waktu_kematian,
        } = req.body;

        if (!nik.startsWith("120724")) {
            return res.status(403).json({ message: "Anda bukan warga desa ini!" });
        }

        //  const existingSurat = await suratService.findByNIK(nik);
        //  if (existingSurat) {
        //    return res.status(409).json({ message: "NIK sudah terdaftar!" });
        //  }

        const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;
        const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
        const foto_usaha = req.files?.foto_usaha?.[0]?.buffer || null;
        const gaji_ortu = req.files?.gaji_ortu?.[0]?.buffer || null;

        if (!photo_ktp || !photo_kk) {
            return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
        }

        // Pastikan format DD-MM-YYYY dikonversi ke objek Date
        let parsedTanggalLahir = null;

        if (tanggal_lahir) {
            const m = moment.tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta");
            if (!m.isValid()) {
                return res
                    .status(400)
                    .json({ message: "Format tanggal_lahir tidak valid!" });
            }
            parsedTanggalLahir = m.add(1, "day").toDate();
        }

        const newSurat = await suratService.createSurat({
            nik,
            nama,
            tempat_lahir,
            tanggal_lahir: parsedTanggalLahir,
            jenis_kelamin,
            agama,
            alamat,
            jenis_surat,
            tujuan_surat,
            waktu_kematian,
            photo_ktp,
            photo_kk,
            no_hp,
            email,
            foto_usaha,
            gaji_ortu,
            tanggal: moment().tz("Asia/Jakarta").toDate(),
        });

        io.emit("notification", {
            title: "Surat Baru",
            body: `${nama} mengirim surat: ${jenis_surat}`,
            time: timestamp,
        });

        res.status(201).json({
            message: "Surat berhasil dibuat!",
            data: newSurat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateSurat = async (req, res) => {
    try {
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
            waktu_kematian,
            status
        } = req.body;

        const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;
        const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
        const foto_usaha = req.files?.foto_usaha?.[0]?.buffer || null;
        const gaji_ortu = req.files?.gaji_ortu?.[0]?.buffer || null;

        if (nik && !nik.startsWith("120724")) {
            return res.status(403).json({ message: "Anda bukan warga desa ini!" });
        }

        //  if (nik) {
        //    const existingSurat = await suratService.findByNIK(nik);
        //    if (existingSurat && existingSurat.surat_id != req.params.id) {
        //      return res
        //        .status(409)
        //        .json({ message: "NIK sudah digunakan oleh surat lain!" });
        //    }
        //  }

        // const parsedTanggalLahir = moment
        //   .tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta")
        //   .add(+1, "day")
        //   .toDate();

        let parsedTanggalLahir = null;

        if (tanggal_lahir && typeof tanggal_lahir === "string" && tanggal_lahir.trim() !== "") {
            parsedTanggalLahir = moment
                .tz(tanggal_lahir, "DD/MM/YYYY", "Asia/Jakarta")
                .add(1, "day")
                .toDate();

            if (isNaN(parsedTanggalLahir.getTime())) {
                return res.status(400).json({ message: "Format tanggal_lahir tidak valid!" });
            }
        }

        const updatePayload = {};

        if (nik) updatePayload.nik = nik;
        if (nama) updatePayload.nama = nama;
        if (tempat_lahir) updatePayload.tempat_lahir = tempat_lahir;
        if (parsedTanggalLahir) updatePayload.tanggal_lahir = parsedTanggalLahir;
        if (jenis_kelamin) updatePayload.jenis_kelamin = jenis_kelamin;
        if (no_hp) updatePayload.no_hp = no_hp;
        if (email) updatePayload.email = email;
        if (agama) updatePayload.agama = agama;
        if (alamat) updatePayload.alamat = alamat;
        if (jenis_surat) updatePayload.jenis_surat = jenis_surat;
        if (tujuan_surat) updatePayload.tujuan_surat = tujuan_surat;
        if (waktu_kematian) updatePayload.waktu_kematian = waktu_kematian;
        if (status) updatePayload.status = status;

        if (photo_ktp) updatePayload.photo_ktp = photo_ktp;
        if (photo_kk) updatePayload.photo_kk = photo_kk;
        if (foto_usaha) updatePayload.foto_usaha = foto_usaha;
        if (gaji_ortu) updatePayload.gaji_ortu = gaji_ortu;

        const updatedSurat = await suratService.updateSurat(req.params.id, updatePayload);

        if (!updatedSurat) {
            return res.status(404).json({ message: "Surat tidak ditemukan!" });
        }

        //  console.log("PARAMS ID:", req.params.id);

        res.status(200).json({
            message: "Surat berhasil diperbarui!",
            data: updatedSurat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSurat = async (req, res) => {
    try {
        const deleted = await suratService.deleteSurat(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Surat tidak ditemukan!" });
        }

        res.status(200).json({ message: "Surat berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};

exports.printSurat = async (req, res) => {
  try {
    const suratData = {
      nama: "Budi Santoso",
      nik: "1234567890123456",
      tempat_lahir: "Bandung",
      tanggal_lahir: "01-01-1990",
      alamat: "Jl. Melati No. 5",
      jenis_surat: "Keterangan Usaha",
      tujuan_surat: "Pengajuan Kredit Bank",
      tanggal: new Date().toLocaleDateString("id-ID"),
      kepala_desa: "Sutrisno",
      qrCodeUrl: await QRCode.toDataURL("https://desa-maju-jaya.go.id/verifikasi/123"),
    };

    const html = suratTemplate(suratData);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="surat-${suratData.nama}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mencetak surat");
  }
};