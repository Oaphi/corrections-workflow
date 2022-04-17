const installInReviewHook = () => {
    addTrelloWebhook({
        callbackURL: `${getWebAppUrl()}?webhook=review`,
        description: "Sends an email when an item is moved to the 'In Review' column",
        idModel: "61b9a7bb1b23a22610ed26f9"
    });
};