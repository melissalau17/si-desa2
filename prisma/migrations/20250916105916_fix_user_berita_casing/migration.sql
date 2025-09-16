/*
  Warnings:

  - You are about to drop the `Berita` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Keuangan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Laporan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Surat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Berita`;

-- DropTable
DROP TABLE `Keuangan`;

-- DropTable
DROP TABLE `Laporan`;

-- DropTable
DROP TABLE `Surat`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `NIK` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `jenis_kel` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `agama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(255) NULL,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NULL,

    UNIQUE INDEX `User_NIK_key`(`NIK`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keuangan` (
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
CREATE TABLE `berita` (
    `berita_id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(255) NULL,
    `tanggal` VARCHAR(191) NULL,
    `kontent` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`berita_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laporan` (
    `laporan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `keluhan` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(255) NULL,
    `tanggal` VARCHAR(191) NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `vote` INTEGER NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`laporan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat` (
    `surat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NOT NULL,
    `tempat_lahir` VARCHAR(191) NULL,
    `tanggal_lahir` DATE NULL,
    `jenis_kelamin` VARCHAR(191) NULL,
    `agama` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `jenis_surat` VARCHAR(191) NOT NULL,
    `tujuan_surat` VARCHAR(191) NOT NULL,
    `photo_ktp` VARCHAR(255) NULL,
    `photo_kk` VARCHAR(255) NULL,
    `foto_usaha` VARCHAR(255) NULL,
    `waktu_kematian` VARCHAR(191) NULL,
    `gaji_ortu` VARCHAR(191) NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(50) NULL,
    `no_hp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`surat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
