const suratService = require("./suratService");
const suratTemplate = require("../templates/suratTemplate");
const moment = require("moment-timezone");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const QRCode = require("qrcode");

exports.generateSuratPdf = async (suratId) => {
    try {
        const suratDataFromDB = await suratService.getSuratById(suratId);
        if (!suratDataFromDB) throw new Error("Surat not found");

        const suratData = {
            nama: suratDataFromDB.nama || 'Tidak Tersedia',
            nik: suratDataFromDB.nik || 'Tidak Tersedia',
            alamat: suratDataFromDB.alamat || 'Tidak Tersedia',
            jenis_surat: suratDataFromDB.jenis_surat || 'Tidak Tersedia',
            tujuan_surat: suratDataFromDB.tujuan_surat || 'Tidak Tersedia',
            tanggal: suratDataFromDB.tanggal ? moment(suratDataFromDB.tanggal).format("DD MMMM YYYY") : 'Tidak Tersedia',
            kepala_desa: "Sutrisno",
            qrCodeUrl: await QRCode.toDataURL(`https://desa-maju-jaya.go.id/verifikasi/${suratDataFromDB.nik}`),
        };

        const html = suratTemplate(suratData);

        let browser;
        try {
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } catch (puppeteerErr) {
            console.error("❌ Puppeteer launch failed:", puppeteerErr);
            throw puppeteerErr;
        }

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({ format: "A4" });
            await browser.close();
            return pdfBuffer;
        } catch (pdfErr) {
            console.error("❌ Puppeteer PDF generation failed:", pdfErr);
            if (browser) await browser.close();
            throw pdfErr;
        }
    } catch (err) {
        console.error("❌ generateSuratPdf failed:", err);
        throw err;
    }
};
