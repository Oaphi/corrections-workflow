
type ProcessedItemIds = string[];


const getParentIds = (file: GoogleAppsScript.Drive.File): Set<string> => {
    const ids = new Set<string>();

    const parents = file.getParents();
    while (parents.hasNext()) {
        const parent = parents.next();
        ids.add(parent.getId());
    }

    return ids;
};

const convertToDocs = (file: GoogleAppsScript.Drive.File): string | undefined => {
    const blob = file.getBlob();

    const converted = Drive.Files?.insert({
        title: blob.getName(),
        mimeType: "application/vnd.google-apps.document",
        parents: [...getParentIds(file)].map((id) => ({ id }))
    }, blob, {
        convert: true
    });

    return converted?.id;
};

/**
 * @summary gets item ids in a given folder
 * @param folderId folder id to lookup
 */
const getItemIds = (folderId: string): Set<string> => {
    const folder = DriveApp.getFolderById(folderId);

    const files = folder.getFiles();

    const ids: Set<string> = new Set();

    while (files.hasNext()) {
        const file = files.next();
        const fileId = file.getId();
        ids.add(fileId);
    }

    return ids;
};

const processNewItems = () => {
    const key = "processed_items";

    const store = PropertiesService.getScriptProperties();

    const ids: ProcessedItemIds = JSON.parse(store.getProperty(key) || "[]");

    const processedIds = new Set(ids);
    const itemIds = getItemIds(folderId);

    const [unprocessedIds] = diffSets(itemIds, processedIds);

    console.log(`[unprocessed]\n${[...unprocessedIds].join("\n")}`);

    const mimes = new Set([
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]);

    const cards = getTrelloCards(trelloBoardId);
    if (!cards.length) {
        console.log(`[trello-api] failed get Trello cards`);
        return;
    }

    const newlyProcessedIds = filterSet(unprocessedIds, (id) => {
        const file = DriveApp.getFileById(id);
        const mime = file.getMimeType();

        if (!mimes.has(mime)) return false;

        const fileId = convertToDocs(file);
        if (!fileId) return false;

        Drive.Files?.remove(id);

        const itemCard = cards.find(({ desc }) => desc.includes(`/d/${id}`));
        if (itemCard) {
            console.log(`[${fileId}] Trello card for the item exists`);
            return false;
        }

        const newCard = addTrelloCard({
            idList: todoListId,
            desc: `https://docs.google.com/document/d/${fileId}/edit`,
            name: file.getName().replace(/\.\w+?$/, "")
        });

        if (!newCard) {
            console.log(`[${fileId}] failed to add Trello card`);
            return false;
        }

        return true;
    });

    const updatedIds = mergeSets(processedIds, newlyProcessedIds);

    store.setProperty(key, JSON.stringify([...updatedIds]));
};