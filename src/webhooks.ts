type TrelloWebhookType = "review" | "progress" | "done";

const getTrelloWebhookURL = (type: TrelloWebhookType): string | undefined => {
    const store = PropertiesService.getScriptProperties();
    const retranslatorURL = store.getProperty("retranslator_url");

    if (!retranslatorURL) {
        return;
    }

    return `${retranslatorURL}?type=${type}`;
};

const installTrelloWebhook = (
    type: TrelloWebhookType
): Trello.Webhook | undefined => {
    const callbackURL = getTrelloWebhookURL(type);

    if (!callbackURL) {
        return;
    }

    const { listModelIds } = getTrelloConfig();

    const idModelMap: Record<TrelloWebhookType, [id: string, desc: string]> = {
        done: [
            listModelIds.done,
            `Handles an item being moved to the 'done' column`,
        ],
        review: [
            listModelIds.review,
            `Sends an email when an item is moved to the 'review' column`,
        ],
        progress: [
            listModelIds.progress,
            `Sends an email when an item is moved to the 'progress' column`,
        ],
    };

    const [idModel, description] = idModelMap[type];

    return addTrelloWebhook({
        callbackURL,
        description,
        idModel,
    });
};
