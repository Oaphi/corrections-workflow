interface ProcessedItemInfo {
    error: boolean;
    id: string;
    name?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
}

const getWebAppUrl = (): string => {
    const store = PropertiesService.getScriptProperties();
    const deploymentId = store.getProperty("deployment_id");
    return deploymentId
        ? `https://script.google.com/macros/s/${deploymentId}/exec`
        : "";
};

const getWebhookResponseAction = (body: string) => {
    const { action }: Trello.WebhookResponse = JSON.parse(body);
    return action;
};

const doGet = ({ parameter }: GoogleAppsScript.Events.DoGet) => {
    const { path, pwd } = parameter;

    const store = PropertiesService.getScriptProperties();
    const pass = store.getProperty("app_pwd");
    if (pwd !== pass) {
        return ContentService.createTextOutput("Unauthorized");
    }

    if (path === "manage") {
        return getManageRoute({ folderId });
    }

    return getAuthRoute();
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

const doPost = ({
    postData,
    parameter,
}: GoogleAppsScript.Events.DoPost): void => {
    const { webhook } = parameter || {};
    const { contents } = postData || {};

    if (webhook === "progress") {
        try {
            const { type, data, display } = getWebhookResponseAction(contents);

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
    }

    // TODO: expand
    if (webhook === "review") {
        try {
            const { type, data, display } = getWebhookResponseAction(contents);

            if (
                type === "updateCard" &&
                data.listAfter.id === reviewListModelId &&
                data.listBefore.id === progressListModelId
            ) {
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
            }
        } catch (error) {
            console.log(`[webhook]\n${error}`);
        }
    }

    if (webhook === "done") {
        try {
            const { type, data, display } = getWebhookResponseAction(contents);

            console.log(display);

            if (type !== "updateCard" || data.listAfter.id !== doneListModelId)
                return;

            const db = SpreadsheetApp.openById(doneItemsDatabaseId);

            const table = db.getSheetByName("Items");
            if (!table) return;

            const newId = table.getLastRow();

            const newRow = [newId];

            table.appendRow(newRow);
        } catch (error) {
            console.log(`[webhook]\n${error}`);
        }
    }
};
