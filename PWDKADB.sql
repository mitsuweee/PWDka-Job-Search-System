-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2024 at 05:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pwdka_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` mediumblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id`, `status`, `name`, `address`, `city`, `description`, `contact_number`, `email`, `password`, `profile_picture`) VALUES
(1, 'VERIFIED', '23 parang jordan', '23 Jordan Street', 'Chicago City', 'Gawa ni jordan the great, from 1993', '09412345123', 'eqwevqweqw@yahoo.com', 'ecqwecq2', 0x65717764617364),
(2, 'PENDING', 'Liv Andre', 'Centeno', 'csc', 'dsa', '09686022965', 'trrcscscsxjghcxy@gmail.com', '1Dwdsca%a', ''),
(4, 'VERIFIED', 'tr!nity', 'Cen23t eno', 'csc', 'ds,,,,a', '09412345123', 'trrcscscdssxjghcxy@gewmail.com', '$2b$10$oHIKRl2/lEOWOC4J5NnaBOYwW/XNK2wnd8e/b2aM4h3ldW7Shy6pG', ''),
(5, 'PENDING', 'tr!nity', 'Cen23t eno', 'csc', 'ds,,,,a', '09412345123', 'trrcscscdssxjvdghcxy@gewmail.com', '$2b$10$O2GzCj0pOhV5YtgmdDgOieySQxbp/1wzNModBuD2NBd4OwVqN.Qbe', 0x65717764617364),
(8, 'VERIFIED', 'tr!nity', 'cen23t eno', 'csc', 'ds,,,,a', '09412345123', 'livceneqwewqteno2k@gmail.com', '$2b$10$1aSmFVOGQ20TIS.etNt5wuWm60D5EuftdqzOHccAv1VDrtMrYNeqK', 0x65717764617364),
(9, 'PENDING', 'tr!nity', 'cen23t eno', 'csc', 'ds,,,,a', '09412345123', 'livcenteno2k@gmail.com', '$2b$10$MNcqsw76sQt.T6OnakGBLOqu2yPj1nNFrF74XH7UQDs4XeW1ejV7q', 0x65717764617364),
(10, 'PENDING', 'tr!nity', 'cen23t eno', 'csc', 'ds,,,,a', '09412345123', 'livcenteno2k@gmail.comzxc', '$2b$10$KFeXF4yh5NUN13zR2rPHkOT5Iybg.dfV.ggYmtMCIs.U23J4vnf.u', 0x65717764617364);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
