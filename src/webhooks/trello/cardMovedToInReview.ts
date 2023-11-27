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
        if (!recipient) {
            console.log("[webhook:review] missing email recipient");
            return;
        }

        const subject = `[готово к ревью] ${text}`;

        const card = getTrelloCard(id);
        if (!card) {
            console.log("[webhook:review] missing Trello card");
            return;
        }

        const [docURL] = getGDocLinksFromCard(card);

        const { name } = card;

        const docName = docURL
            ? `<a href="${docURL}" target="_blank">"${name}"</a>`
            : `"${name}"`;

        GmailApp.sendEmail(recipient, subject, "", {
            htmlBody: `
<p>Корректура статьи ${docName} готова к ревью.</p>
${makeEmailSignature()}`,
        });
    } catch (error) {
        console.log(`[webhook:review]\n${error}`);
    }
};
