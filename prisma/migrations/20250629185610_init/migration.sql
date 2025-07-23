-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `NIK` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `jenis_kel` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `agama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `photo` LONGBLOB NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'penduduk',

    UNIQUE INDEX `User_NIK_key`(`NIK`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keuangan` (
    `keuangan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenisTransaksi` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jumlah` DECIMAL(15, 2) NOT NULL,
    `catatan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`keuangan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Berita` (
    `berita_id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `photo` LONGBLOB NULL,
    `tanggal` VARCHAR(191) NULL,
    `kontent` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`berita_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laporan` (
    `laporan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `keluhan` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `photo` LONGBLOB NOT NULL,
    `tanggal` VARCHAR(191) NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `vote` INTEGER NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`laporan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Surat` (
    `surat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `tempat_lahir` VARCHAR(191) NOT NULL,
    `tanggal_lahir` DATETIME(3) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `agama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `jenis_surat` VARCHAR(191) NOT NULL,
    `tujuan_surat` VARCHAR(191) NOT NULL,
    `photo_ktp` LONGBLOB NULL,
    `photo_kk` LONGBLOB NULL,
    `foto_usaha` LONGBLOB NULL,
    `waktu_kematian` VARCHAR(191) NULL,
    `gaji_ortu` LONGBLOB NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`surat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
