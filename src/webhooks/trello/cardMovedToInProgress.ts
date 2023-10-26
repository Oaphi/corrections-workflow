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

        const [docURL] = getGDocLinksFromCard(card);

        const { name } = card;

        const docName = docURL ? `<a href="${docURL}" target="_blank">"${name}"</a>` : `"${name}"`;

        GmailApp.sendEmail(recipient, subject, "", {
            htmlBody: `
<p>Статья ${docName} в работе.</p>
${makeEmailSignature()}`,
        });
    } catch (error) {
        console.log(`[webhook]\n${error}`);
    }
};
