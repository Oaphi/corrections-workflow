const handleCardMovedToReview = (action: Trello.WebhookResponse["action"]) => {
    try {
        const { listModelIds } = getTrelloConfig();

        const { type, data, display } = action;

        if (
            type !== "updateCard" ||
            !data.listAfter ||
            !data.listBefore ||
            data.listAfter.id !== listModelIds.review ||
            data.listBefore.id !== listModelIds.progress
        ) {
            return;
        }

        const {
            entities: {
                card: { text, id },
            },
        } = display;

        const recipient = getReviewRecipient();
        if (!recipient) return;

        const subject = `[готово к ревью] ${text}`;

        const card = getTrelloCard(id);
        if (!card) return;

        const { desc, name } = card;

        GmailApp.sendEmail(recipient, subject, "", {
            htmlBody: `
<p>Корректура статьи "${name}" готова к <a href="${desc}" target="_blank">ревью</a></p>
${makeEmailSignature()}`,
        });
    } catch (error) {
        console.log(`[webhook]\n${error}`);
    }
};
