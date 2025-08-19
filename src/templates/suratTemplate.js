module.exports = (data) => {
  const {
    nama,
    nik,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    jenis_surat,
    tujuan_surat,
    tanggal,
    kepala_desa,
    qrCodeUrl, // hasil generate QR Code (base64)
  } = data;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat ${jenis_surat}</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      margin: 40px;
      font-size: 12pt;
      line-height: 1.6;
    }
    .kop {
      text-align: center;
      border-bottom: 3px solid black;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .kop h2, .kop h3, .kop p {
      margin: 0;
      line-height: 1.3;
    }
    .judul {
      text-align: center;
      font-weight: bold;
      text-decoration: underline;
      margin: 20px 0;
    }
    .isi {
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    td {
      padding: 4px 6px;
      vertical-align: top;
    }
    .ttd {
      margin-top: 40px;
      text-align: right;
      padding-right: 60px;
    }
    .qr {
      margin-top: 20px;
    }
    .qr img {
      width: 100px;
      height: 100px;
    }
  </style>
</head>
<body>
  <!-- KOP SURAT -->
  <div class="kop">
    <h2>PEMERINTAH DESA MAJU JAYA</h2>
    <h3>KECAMATAN SUKAMAJU, KABUPATEN INDAH</h3>
    <p>Alamat: Jl. Merdeka No. 123, Sukamaju</p>
  </div>

  <!-- JUDUL -->
  <div class="judul">
    SURAT KETERANGAN ${jenis_surat.toUpperCase()}
  </div>
  <p style="text-align: center;">Nomor: 123/DS-MJ/${new Date().getFullYear()}</p>

  <!-- ISI SURAT -->
  <div class="isi">
    <p>Yang bertanda tangan di bawah ini, Kepala Desa Maju Jaya, menerangkan bahwa:</p>
    <table>
      <tr><td>Nama</td><td>: ${nama}</td></tr>
      <tr><td>NIK</td><td>: ${nik}</td></tr>
      <tr><td>Tempat/Tanggal Lahir</td><td>: ${tempat_lahir}, ${tanggal_lahir}</td></tr>
      <tr><td>Alamat</td><td>: ${alamat}</td></tr>
    </table>

    <p>
      Adalah benar penduduk Desa Maju Jaya yang mengajukan permohonan 
      untuk keperluan: <b>${tujuan_surat}</b>.
    </p>

    <p>Demikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.</p>
  </div>

  <!-- TTD -->
  <div class="ttd">
    <p>Maju Jaya, ${tanggal}</p>
    <p>Kepala Desa Maju Jaya</p>
    <br><br><br>
    <p><b>${kepala_desa}</b></p>
  </div>

  <!-- QR CODE -->
  <div class="qr">
    <img src="${qrCodeUrl}" alt="QR Code" />
    <p style="font-size: 10pt;">Scan untuk verifikasi keaslian surat</p>
  </div>
</body>
</html>
  `;
};
