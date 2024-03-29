type DoneItemsDBEntry = [
    card_id: string,
    card_name: string,
    card_url: string,
    doc_url: string
];

const getGDocLinksFromCard = (card: Trello.Card) => {
    const { desc } = card;

    const docsLinkRegExp =
        /https:\/\/docs\.google\.com\/document\/d\/[\w=-]+(?:\/edit)?/g;

    return desc.match(docsLinkRegExp) || [];
};

const handleCardMovedToDone = (action: Trello.WebhookResponse["action"]) => {
    try {
        const { id: databaseId } = getDatabaseConfig();

        const { listModelIds } = getTrelloConfig();

        const { type, data } = action;

        if (
            type !== "updateCard" ||
            !data.listAfter ||
            data.listAfter.id !== listModelIds.done
        ) {
            return;
        }

        const { id: cardId, name: cardName, shortLink: cardUrl } = data.card;

        const card = getTrelloCard(cardId);

        if (!card) {
            console.log(`[webhook:done] card "${cardName}" doesn't exist`);
            return;
        }

        const links = getGDocLinksFromCard(card);

        if (!links.length) {
            console.log(`[webhook:done] no GDocs links in "${cardName}" card`);
        }

        const db = SpreadsheetApp.openById(databaseId);

        const table = db.getSheetByName("Items");
        if (!table) {
            console.log(`[webhook:done] no done items DB (${databaseId})`);
            return;
        }

        const newRowValues: DoneItemsDBEntry[] = links.map((url) => [
            cardId,
            cardName,
            cardUrl,
            url,
        ]);

        const lastRowPos = table.getLastRow();
        const lastColPos = table.getLastColumn();

        table.insertRowsAfter(lastRowPos, newRowValues.length);

        const newRows = table.getRange(
            lastRowPos + 1,
            1,
            newRowValues.length,
            lastColPos
        );

        newRows.setValues(newRowValues);
    } catch (error) {
        console.log(`[webhook:done]\n${error}`);
    }
};
