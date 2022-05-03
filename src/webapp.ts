const getWebAppUrl = () => ScriptApp.getService().getUrl() || "";

const doGet = ({ parameter }: GoogleAppsScript.Events.DoGet) => {
    const { path, pwd } = parameter;

    const store = PropertiesService.getScriptProperties();
    const pass = store.getProperty("app_pwd");
    if (pwd !== pass) {
        return ContentService.createTextOutput("Unauthorized");
    }

    if (path === "manage") {
        const template = HtmlService.createTemplateFromFile("src/manage.html");
        template.processed = JSON.stringify([...getItemIds(folderId)]);
        template.cards = JSON.stringify(getTrelloCards(trelloBoardId));
        template.lists = JSON.stringify(getTrelloLists(trelloBoardId));
        template.webhooks = JSON.stringify(getTrelloWebhooks());
        return template.evaluate();
    }

    const template = HtmlService.createTemplateFromFile("src/auth.html");
    template.url = getWebAppUrl();
    return template.evaluate();
};

const getReviewRecipient = (): string => {
    try {
        const store = PropertiesService.getScriptProperties();
        return store.getProperty("review_recipient") || "";
    } catch (error) {
        console.log(error);
        return "";
    }
};

const setReviewRecipient = (email: string): boolean => {
    try {
        const store = PropertiesService.getScriptProperties();
        store.setProperty("review_recipient", email);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const doPost = ({ postData, parameter }: GoogleAppsScript.Events.DoPost): undefined => {
    const { webhook } = parameter;
    const { contents } = postData;

    if (webhook === "progress") {
        try {
            const response: Trello.WebhookResponse = JSON.parse(contents);

            const { action: { type, data, display } } = response;

            if (type !== "updateCard" || data.listAfter.id !== progressListModelId) return;

            const { entities: { card: { text, id } } } = display;

            const recipient = getReviewRecipient();
            if (!recipient) return;

            const subject = `[в работе] ${text}`;

            const card = getTrelloCard(id);
            if (!card) return;

            const { desc, name } = card;

            GmailApp.sendEmail(recipient, subject, "", {
                htmlBody: `
<p>Cтатья "${name}" в <a href="${desc}" target="_blank">работе</a></p>
${makeEmailSignature()}`
            });
        } catch (error) {
            console.log(`[webhook]\n${error}`);
        }
    }

    // TODO: expand
    if (webhook === "review") {
        try {
            const response: Trello.WebhookResponse = JSON.parse(contents);

            const { action: { type, data, display } } = response;

            if (type === "updateCard" && data.listAfter.id === reviewListModelId) {
                const { entities: { card: { text, id } } } = display;

                const recipient = getReviewRecipient();
                if (!recipient) return;

                const subject = `[готово к ревью] ${text}`;

                const card = getTrelloCard(id);
                if (!card) return;

                const { desc, name } = card;

                GmailApp.sendEmail(recipient, subject, "", {
                    htmlBody: `
<p>Корректура статьи "${name}" готова к <a href="${desc}" target="_blank">ревью</a></p>
${makeEmailSignature()}`
                });
            }


        } catch (error) {

        }
    }
};