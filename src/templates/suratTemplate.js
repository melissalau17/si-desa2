// suratTemplate.js
module.exports = (data = {}) => {
  const {
    // header info
    desaName = 'DESA HAMPARAN PERAK',
    kecamatan = 'KECAMATAN HAMPARAN PERAK',
    kabupaten = 'KABUPATEN DELI SERDANG',
    alamatHeader = 'Jalan Sultan Sri Ahmad No. 1 Dusun V Kebun Baru Desa Hamparan Perak',
    email = 'hamparanperak01@gmail.com',
    website = 'hamparanperak.desa.id',

    // document meta
    nomor = '',
    tanggalTerbit = '',

    // main person
    nama = '',
    nik = '',
    tempat = '',
    tanggal_lahir = '',
    jenis_kelamin = '',
    bangsa_agama = '',
    status_perkawinan = '',
    pekerjaan = '',
    alamat = '',

    // dependents: array of { nama, nik, tempat_tgl_lahir, ket }
    dependents = [],

    // paragraphs
    keterangan = 'Benar nama tersebut diatas penduduk menetap di Desa Hamparan Perak Kecamatan Hamparan Perak Kabupaten Deli Serdang.',
    diterangkan = '',

    // signature
    kepala_desa = 'MUHAMMAD HELMI',
    qrCodeUrl = '', // data URL or full url

    // small footer notes
    footerNotes = [
      'Dokumen ini telah ditandatangani secara elektronik menggunakan Sertifikat Elektronik yang diterbitkan BSE (Balai Sertifikasi Elektronik).',
      'UU ITE Nomor 19 Tahun 2016 tentang Informasi dan Transaksi Elektronik.'
    ]
  } = data;

  const escape = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const humanDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return escape(d);
    }
  };

  const depRows = (dependents && dependents.length > 0)
    ? dependents.map((row, idx) => `
      <tr>
        <td style="width:4%; text-align:center;">${idx + 1}</td>
        <td style="width:36%;">${escape(row.nama || '')}</td>
        <td style="width:24%;">${escape(row.nik || '')}</td>
        <td style="width:22%;">${escape(row.tempat_tgl_lahir || '')}</td>
        <td style="width:14%;">${escape(row.ket || '')}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" style="text-align:center; padding:8px;">- Tidak ada data anak / tanggungan -</td></tr>`;

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Surat Keterangan</title>
<style>
  @page { size: A4; margin: 28mm 20mm; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color:#000; margin:0; }
  .container { padding: 0 6mm; }
  .kop { display:flex; align-items:center; border-bottom:3px solid #000; padding-bottom:8px; margin-bottom:10px; }
  .kop .logo { width:90px; height:90px; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-right:12px; }
  .kop .logo img { max-width:100%; max-height:100%; }
  .kop .text { text-align:center; flex:1; }
  .kop .text h1 { margin:0; font-size:18pt; letter-spacing:1px;}
  .kop .text h2 { margin:0; font-size:14pt; font-weight:600; }
  .kop .text p { margin:2px 0; font-size:10pt; }

  .center { text-align:center; }
  .judul { text-align:center; margin-top:10px; margin-bottom:4px; font-weight:700; font-size:14pt; text-decoration:underline; }
  .nomor { text-align:center; margin-bottom:12px; font-size:11pt; }

  .details, .info-table { width:100%; margin-top:6px; }
  .details td { vertical-align:top; padding:4px 6px; }
  .details .label { width:28%; }
  .details .value { width:72%; }

  .info-table { border-collapse:collapse; margin-top:10px; }
  .info-table th, .info-table td { border:1px solid #000; padding:6px; font-size:11pt; }
  .info-table th { background:#f4f4f4; text-align:left; }

  .paragraph { margin-top:12px; text-align:justify; }

  .ttd-area { display:flex; justify-content:space-between; margin-top:30px; align-items:flex-start; }
  .ttd-left { width:58%; }
  .sign-box { border:1px solid #000; padding:10px; display:flex; gap:10px; align-items:center; max-width:420px; }
  .qr { width:110px; height:110px; display:flex; align-items:center; justify-content:center; border-right:1px solid transparent; }
  .qr img { max-width:100px; max-height:100px; display:block; }
  .sign-text { font-size:10pt; line-height:1.1; }
  .sign-name { font-weight:700; margin-top:6px; }

  .ttd-right { text-align:right; width:36%; font-size:11pt; }

  .footer { border-top:1px solid #ddd; margin-top:18px; padding-top:6px; font-size:9.5pt; color:#333; }
  .footer ol { margin:6px 0 0 18px; padding:0; }
</style>
</head>
<body>
  <div class="container">
    <div class="kop">
      <div class="logo">
        <!-- if you have an emblem, pass it in data.emblemUrl -->
        ${ data.emblemUrl ? `<img src="${escape(data.emblemUrl)}" alt="logo" />` : `<div style="width:72px;height:72px;border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;font-size:10px;">LOGO</div>`}
      </div>
      <div class="text">
        <h1>PEMERINTAH ${escape(desaName)}</h1>
        <h2>${escape(kecamatan).toUpperCase()} - ${escape(kabupaten).toUpperCase()}</h2>
        <p>${escape(alamatHeader)}</p>
        <p style="font-size:10pt;">Email: ${escape(email)} • Website: ${escape(website)}</p>
      </div>
    </div>

    <div class="judul">SURAT KETERANGAN</div>
    <div class="nomor">NOMOR: ${escape(nomor || `- / - / ${new Date().getFullYear()}`)}</div>

    <table class="details">
      <tr>
        <td class="label">Nama</td>
        <td class="value">: ${escape(nama)}</td>
      </tr>
      <tr>
        <td class="label">NIK</td>
        <td class="value">: ${escape(nik)}</td>
      </tr>
      <tr>
        <td class="label">Tempat/Tgl. Lahir</td>
        <td class="value">: ${escape(tempat)}, ${escape(tanggal_lahir)}</td>
      </tr>
      <tr>
        <td class="label">Jenis Kelamin</td>
        <td class="value">: ${escape(jenis_kelamin)}</td>
      </tr>
      <tr>
        <td class="label">Bangsa/Agama</td>
        <td class="value">: ${escape(bangsa_agama)}</td>
      </tr>
      <tr>
        <td class="label">Status Perkawinan</td>
        <td class="value">: ${escape(status_perkawinan)}</td>
      </tr>
      <tr>
        <td class="label">Pekerjaan</td>
        <td class="value">: ${escape(pekerjaan)}</td>
      </tr>
      <tr>
        <td class="label">Alamat</td>
        <td class="value">: ${escape(alamat)}</td>
      </tr>
    </table>

    <h4 style="margin-top:12px; margin-bottom:6px;">Daftar Tanggungan / Anak</h4>
    <table class="info-table">
      <thead>
        <tr>
          <th style="width:4%;">No</th>
          <th style="width:36%;">Nama</th>
          <th style="width:24%;">NIK</th>
          <th style="width:22%;">Tempat/Tgl Lahir</th>
          <th style="width:14%;">Ket</th>
        </tr>
      </thead>
      <tbody>
        ${depRows}
      </tbody>
    </table>

    <p class="paragraph"><strong>Keterangan :</strong> ${escape(keterangan)}</p>

    ${ diterangkan ? `<p class="paragraph"><strong>Diterangkan :</strong> ${escape(diterangkan)}</p>` : '' }

    <div class="ttd-area">
      <div class="ttd-left">
        <div class="sign-box">
          <div class="qr">
            ${ qrCodeUrl ? `<img src="${escape(qrCodeUrl)}" alt="QR Code" />` : `<div style="width:100px;height:100px;border:1px solid #ccc; display:flex;align-items:center;justify-content:center">QR</div>`}
          </div>
          <div class="sign-text">
            <div>Ditandatangani Secara Elektronik</div>
            <div>Kepala Desa ${escape(desaName)}</div>
            <div class="sign-name">${escape(kepala_desa)}</div>
          </div>
        </div>
      </div>

      <div class="ttd-right">
        <div>${escape(desaName)}, ${humanDate(tanggalTerbit || new Date())}</div>
        <div style="height:60px;"></div>
        <div style="font-weight:700;">${escape(kepala_desa)}</div>
      </div>
    </div>

    <div class="footer">
      <ol>
        ${footerNotes.map(n => `<li>${escape(n)}</li>`).join('')}
      </ol>
    </div>
  </div>
</body>
</html>
`;
};
