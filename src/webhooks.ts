type TrelloWebhookType = "review" | "progress";

const installTrelloWebhook = (type: TrelloWebhookType) => {

    const idModelMap: Record<TrelloWebhookType, string> = {
        review: reviewListModelId,
        progress: progressListModelId
    };

    const callbackURL = `${getWebAppUrl()}?webhook=${type}`;

    return addTrelloWebhook({
        callbackURL,
        description: `Sends an email when an item is moved to the '${type}' column`,
        idModel: idModelMap[type]
    });
};