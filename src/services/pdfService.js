const suratService = require("./suratService");
const suratTemplate = require("../templates/suratTemplate");
const moment = require("moment-timezone");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const QRCode = require("qrcode");

exports.generateSuratPdf = async (suratId) => {
    console.log("➡️ GenerateSuratPdf called with suratId:", suratId);

    const suratDataFromDB = await suratService.getSuratById(suratId);
    console.log("📌 suratDataFromDB:", suratDataFromDB);

    if (!suratDataFromDB) {
        throw new Error("Surat not found");
    }

    const suratData = {
        nama: suratDataFromDB.nama || 'Tidak Tersedia',
        nik: suratDataFromDB.nik || 'Tidak Tersedia',
        tempat_lahir: suratDataFromDB.tempat_lahir || 'Tidak Tersedia',
        alamat: suratDataFromDB.alamat || 'Tidak Tersedia',
        jenis_surat: suratDataFromDB.jenis_surat || 'Tidak Tersedia',
        tujuan_surat: suratDataFromDB.tujuan_surat || 'Tidak Tersedia',
        tanggal: suratDataFromDB.tanggal ? moment(suratDataFromDB.tanggal).format("DD MMMM YYYY") : 'Tidak Tersedia',
        kepala_desa: "Sutrisno",
        qrCodeUrl: await QRCode.toDataURL(`https://desa-maju-jaya.go.id/verifikasi/${suratDataFromDB.nik}`),
    };

    const html = suratTemplate(suratData);

    try {
        const exePath = await chromium.executablePath();
        console.log("📌 Chromium executablePath:", exePath);

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: exePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        return pdfBuffer;
    } catch (err) {
        console.error("❌ Puppeteer failed:", err);
        throw err; // biar kebaca di controller
    }
};
