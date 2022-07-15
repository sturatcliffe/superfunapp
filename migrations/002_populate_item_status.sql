INSERT INTO ItemStatus (`itemId`, `status`, `createdAt`)
SELECT `id`, 'Unwatched', `createdAt` FROM Item;

INSERT INTO ItemStatus (`itemId`, `status`, `createdAt`)
SELECT `id`, `status`, `updatedAt` FROM Item WHERE `status`<>'Unwatched';