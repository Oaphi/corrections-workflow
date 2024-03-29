const trelloApiBase = "https://api.trello.com/1";

const setTrelloToken = (token: string): void => {
    const store = PropertiesService.getScriptProperties();
    store.setProperty("trello_token", token);
};

const getTrelloToken = (): string => {
    const store = PropertiesService.getScriptProperties();
    return store.getProperty("trello_token") || "";
};

const getTrelloAuthHeader = (apiKey: string, apiToken: string) => ({
    Authorization: `OAuth oauth_consumer_key="${apiKey}", oauth_token="${apiToken}"`,
});

const getTrelloBoard = (id: string): Trello.Board | undefined => {
    const token = getTrelloToken();
    if (!token) return;

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/boards/${id}?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return;
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@link https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get}
 */
const getTrelloCard = (id: string): Trello.Card | undefined => {
    const token = getTrelloToken();
    if (!token) return;

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/cards/${id}?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return;
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-boards/#api-boards-id-cards-get}
 */
const getTrelloCards = (boardId: string): Trello.Card[] => {
    const token = getTrelloToken();
    if (!token) return [];

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/boards/${boardId}/cards?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return [];
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-boards/#api-boards-id-lists-get}
 */
const getTrelloLists = (boardId: string): Trello.List[] => {
    const token = getTrelloToken();
    if (!token) return [];

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/boards/${boardId}/lists?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return [];
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-lists/#api-lists-id-cards-get}
 */
const getTrelloCardsInList = (listId: string): Trello.Card[] => {
    const token = getTrelloToken();
    if (!token) {
        console.error("[api error] missing Trello token");
        return [];
    }

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/lists/${listId}/cards?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return [];
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-tokens/#api-tokens-token-webhooks-get}
 */
const getTrelloWebhooks = (): Trello.Webhook[] => {
    const token = getTrelloToken();
    if (!token) return [];

    const { apiKey } = getTrelloConfig();

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/tokens/${token}/webhooks?key=${apiKey}&token=${token}`,
        {
            muteHttpExceptions: true,
        }
    );

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return [];
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-post}
 */
const addTrelloCard = (
    payload: Trello.CardPayload
): Trello.Card | undefined => {
    const token = getTrelloToken();

    const { apiKey } = getTrelloConfig();

    if (!token || !apiKey) {
        return;
    }

    const res = UrlFetchApp.fetch(`${trelloApiBase}/cards?key=${apiKey}`, {
        method: "post",
        muteHttpExceptions: true,
        payload,
        headers: getTrelloAuthHeader(apiKey, token),
    });

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return;
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-put}
 */
const moveTrelloCard = (cardId: string, listId: string): boolean => {
    const token = getTrelloToken();

    const { apiKey } = getTrelloConfig();

    if (!token || !apiKey) {
        return false;
    }

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/cards/${cardId}?key=${apiKey}`,
        {
            method: "put",
            muteHttpExceptions: true,
            payload: { idList: listId },
            headers: getTrelloAuthHeader(apiKey, token),
        }
    );

    const success = res.getResponseCode() === 200;

    if (!success) {
        processAPIError(res);
        return success;
    }

    return success;
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-webhooks/#api-webhooks-post}
 */
const addTrelloWebhook = (
    payload: Trello.WebhookPayload
): Trello.Webhook | undefined => {
    const token = getTrelloToken();

    const { apiKey } = getTrelloConfig();

    if (!token || !apiKey) {
        return;
    }

    const res = UrlFetchApp.fetch(`${trelloApiBase}/webhooks?key=${apiKey}`, {
        method: "post",
        muteHttpExceptions: true,
        payload,
        headers: getTrelloAuthHeader(apiKey, token),
    });

    if (res.getResponseCode() !== 200) {
        processAPIError(res);
        return;
    }

    return JSON.parse(res.getContentText());
};

/**
 * {@see https://developer.atlassian.com/cloud/trello/rest/api-group-webhooks/#api-webhooks-id-delete}
 */
const removeTrelloWebhook = (id: string): boolean => {
    const token = getTrelloToken();

    const { apiKey } = getTrelloConfig();

    if (!token || !apiKey) {
        return false;
    }

    const res = UrlFetchApp.fetch(
        `${trelloApiBase}/webhooks/${id}?key=${apiKey}`,
        {
            method: "delete",
            muteHttpExceptions: true,
            headers: getTrelloAuthHeader(apiKey, token),
        }
    );

    const success = res.getResponseCode() === 200;

    if (!success) {
        processAPIError(res);
        return success;
    }

    return success;
};
