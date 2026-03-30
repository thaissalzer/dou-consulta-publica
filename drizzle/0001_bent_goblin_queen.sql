CREATE TABLE `dou_publicacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`douId` varchar(255) NOT NULL,
	`titulo` text NOT NULL,
	`orgao` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`dataPublicacao` timestamp NOT NULL,
	`dataCriacao` timestamp NOT NULL DEFAULT (now()),
	`dataEmailEnviado` timestamp,
	CONSTRAINT `dou_publicacoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `dou_publicacoes_douId_unique` UNIQUE(`douId`)
);
