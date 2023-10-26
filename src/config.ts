const folderId = "1rEwHBw4OSJ9H72kpdZh2KQA9Fsu5PyuF";

const processedItemsKey = "processed_items";
const newItemsTriggerDisabledKey = "new_items_trigger_disabled";
const readyItemsTriggerDisabledKey = "ready_items_trigger_disabled";

interface DatabaseConfig {
    id: string;
}

interface TrelloConfig {
    apiKey: string;
    boardId: string;
    listIds: {
        done: string;
        review: string;
        todo: string;
    };
    listModelIds: {
        done: string;
        progress: string;
        review: string;
        todo: string;
    };
}

const getDatabaseConfig = (): DatabaseConfig => {
    const store = PropertiesService.getScriptProperties();

    const props = store.getProperties();

    return {
        id: props["database_id"],
    };
};

const getTrelloConfig = (): TrelloConfig => {
    const store = PropertiesService.getScriptProperties();

    const props = store.getProperties();

    return {
        apiKey: props["trello_api_key"],
        boardId: props["trello_board_id"],
        listIds: {
            done: props["done_list_id"],
            review: props["review_list_id"],
            todo: props["todo_list_id"],
        },
        listModelIds: {
            done: props["done_list_model_id"],
            progress: props["progress_list_model_id"],
            review: props["review_list_model_id"],
            todo: props["todo_list_model_id"],
        },
    };
};
