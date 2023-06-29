const handleCardMovedToProgress = (
    action: Trello.WebhookResponse["action"]
) => {
    try {
        const { type, data, display } = action;

        if (
            type !== "updateCard" ||
            (data.listAfter.id !== progressListModelId &&
                data.listBefore.id !== todoListModelId)
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

        const subject = `[в работе] ${text}`;

        const card = getTrelloCard(id);
        if (!card) return;

        const { desc, name } = card;

        GmailApp.sendEmail(recipient, subject, "", {
            htmlBody: `
<p>Cтатья "${name}" в <a href="${desc}" target="_blank">работе</a></p>
${makeEmailSignature()}`,
        });
    } catch (error) {
        console.log(`[webhook]\n${error}`);
    }
};
