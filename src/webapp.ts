interface ProcessedItemInfo {
    error: boolean;
    id: string;
    name?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ReviewItemInfo {
    cardId: string;
    cardName: string;
    cardUrl: string;
    url: string;
}

interface DoneItemInfo {
    cardId: string;
    cardName: string;
    cardUrl: string;
    url: string;
}

const getWebAppUrl = (): string => {
    const store = PropertiesService.getScriptProperties();
    const deploymentId = store.getProperty("deployment_id");
    return deploymentId
        ? `https://script.google.com/macros/s/${deploymentId}/exec`
        : "";
};

const getWebhookResponseAction = (
    body: string
): Trello.WebhookResponse["action"] | null => {
    try {
        const { action }: Trello.WebhookResponse = JSON.parse(body);
        return action;
    } catch (error) {
        console.log(`[webhook] failed to parse webhook body:\n${error}`);
        return null;
    }
};

const doGet = ({ parameter }: GoogleAppsScript.Events.DoGet) => {
    const { path, pwd } = parameter;

    const store = PropertiesService.getScriptProperties();
    const pass = store.getProperty("app_pwd");
    if (pwd !== pass) {
        return ContentService.createTextOutput("Unauthorized");
    }

    if (path === "manage") {
        const folderId = store.getProperty("storage_root_folder_id");

        if (!folderId) {
            return ContentService.createTextOutput(
                "Manage route is misconfigured"
            );
        }

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

    const action = getWebhookResponseAction(contents);

    if (!action) {
        return;
    }

    if (webhook === "progress") {
        handleCardMovedToProgress(action);
    }

    // TODO: expand
    if (webhook === "review") {
        handleCardMovedToReview(action);
    }

    if (webhook === "done") {
        handleCardMovedToDone(action);
    }
};
