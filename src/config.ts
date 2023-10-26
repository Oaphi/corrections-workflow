const folderId = "1rEwHBw4OSJ9H72kpdZh2KQA9Fsu5PyuF";

const todoListModelId = "61b9a7b139e68e5fe566b75a";
const progressListModelId = "61b9a7b7ac684873d202db95";
const reviewListModelId = "61b9a7bb1b23a22610ed26f9";
const doneListModelId = "61b9a7bc58af8417b834e911";

const doneItemsDatabaseId = "162ALY4mBbCvAaEjdOn7sF1XR3YZr0jcrgLAK16s7kQA";

const processedItemsKey = "processed_items";
const newItemsTriggerDisabledKey = "new_items_trigger_disabled";
const readyItemsTriggerDisabledKey = "ready_items_trigger_disabled";

interface TrelloConfig {
    apiKey: string;
    boardId: string;
    listIds: {
        todo: string;
        review: string;
        done: string;
    };
}

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
    };
};
