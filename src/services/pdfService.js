const suratService = require("./suratService");
const suratTemplate = require("../templates/suratTemplate");
const moment = require("moment-timezone");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const QRCode = require("qrcode");

exports.generateSuratPdf = async (suratId) => {
    const suratDataFromDB = await suratService.getSuratById(suratId);
    if (!suratDataFromDB) {
        throw new Error("Surat not found");
    }

    const suratData = {
        nama: suratDataFromDB.nama || 'Tidak Tersedia',
        nik: suratDataFromDB.nik || 'Tidak Tersedia',
        tempat_lahir: suratDataFromDB.tempat_lahir || 'Tidak Tersedia',
        // tanggal_lahir: suratDataFromDB.tanggal_lahir ? moment(suratDataFromDB.tanggal_lahir).format("DD-MM-YYYY") : 'Tidak Tersedia',
        alamat: suratDataFromDB.alamat || 'Tidak Tersedia',
        jenis_surat: suratDataFromDB.jenis_surat || 'Tidak Tersedia',
        tujuan_surat: suratDataFromDB.tujuan_surat || 'Tidak Tersedia',
        tanggal: suratDataFromDB.tanggal ? moment(suratDataFromDB.tanggal).format("DD MMMM YYYY") : 'Tidak Tersedia',
        kepala_desa: "Sutrisno",
        qrCodeUrl: await QRCode.toDataURL(`https://desa-maju-jaya.go.id/verifikasi/${suratDataFromDB.nik}`),
    };

    const html = suratTemplate(suratData);
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    return pdfBuffer;
};