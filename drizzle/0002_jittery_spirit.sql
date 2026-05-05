CREATE TABLE `search_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`searchType` varchar(50) NOT NULL,
	`results` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_cache_date_unique` UNIQUE(`date`)
);
