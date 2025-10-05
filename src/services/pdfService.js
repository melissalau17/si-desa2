const suratService = require("./suratService");
const suratTemplate = require("../templates/suratTemplate");
const moment = require("moment-timezone");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const QRCode = require("qrcode");

exports.generateSuratPdf = async (suratId) => {
  const suratDataFromDB = await suratService.getSuratById(suratId);
  if (!suratDataFromDB) throw new Error("Surat not found");

  const dependents = suratDataFromDB.dependents || []; // should be array of anak/tanggungan

  const suratData = {
    // header
    desaName: "DESA HAMPARAN PERAK",
    kecamatan: "KECAMATAN HAMPARAN PERAK",
    kabupaten: "KABUPATEN DELI SERDANG",
    alamatHeader: "Jalan Sultan Sri Ahmad No. 1 Dusun V Kebun Baru Desa Hamparan Perak",
    email: "hamparanperak01@gmail.com",
    website: "hamparanperak.desa.id",

    // meta
    nomor: suratDataFromDB.nomor_surat || `470/ - /${moment().format("YYYY")}`,
    tanggalTerbit: suratDataFromDB.tanggal || new Date(),

    // main person
    nama: suratDataFromDB.nama,
    nik: suratDataFromDB.nik,
    tempat: suratDataFromDB.tempat_lahir,
    tanggal_lahir: suratDataFromDB.tanggal_lahir
      ? moment(suratDataFromDB.tanggal_lahir).format("DD-MM-YYYY")
      : "",
    jenis_kelamin: suratDataFromDB.jenis_kelamin,
    bangsa_agama: `${suratDataFromDB.kewarganegaraan || "Indonesia"} / ${suratDataFromDB.agama || ""}`,
    status_perkawinan: suratDataFromDB.status_perkawinan,
    pekerjaan: suratDataFromDB.pekerjaan,
    alamat: suratDataFromDB.alamat,

    dependents: dependents.map((d) => ({
      nama: d.nama,
      nik: d.nik,
      tempat_tgl_lahir: `${d.tempat_lahir}, ${moment(d.tanggal_lahir).format("DD-MM-YYYY")}`,
      ket: d.keterangan || "Anak",
    })),

    // paragraphs
    keterangan: suratDataFromDB.keterangan || "Benar nama tersebut diatas penduduk Desa Hamparan Perak.",
    diterangkan: suratDataFromDB.diterangkan || "",

    // signature
    kepala_desa: "MUHAMMAD HELMI",
    qrCodeUrl: await QRCode.toDataURL(
      `https://desa-hamparan-perak.go.id/verifikasi/${suratDataFromDB.nik}`
    ),
  };

  const html = suratTemplate(suratData);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    return pdfBuffer;
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("Failed to generate PDF");
  } finally {
    if (browser) await browser.close();
  }
};