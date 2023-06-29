interface ManageRouteOptions {
    folderId: string;
}

const getManageRoute = (
    config: ManageRouteOptions
): GoogleAppsScript.HTML.HtmlOutput => {
    const template = HtmlService.createTemplateFromFile("src/manage.html");

    const processedIds = getItemIds(config.folderId);

    const processedItems: ProcessedItemInfo[] = [];

    processedIds.forEach((id) => {
        const item: ProcessedItemInfo = { id, error: false };

        try {
            item.url = DocumentApp.openById(id).getUrl();

            const file = DriveApp.getFileById(id);
            item.name = file.getName();
            item.createdAt = file.getDateCreated().toISOString();
            item.updatedAt = file.getLastUpdated().toISOString();
        } catch (error) {
            console.log(error);
            item.error = true;
        }

        processedItems.push(item);
    });

    template.processed = JSON.stringify(processedItems);

    const doneItems: DoneItemInfo[] = [];

    const db = SpreadsheetApp.openById(doneItemsDatabaseId);

    const table = db.getSheetByName("Items");
    if (table) {
        const range = table.getRange(
            2,
            1,
            table.getLastRow() - 1,
            table.getLastColumn()
        );

        const entries = range.getValues() as DoneItemsDBEntry[];

        entries.forEach((record) => {
            const [cardId, cardName, cardUrl, url] = record;
            doneItems.push({
                cardId,
                cardName,
                cardUrl: `https://trello.com/c/${cardUrl}`,
                url,
            });
        });
    }

    template.done = JSON.stringify(doneItems);

    template.cards = JSON.stringify(getTrelloCards(trelloBoardId));
    template.lists = JSON.stringify(getTrelloLists(trelloBoardId));
    template.webhooks = JSON.stringify(getTrelloWebhooks());
    return template.evaluate();
};
