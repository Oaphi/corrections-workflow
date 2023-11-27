const handleCardMovedToProgress = (
    action: Trello.WebhookResponse["action"]
) => {
    try {
        const { listModelIds } = getTrelloConfig();

        const { type, data, display } = action;

        if (
            type !== "updateCard" ||
            (data.listAfter.id !== listModelIds.progress &&
                data.listBefore.id !== listModelIds.todo)
        ) {
            return;
        }

        const {
            entities: {
                card: { text, id },
            },
        } = display;

        const recipient = getReviewRecipient();
        if (!recipient) {
            console.log("[webhook:progress] missing email recipient");
            return;
        }

        const subject = `[в работе] ${text}`;

        const card = getTrelloCard(id);
        if (!card) {
            console.log("[webhook:progress] missing Trello card");
            return;
        }

        const [docURL] = getGDocLinksFromCard(card);

        const { name } = card;

        const docName = docURL
            ? `<a href="${docURL}" target="_blank">"${name}"</a>`
            : `"${name}"`;

        GmailApp.sendEmail(recipient, subject, "", {
            htmlBody: `
<p>Статья ${docName} в работе.</p>
${makeEmailSignature()}`,
        });
    } catch (error) {
        console.log(`[webhook:progress]\n${error}`);
    }
};
