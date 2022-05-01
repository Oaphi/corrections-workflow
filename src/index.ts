
type ProcessedItemIds = string[];

/**
 * @summary gets .pages {@link GoogleAppsScript.Drive.File}s in a given folder
 * @param folderId folder id to lookup
 */
const getPagesFiles = (folderId: string): Map<string, GoogleAppsScript.Drive.File> => {
    const pages = new Map<string, GoogleAppsScript.Drive.File>();

    const folder = DriveApp.getFolderById(folderId);

    const files = folder.getFilesByType("application/x-iwork-pages-sffpages");
    while (files.hasNext()) {
        const file = files.next();
        pages.set(file.getId(), file);
    }

    return pages;
};

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
 * @summary gets items in a given folder
 * @param folderId folder id to lookup
 */
const getItems = (folderId: string): Map<string, GoogleAppsScript.Drive.File> => {
    const folder = DriveApp.getFolderById(folderId);

    const files = folder.getFiles();

    const items: Map<string, GoogleAppsScript.Drive.File> = new Map();

    while (files.hasNext()) {
        const file = files.next();
        const fileId = file.getId();
        items.set(fileId, file);
    }

    return items;
}

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

const processReadyItems = () => {
    const cards = getTrelloCards(trelloBoardId);
    if (!cards.length) {
        console.log(`[trello-api] failed get Trello cards`);
        return;
    }

    const ids = getItemIds(folderId);

    ids.forEach((fileId) => {
        const card = cards.find(({ desc }) => desc.includes(fileId));
        if (!card) return;

        const { idList } = card;
        if (idList !== reviewListId) return;

        const { items = [] } = Drive.Comments?.list(fileId) || {};
        if (items.length) return;

        moveTrelloCard(card.id, doneListId);
    });
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

    const cloudConvertTasks = getCloudConvertTasksInfo();
    const pagesFiles = getPagesFiles(folderId);

    pagesFiles.forEach((file, itemId) => {
        try {
            const tasksInfo = cloudConvertTasks.get(itemId) || {};

            const { importId = "", exportId = "", convertId = "" } = tasksInfo;

            if (!importId) {
                const importTask = createImportBase64Task(file);
                if (!importTask) return;
                tasksInfo.importId = importTask.id;
                cloudConvertTasks.set(itemId, tasksInfo);
                console.log(`[${itemId}] importing item`);
                return;
            }

            const importTask = readTask(importId);
            if (importTask?.status !== "finished") {
                console.log(`[${itemId}] import status: ${importTask?.status}`);

                if (importTask?.status === "error") {
                    tasksInfo.importId = retryTask(importId)?.id;
                    console.log(`[${itemId}] retrying import task`);
                }

                return;
            }

            if (!convertId) {
                const convertTask = createConvertTask(importId, "docx");
                if (!convertTask) return;
                tasksInfo.convertId = convertTask.id;
                cloudConvertTasks.set(itemId, tasksInfo);
                console.log(`[${itemId}] converting item`);
                return;
            }

            const convertTask = readTask(convertId);
            if (convertTask?.status !== "finished") {
                console.log(`[${itemId}] conversion status: ${convertTask?.status}`);

                if (convertTask?.status === "error") {
                    tasksInfo.convertId = retryTask(convertId)?.id;
                    console.log(`[${itemId}] retrying convert task`);
                }

                return;
            }

            if (!exportId) {
                const exportTask = createExportUrlTask(convertId);
                if (!exportTask) return;
                tasksInfo.exportId = exportTask.id;
                cloudConvertTasks.set(itemId, tasksInfo);
                console.log(`[${itemId}] exporting item`);
                return;
            }

            const exportTask = readTask<CloudConvert.ExportUrlTask>(exportId);
            if (exportTask?.status !== "finished") {
                console.log(`[${itemId}] export status: ${exportTask?.status}`);

                if (exportTask?.status === "error") {
                    tasksInfo.exportId = retryTask(exportId)?.id;
                    console.log(`[${itemId}] retrying export task`);
                }

                return;
            }

            const { result: { files: [{ url, filename }] } } = exportTask;

            const res = UrlFetchApp.fetch(url);
            if (res.getResponseCode() !== 200) {
                console.log(`[${itemId}] failed to get converted item`);
                return;
            }

            const blob = res.getBlob();

            const gdoc = Drive.Files?.insert({
                title: filename.replace(/\.\w+?$/, ""),
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                parents: [{ id: folderId }]
            }, blob);

            if (!gdoc) return;

            Drive.Files?.remove(itemId);
        } catch (error) {
            console.log(`[${itemId}] fatal error ${error}`);
        }
    });

    setCloudConvertTasksInfo(cloudConvertTasks);

    const newlyProcessedIds = filterSet(unprocessedIds, (itemId) => {
        try {
            const file = DriveApp.getFileById(itemId);
            const mime = file.getMimeType();

            if (mime === "application/vnd.google-apps.document") {
                const itemCard = cards.find(({ desc }) => desc.includes(`/d/${itemId}`));
                if (itemCard) {
                    console.log(`[${itemId}] Trello card for the item exists`);
                    return true;
                }

                const newCard = addTrelloCard({
                    idList: todoListId,
                    desc: `https://docs.google.com/document/d/${itemId}/edit`,
                    name: file.getName().replace(/\.\w+?$/, "")
                });

                if (!newCard) {
                    console.log(`[${itemId}] failed to add Trello card`);
                    return false;
                }

                return true;
            }

            if (mimes.has(mime)) {
                const fileId = convertToDocs(file);
                if (!fileId) return false;

                Drive.Files?.remove(itemId);
                return true;
            }

            return false;
        } catch (error) {
            console.log(`[failure] ${error}`);
            return false;
        }
    });

    const updatedIds = mergeSets(processedIds, newlyProcessedIds);

    store.setProperty(key, JSON.stringify([...updatedIds]));
};