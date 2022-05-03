type TrelloWebhookType = "review" | "progress";

const installTrelloWebhook = (type: TrelloWebhookType) => {

    const idModelMap: Record<TrelloWebhookType, string> = {
        review: reviewListModelId,
        progress: progressListModelId
    };

    return addTrelloWebhook({
        callbackURL: `${getWebAppUrl()}?webhook=${type}`,
        description: `Sends an email when an item is moved to the '${type}' column`,
        idModel: idModelMap[type]
    });
};