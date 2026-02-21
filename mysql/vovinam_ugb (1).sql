-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 17 fév. 2026 à 18:58
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `vovinam_ugb`
--

-- --------------------------------------------------------

--
-- Structure de la table `board_members`
--

CREATE TABLE `board_members` (
  `id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `season_id` varchar(36) NOT NULL,
  `position` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(36) NOT NULL,
  `season_id` varchar(36) NOT NULL,
  `amount` int(11) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `expense_date` date NOT NULL,
  `recorded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `expenses`
--

INSERT INTO `expenses` (`id`, `season_id`, `amount`, `description`, `category`, `expense_date`, `recorded_by`, `created_at`) VALUES
('8fe348a9-8a01-453f-be8d-853f42dc0ced', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'Affiches', 'Matériel', '2026-01-19', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-02 12:23:10'),
('cc8494e4-d649-4209-9a46-fcf8d9eb88c0', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1700, 'Credit', 'Communication', '2026-01-08', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-08 12:18:56');

-- --------------------------------------------------------

--
-- Structure de la table `members`
--

CREATE TABLE `members` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `status` enum('active','suspended','former','new') NOT NULL DEFAULT 'active',
  `member_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `members`
--

INSERT INTO `members` (`id`, `user_id`, `first_name`, `last_name`, `phone`, `email`, `photo_url`, `status`, `member_number`, `created_at`, `updated_at`) VALUES
('033738ef-d38f-4510-85c9-0eeccc4354a4', NULL, 'Abdou khaly', 'Diaw', '785046184', 'khalydiw@gmail.com', NULL, 'active', '20260013', '2026-01-22 10:00:33', '2026-01-22 10:01:19'),
('0a401420-9642-44e0-8f2b-1e4bf3b5c59c', NULL, 'Mame Bousso', 'Gueye', '76 230 33 89', 'gueyemamebousso573@gmail.com', NULL, 'active', '20260008', '2026-01-07 20:05:36', '2026-01-08 13:07:47'),
('0b5e9248-e6ec-4d53-b74b-d02d63f498d2', NULL, 'Lamine', 'Fané', '770841480', NULL, NULL, 'active', '20260011', '2025-12-21 17:33:45', '2026-02-02 09:42:28'),
('11a96b0e-0843-4ed9-be25-d48536c957e6', NULL, 'DAOUDA', 'FICKOU', '782829673', 'daoudafickou03@gmail.com', NULL, 'active', '20250001', '2025-12-21 12:27:38', '2026-01-08 10:43:10'),
('1449ed33-9afc-4128-9c10-5af0efcabcbc', NULL, 'Fatimata', 'Sow', '782310962', NULL, NULL, 'active', '20250015', '2025-12-22 18:55:40', '2025-12-22 18:55:40'),
('147962fd-9594-4854-bfe2-1ac9865e690d', NULL, 'Baba Galle', 'Sow', '774752692', 'sowbabagallei@gmail.com', NULL, 'active', '20250005', '2025-12-21 22:28:26', '2025-12-21 22:28:26'),
('1c550596-283b-4776-9d33-bf72deadda52', NULL, 'Mouhamedine', 'Diop', '763781003', 'mouhamedined453@gmail.com', NULL, 'active', '20250010', '2025-12-22 18:39:56', '2025-12-22 18:39:56'),
('2172da43-1e82-4d0b-a6ac-84d3f585480b', NULL, 'Mariama', 'Cisse', '762288862', 'marima07.com@gmail.com', NULL, 'active', '20250009', '2025-12-22 17:16:27', '2025-12-22 17:16:27'),
('250b7849-9f3b-42d5-94c9-befff0011ba2', NULL, 'Mame Diaw', 'Ndiaye', '76 126 90 29', 'mamediawndiaye65@gmail.com', NULL, 'active', '20260009', '2026-01-07 20:06:35', '2026-01-08 13:07:54'),
('338e45fb-614e-47ce-b6ca-e2875d616470', NULL, 'Balla', 'Seck', '78 435 63 48', 'sballa00@gmail.com', NULL, 'active', '20260003', '2026-01-05 10:29:03', '2026-01-07 11:40:29'),
('3562365a-cf12-47c0-b857-d2166fd7b735', NULL, 'Fatou', 'Diao', '789149298', 'diaofatou225@gmail.com', NULL, 'active', '20250019', '2025-12-25 12:12:11', '2025-12-25 12:12:11'),
('456938fd-5157-4651-a72c-d7db81768ff1', 'f80cb803-cf6e-40b2-83aa-03eb2355650d', 'Kadia', 'Ba', '773155248', 'kadiab443@gmail.com', NULL, 'active', '20250008', '2025-12-21 22:44:17', '2025-12-27 13:26:52'),
('4bbb4508-360a-4a69-963d-800599550ad1', NULL, 'Coumba Betty', 'Seydi', '771818987', NULL, NULL, 'active', '20250018', '2025-12-22 20:03:38', '2025-12-22 20:03:38'),
('4d88087c-edaf-4747-8863-cee0ca233ab3', NULL, 'Talkhata', 'Diop', '784404814', 'dioptalkhata@gmail.com', NULL, 'active', '20250011', '2025-12-22 18:41:06', '2025-12-22 18:41:06'),
('60a1611e-d229-4e99-b281-d657feaacc15', NULL, 'Moussa', 'Ndiaye', '772762801', 'moussandiaye3007@gmail.com', NULL, 'active', '20260016', '2026-02-05 11:09:43', '2026-02-05 11:13:06'),
('70c35d7d-8487-47b1-975b-7a1f95f1dafc', NULL, 'Ndeye Mbissine', 'Diop', '764629584', NULL, NULL, 'active', '20260006', '2026-01-05 22:40:24', '2026-01-05 22:40:24'),
('72128475-fc27-4fb7-9ac2-325d24c59ec0', NULL, 'Mbaye', 'Niane', '788544069', 'niane4359@gmail.com', NULL, 'active', '20260014', '2026-01-22 10:01:07', '2026-01-22 10:01:24'),
('78f68e2f-309a-470f-8be5-e5cc5df68e36', NULL, 'Abdoulaye', 'Diabong', '770474281', 'diabongabdoulaye@gmail.com', NULL, 'active', '20260007', '2026-01-07 11:39:27', '2026-01-07 12:53:06'),
('7c478b57-0437-4700-902c-9978fbba4af3', NULL, 'Papa Mouhamed', 'Diop', '709680138', 'pdiop7580@gmail.com', NULL, 'suspended', '20250020', '2025-12-25 12:13:09', '2025-12-25 12:13:09'),
('7fc19926-d0c4-4b7b-9ed0-894d75b911de', NULL, 'Mame Anta', 'Lo', '784453782', 'lo.mame-anta1@ugb.edu.sn', NULL, 'active', '20250002', '2025-12-21 12:28:04', '2025-12-21 12:28:04'),
('81719fb1-a8b1-4395-9b1d-f0127fb90437', NULL, 'Mody', 'Voshing', '77 240 52 31', NULL, NULL, 'active', '20260004', '2025-12-21 10:39:12', '2026-02-02 09:45:07'),
('867404cf-c68f-45f9-8ccb-232de434ee30', NULL, 'Abdourahmane', 'Diallo', '782010742', 'diallobapa8@gmail.com', NULL, 'active', '20260012', '2026-01-21 23:07:40', '2026-01-21 23:19:23'),
('93b7657f-7bcb-463b-a7cb-5f6ffe309ca5', NULL, 'Fatima Kane', 'Diallo', '78 722 52 30', NULL, NULL, 'active', '20260002', '2026-01-05 10:28:07', '2026-01-05 10:28:07'),
('9502b1c5-5d5d-4040-ac47-49cb97285585', NULL, 'Alhy Abdoulaye', 'Sarr', '770561394', 'oumarsarr5@gmail.com', NULL, 'active', '20250012', '2025-12-22 18:42:18', '2026-01-05 20:24:15'),
('9862ec5c-da9a-4e5c-a609-fa64580f5be9', NULL, 'Gnima', 'Cissé', '771927849', 'gnima6sse@gmail.com', NULL, 'active', '20250006', '2025-12-21 22:29:20', '2025-12-21 22:29:20'),
('a23bcb3d-ae8d-4eb1-b077-9fb8aa5165d7', NULL, 'Gassane', 'Dieng', '78 100 54 12', NULL, NULL, 'suspended', '20260010', '2026-01-13 10:29:00', '2026-01-13 10:29:00'),
('a6e607fa-ab55-4294-bc31-c59873b8b470', NULL, 'Abdou', 'Gning', '774787152', 'gning.abdou2@ugb.edu.sn', NULL, 'active', '20260015', '2026-02-05 11:08:41', '2026-02-05 11:12:54'),
('a7a43a5f-76e8-4566-b976-a39d346d1616', NULL, 'Mouhamadou Habib', 'Ba', '78 459 41 68', 'ba.mouhamadou-habib@ugb.edu.sn', NULL, 'active', '20260005', '2026-01-05 20:18:21', '2026-01-05 20:18:21'),
('b14197de-4286-4312-afb4-b8950035aaf3', NULL, 'Moussa', 'Diop', '776186432', 'diopmoyza15@gmail.com', NULL, 'active', '20250013', '2025-12-22 18:53:30', '2025-12-22 18:53:30'),
('c1b39e27-60d1-4976-91d8-834716d6287b', NULL, 'Bintou', 'Badiane', '705208650', 'badiane.bintou@ugb.edu.sn', NULL, 'active', '20250014', '2025-12-22 18:54:56', '2025-12-22 18:54:56'),
('c53f1a6b-3b1b-45e0-be3d-f96182fc2ea7', NULL, 'Mariama', 'Coly', '783558354', 'coly.mariama1@ugb.edu.sn', NULL, 'active', '20250007', '2025-12-21 22:29:53', '2025-12-21 22:29:53'),
('c5dc99cd-d385-4054-8900-18d59e42c01b', NULL, 'Diarietou', 'Jobe', '772562692', NULL, NULL, 'active', '20250017', '2025-12-22 18:57:56', '2025-12-22 18:57:56'),
('ccf7a4e0-eee9-4d81-a232-06ac095b5f47', NULL, 'Ndeye Anta', 'Jobe', '772562692', NULL, NULL, 'active', '20250016', '2025-12-22 18:57:26', '2025-12-22 18:57:26'),
('e70bd199-5ad7-4326-96a1-6a8e6edfb455', NULL, 'Ousmane', 'Sow', '777604835', 'sousmane370@gmail.com', NULL, 'active', '20250003', '2025-12-21 12:28:33', '2025-12-21 12:28:33'),
('ebc0dba4-3bba-4f4c-a11a-3b388ac71424', NULL, 'Souleymane', 'Sow', '77 918 07 92', NULL, NULL, 'active', '20260001', '2025-12-21 10:26:38', '2025-12-21 10:26:38'),
('ee5653d5-6b9e-4359-a35e-8d223abec711', NULL, 'Aziz', 'MANE', '772093749', 'balante89@gmail.com', NULL, 'active', '20250004', '2025-12-21 12:29:03', '2025-12-21 12:29:03');

--
-- Déclencheurs `members`
--
DELIMITER $$
CREATE TRIGGER `before_insert_members` BEFORE INSERT ON `members` FOR EACH ROW BEGIN
    DECLARE year_part VARCHAR(4);
    DECLARE sequence_num INT;
    
    IF NEW.member_number IS NULL THEN
        SET year_part = DATE_FORMAT(CURRENT_DATE, '%Y');
        SELECT COALESCE(MAX(CAST(SUBSTRING(member_number, 5) AS UNSIGNED)), 0) + 1
        INTO sequence_num
        FROM members
        WHERE member_number LIKE CONCAT(year_part, '%');
        
        SET NEW.member_number = CONCAT(year_part, LPAD(sequence_num, 4, '0'));
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `season_id` varchar(36) NOT NULL,
  `amount` int(11) NOT NULL,
  `payment_type` enum('registration','monthly','annual','other') NOT NULL,
  `payment_method` enum('wave','cash','other') NOT NULL,
  `payment_date` date NOT NULL,
  `month_number` int(11) DEFAULT NULL,
  `proof_url` text DEFAULT NULL,
  `status` enum('PENDING','VALIDATED','REJECTED') DEFAULT 'VALIDATED',
  `notes` text DEFAULT NULL,
  `recorded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `payments`
--

INSERT INTO `payments` (`id`, `member_id`, `season_id`, `amount`, `payment_type`, `payment_method`, `payment_date`, `month_number`, `proof_url`, `status`, `notes`, `recorded_by`, `created_at`) VALUES
('03579631-ed3d-495f-aeac-b82d0893acbf', 'a7a43a5f-76e8-4566-b976-a39d346d1616', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-13', 12, '/uploads/proofs/a80c47e9-e272-4d29-8486-90cda2621176.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-13 10:48:02'),
('05779be8-69a4-46cb-814e-b845194f19fd', 'b14197de-4286-4312-afb4-b8950035aaf3', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-07', NULL, '/uploads/proofs/bd7a1787-2066-4d44-baca-e3d696cef105.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-07 12:39:07'),
('14855ec2-304e-4349-a6f6-1e52c46c567f', '72128475-fc27-4fb7-9ac2-325d24c59ec0', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-01-22', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-22 17:48:26'),
('19b1684f-cdce-43fd-8d54-ad5952a827e9', '11a96b0e-0843-4ed9-be25-d48536c957e6', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-06', 12, '/uploads/proofs/26138c19-1efb-4bc1-b70f-26cf50d197ff.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 11:56:31'),
('22e1c76b-3f93-4a08-a737-4de287ba1a78', 'e70bd199-5ad7-4326-96a1-6a8e6edfb455', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-06', NULL, '/uploads/proofs/1def9e47-78cb-46bd-89c9-6bce47d935e3.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 10:47:58'),
('2c491db5-cce2-4583-bc8c-44407d51a15d', 'c5dc99cd-d385-4054-8900-18d59e42c01b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-01-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:20:22'),
('4085ce1d-040a-4f53-999d-e9aae3e3d390', 'ebc0dba4-3bba-4f4c-a11a-3b388ac71424', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:54:20'),
('521c8305-9eb8-4bf5-b9aa-200a924a3306', '338e45fb-614e-47ce-b6ca-e2875d616470', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-06', 1, '/uploads/proofs/7c3d68bb-189f-462b-a813-d14cca2ae4eb.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 10:47:18'),
('533220c7-71cc-4f94-83ae-5c2f43dbdd8d', 'ccf7a4e0-eee9-4d81-a232-06ac095b5f47', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-01-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:19:07'),
('565bf73e-35bc-4229-bfd4-429063bf0c0c', '78f68e2f-309a-470f-8be5-e5cc5df68e36', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 3000, 'other', 'wave', '2026-01-07', NULL, '/uploads/proofs/4473c2be-ec31-418d-81cf-9d0769c981bd.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-07 12:54:06'),
('5943699e-7ac4-44f5-b46d-465e35fb0421', '456938fd-5157-4651-a72c-d7db81768ff1', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-06', 12, '/uploads/proofs/dc00332b-a62a-4565-b5ac-45994245c0ca.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 19:57:58'),
('5eaeffb5-f4f3-4923-b891-eea9800610d8', '11a96b0e-0843-4ed9-be25-d48536c957e6', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-02-05', 1, '/uploads/proofs/e4fac7c6-3b75-4661-b8e9-fa2866f54076.jpeg', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-02-05 11:00:48'),
('621c6df9-397b-4edc-9216-1e9d75cdf702', 'c5dc99cd-d385-4054-8900-18d59e42c01b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-01-05', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:20:39'),
('674f87a2-d028-489f-8b74-0da8578ff62c', 'ebc0dba4-3bba-4f4c-a11a-3b388ac71424', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 2, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:56:16'),
('6d5f1c83-1312-447e-ba39-cdd82f335581', 'ebc0dba4-3bba-4f4c-a11a-3b388ac71424', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-02-05', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:53:35'),
('7b1505ab-8bad-49b8-9155-3ae54ced5a83', '3562365a-cf12-47c0-b857-d2166fd7b735', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-08', NULL, '/uploads/proofs/d9b48719-5c70-44b7-a015-1a0b742f3da4.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-08 11:37:19'),
('7ebe9e8f-f25c-4299-bd84-68a2ffafc7ff', 'c1b39e27-60d1-4976-91d8-834716d6287b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-05', 12, '/uploads/proofs/35877ae3-8efa-4858-b292-81625b5d29e7.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-05 11:14:13'),
('7fb33574-44db-49a8-8bd7-bf2da778d77d', 'e70bd199-5ad7-4326-96a1-6a8e6edfb455', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-02-07', 1, '/uploads/proofs/3ee1ae9c-4437-4d50-a8f0-b36bef456a5c.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-02-07 22:46:01'),
('84a7d439-731c-451d-8210-91570b8dddeb', 'ee5653d5-6b9e-4359-a35e-8d223abec711', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:51:36'),
('86c26dce-34fb-429f-9876-c91585ecad91', 'c53f1a6b-3b1b-45e0-be3d-f96182fc2ea7', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-05', 12, '/uploads/proofs/7e251a4b-8c94-4d73-b06a-f6b59d356f44.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-05 11:11:33'),
('8b22a170-b3ae-4784-8146-cc483a165ccf', 'a23bcb3d-ae8d-4eb1-b077-9fb8aa5165d7', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 40000, 'other', 'wave', '2026-01-13', NULL, '/uploads/proofs/810074b2-c567-494b-914d-4cae39c550c4.png', 'VALIDATED', 'Achat matériels', NULL, '2026-01-13 10:43:24'),
('8ea0508a-165a-4330-9ad5-4affb4296273', '11a96b0e-0843-4ed9-be25-d48536c957e6', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-06', NULL, '/uploads/proofs/a4809a21-350e-416e-ac12-6effb916bc28.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 11:57:00'),
('926c5dd6-15b8-4243-9767-6284a3ef2c30', '70c35d7d-8487-47b1-975b-7a1f95f1dafc', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-08', 12, '/uploads/proofs/7597410e-107a-44d6-b263-b6da418b7f0e.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-08 13:17:06'),
('94ee7b10-a064-4609-bdb8-158c6fd4f1b8', '456938fd-5157-4651-a72c-d7db81768ff1', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-06', NULL, '/uploads/proofs/667de77d-3c09-45c1-a51d-bd68ba5ae7f2.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 19:59:26'),
('9561b0ca-a358-4b56-a870-d16aad419bb0', 'ee5653d5-6b9e-4359-a35e-8d223abec711', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 1, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:52:06'),
('a23189ca-4108-4e1f-9543-509e22e4e3e3', '456938fd-5157-4651-a72c-d7db81768ff1', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-02-07', 1, '/uploads/proofs/f82d9422-389f-42c4-9535-b0663b5c9327.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-02-07 22:26:06'),
('a291d9c8-8556-4c76-bade-cfb35c148e14', 'c1b39e27-60d1-4976-91d8-834716d6287b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-05', NULL, '/uploads/proofs/85194acb-d759-4000-a2d8-1b0263d833c6.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-05 11:14:51'),
('a3b35bed-ee11-4aa1-b21a-1096fa8e72ca', 'ee5653d5-6b9e-4359-a35e-8d223abec711', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-02-05', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:50:27'),
('a4ec62b4-380e-4e3d-9636-fd6d4b40ad45', '338e45fb-614e-47ce-b6ca-e2875d616470', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-06', NULL, '/uploads/proofs/3563c418-3ed5-4378-a529-03464e7fed6f.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 10:46:36'),
('ab483757-c3ed-4d8e-8c46-4adaa3111904', 'ee5653d5-6b9e-4359-a35e-8d223abec711', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 2, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:52:37'),
('c6fc5464-3db5-44be-84a6-1843fec9511c', 'c53f1a6b-3b1b-45e0-be3d-f96182fc2ea7', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-05', NULL, '/uploads/proofs/bd733403-1e3f-4101-9f8b-4d853402dd43.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-05 11:12:17'),
('cb9a0776-cfe5-4e8b-abc6-b3e5ceebfe3f', 'ebc0dba4-3bba-4f4c-a11a-3b388ac71424', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-02-05', 1, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-02-05 10:54:52'),
('d22fe3fb-9e25-4eb1-99cb-12a3a1c51b7f', 'ccf7a4e0-eee9-4d81-a232-06ac095b5f47', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-01-05', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:19:50'),
('d4cb6fe1-61b7-4e6b-a473-99069eb130cc', '3562365a-cf12-47c0-b857-d2166fd7b735', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-08', 12, '/uploads/proofs/111d2ec8-5ba1-4722-a76c-4f8759d9024d.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-08 11:36:45'),
('e26d4ca6-6792-48e2-809b-89e26d9a14d7', '338e45fb-614e-47ce-b6ca-e2875d616470', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-01-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:30:06'),
('e68012eb-2111-4686-a7f9-bde853360263', '9502b1c5-5d5d-4040-ac47-49cb97285585', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-01-05', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:26:19'),
('eff9aa89-6189-47d7-b0c3-ae5230caf69e', 'e70bd199-5ad7-4326-96a1-6a8e6edfb455', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-06', 12, '/uploads/proofs/b8a693fa-abbf-449c-a538-c5ede3af32c4.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-06 10:49:22'),
('f12c98fb-8d1f-4462-89a2-ec8513d58fee', '70c35d7d-8487-47b1-975b-7a1f95f1dafc', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'wave', '2026-01-08', NULL, '/uploads/proofs/09200ce8-43b1-4ce1-9fe4-e92c8d9441a8.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-08 13:17:28'),
('f31310dd-6dd9-41c6-822b-8d8f56694d51', '9502b1c5-5d5d-4040-ac47-49cb97285585', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'cash', '2026-01-05', 12, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-05 20:25:46'),
('f5cf2823-2ac7-4a3e-95ae-076fad350f94', '0b5e9248-e6ec-4d53-b74b-d02d63f498d2', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 2000, 'registration', 'cash', '2026-01-19', NULL, NULL, 'VALIDATED', '', 'ec485097-98b2-4725-976c-764949ca4a34', '2026-01-19 17:34:28'),
('f5de33e9-e89d-42ad-9170-9e4a011dc279', 'b14197de-4286-4312-afb4-b8950035aaf3', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 1000, 'monthly', 'wave', '2026-01-07', 12, '/uploads/proofs/8e7016c0-e72d-4079-8fd5-9bda553ff16c.png', 'VALIDATED', 'Paiement Wave en attente de validation', NULL, '2026-01-07 12:38:34');

-- --------------------------------------------------------

--
-- Structure de la table `profiles`
--

CREATE TABLE `profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `first_name`, `last_name`, `phone`, `photo_url`, `created_at`, `updated_at`) VALUES
('6ae7e3f0-25b3-44b3-b399-9dd8aff155fc', '61c572b3-64aa-4acb-a8c1-7b3e37176d7e', 'Ibrahima Khalil', 'Gueye', NULL, NULL, '2026-01-05 20:49:09', '2026-01-05 20:49:09'),
('78eb2afa-e3f0-478d-ba83-510c9ea9ec53', 'f80cb803-cf6e-40b2-83aa-03eb2355650d', 'Kadia', 'Ba', NULL, NULL, '2025-12-27 13:26:52', '2025-12-27 13:26:52'),
('f8b6aeaa-fc70-4684-9c2f-3306fb879c16', 'ec485097-98b2-4725-976c-764949ca4a34', 'DAOUDA', 'FICKOU', NULL, NULL, '2025-12-21 12:10:27', '2025-12-21 12:10:27');

-- --------------------------------------------------------

--
-- Structure de la table `registrations`
--

CREATE TABLE `registrations` (
  `id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `season_id` varchar(36) NOT NULL,
  `registration_date` date NOT NULL,
  `registration_fee_paid` tinyint(1) NOT NULL DEFAULT 0,
  `is_validated` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `registrations`
--

INSERT INTO `registrations` (`id`, `member_id`, `season_id`, `registration_date`, `registration_fee_paid`, `is_validated`, `created_at`) VALUES
('29069df1-133d-4b40-81f7-583634f45149', 'c53f1a6b-3b1b-45e0-be3d-f96182fc2ea7', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-03', 1, 1, '2026-01-03 22:39:52'),
('340e0db5-87d2-4f24-b7bf-df828550329c', '456938fd-5157-4651-a72c-d7db81768ff1', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-06', 1, 1, '2026-01-06 19:59:34'),
('49b610c1-44b9-474c-998c-998b95c516de', '3562365a-cf12-47c0-b857-d2166fd7b735', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-08', 1, 1, '2026-01-08 11:40:38'),
('521134f7-e2e0-42b5-8ec5-930174e4b0fd', 'e70bd199-5ad7-4326-96a1-6a8e6edfb455', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-06', 1, 1, '2026-01-06 10:49:33'),
('54f08030-897b-46c6-a53f-401b6f583c4d', 'c5dc99cd-d385-4054-8900-18d59e42c01b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-05', 1, 1, '2026-01-05 20:20:39'),
('599d142f-2ea2-41f9-bfaa-6e120dc03bc8', '70c35d7d-8487-47b1-975b-7a1f95f1dafc', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-08', 1, 1, '2026-01-08 13:17:35'),
('72bfee73-4d3f-4750-9299-e0d91807b905', 'ccf7a4e0-eee9-4d81-a232-06ac095b5f47', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-05', 1, 1, '2026-01-05 20:19:50'),
('ab70719f-1b74-420d-85c8-32ee801c7af9', '338e45fb-614e-47ce-b6ca-e2875d616470', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-05', 1, 1, '2026-01-05 20:31:08'),
('b62e9137-c954-4b02-93e8-117afe22c4a4', 'b14197de-4286-4312-afb4-b8950035aaf3', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-07', 1, 1, '2026-01-07 12:39:11'),
('ca93d7bf-4265-4229-a6cd-f33d8c0a4981', 'ebc0dba4-3bba-4f4c-a11a-3b388ac71424', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-02-05', 1, 1, '2026-02-05 10:53:35'),
('d18e9583-3ed6-4fcd-93ff-ea6bdd9a6ce2', '9502b1c5-5d5d-4040-ac47-49cb97285585', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-05', 1, 1, '2026-01-05 20:26:19'),
('dcfd9cfb-2193-42ca-b264-34ed32f254e7', '72128475-fc27-4fb7-9ac2-325d24c59ec0', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-22', 1, 1, '2026-01-22 17:48:26'),
('dead808e-e8f7-4fe2-98f2-c6d55182ac2d', 'c1b39e27-60d1-4976-91d8-834716d6287b', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-03', 1, 1, '2026-01-03 22:39:52'),
('df2bcec6-1948-43b1-a588-c38bec07ddf5', 'ee5653d5-6b9e-4359-a35e-8d223abec711', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-02-05', 1, 1, '2026-02-05 10:50:27'),
('f3340ab4-3cbf-45a1-bc53-35288e52bde0', '11a96b0e-0843-4ed9-be25-d48536c957e6', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-05', 1, 1, '2026-01-05 10:58:19'),
('f4642af6-191d-4da5-8027-c8cf46a8ca69', '0b5e9248-e6ec-4d53-b74b-d02d63f498d2', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2026-01-19', 1, 1, '2026-01-19 17:34:28');

-- --------------------------------------------------------

--
-- Structure de la table `reminders`
--

CREATE TABLE `reminders` (
  `id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `season_id` varchar(36) NOT NULL,
  `type` enum('registration','monthly','welcome') NOT NULL,
  `month_number` int(11) DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reminders`
--

INSERT INTO `reminders` (`id`, `member_id`, `season_id`, `type`, `month_number`, `status`, `sent_at`, `created_at`) VALUES
('2302329a-bba4-4cc9-a48b-1827e1360cee', 'a6e607fa-ab55-4294-bc31-c59873b8b470', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 'welcome', NULL, 'sent', '2026-02-05 11:12:54', '2026-02-05 11:12:54'),
('5d062ac6-2ec1-4084-8da9-61c5b3a80ab3', '60a1611e-d229-4e99-b281-d657feaacc15', 'dd5a1a32-f880-43cf-b9ad-ed55f08719c7', 'welcome', NULL, 'sent', '2026-02-05 11:13:06', '2026-02-05 11:13:06');

-- --------------------------------------------------------

--
-- Structure de la table `seasons`
--

CREATE TABLE `seasons` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_fee` int(11) NOT NULL DEFAULT 2000,
  `monthly_fee` int(11) NOT NULL DEFAULT 1000,
  `annual_total` int(11) NOT NULL DEFAULT 10000,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `seasons`
--

INSERT INTO `seasons` (`id`, `name`, `start_date`, `end_date`, `registration_fee`, `monthly_fee`, `annual_total`, `is_active`, `created_at`, `updated_at`) VALUES
('a54b4bb6-fe42-4083-b7e1-3f0c8dec9512', '2024/2025', '2024-11-21', '2025-07-31', 2000, 1000, 10000, 0, '2025-12-21 12:31:11', '2025-12-30 01:00:35'),
('dd5a1a32-f880-43cf-b9ad-ed55f08719c7', '2025/2026', '2025-11-21', '2026-07-31', 2000, 1000, 10000, 1, '2025-12-21 12:30:18', '2025-12-30 01:00:33');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`) VALUES
('61c572b3-64aa-4acb-a8c1-7b3e37176d7e', 'ikgueye@gmail.com', '$2y$10$Q.YQev.xjR3gQPKAHwLym.Y.e7oxG77H2G4bXWUROBJiFm2gkPFey', '2026-01-05 20:49:09'),
('ec485097-98b2-4725-976c-764949ca4a34', 'daoudafickou03@gmail.com', '$2y$10$41gkT4oA4B/tigKZkNLDxuGlotbLYS33GKsgb00cXS1uFT8MwtKe6', '2025-12-21 12:10:27'),
('f80cb803-cf6e-40b2-83aa-03eb2355650d', 'kadiab443@gmail.com', '$2y$10$V7UcqMEZLzNo/g02NvCfmO6/kAXFhKgttWyGZRjS9x6OrcD4yLlY6', '2025-12-27 13:26:52');

-- --------------------------------------------------------

--
-- Structure de la table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('super_admin','admin','treasurer','coach','member') NOT NULL DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`) VALUES
('2310e999-2160-43e9-bb37-a9a32b4b15b2', 'f80cb803-cf6e-40b2-83aa-03eb2355650d', 'treasurer', '2025-12-27 13:26:52'),
('2d236305-7619-4667-a024-e0839517e856', '61c572b3-64aa-4acb-a8c1-7b3e37176d7e', 'coach', '2026-01-05 20:49:09'),
('c679c40a-b3b3-46e4-a32d-e0bda8f54615', 'ec485097-98b2-4725-976c-764949ca4a34', 'super_admin', '2025-12-21 12:10:27');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `board_members`
--
ALTER TABLE `board_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `member_id` (`member_id`,`season_id`),
  ADD KEY `season_id` (`season_id`);

--
-- Index pour la table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `season_id` (`season_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Index pour la table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `member_number` (`member_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `season_id` (`season_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Index pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `member_id` (`member_id`,`season_id`),
  ADD KEY `season_id` (`season_id`);

--
-- Index pour la table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `season_id` (`season_id`);

--
-- Index pour la table `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`role`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `board_members`
--
ALTER TABLE `board_members`
  ADD CONSTRAINT `board_members_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `board_members_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
