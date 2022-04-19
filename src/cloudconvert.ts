/// <reference path="./cloudconvert.d.ts" />

const cloudConvertApiBase = "https://api.cloudconvert.com/v2";

type ItemConvertTaskInfo = {
    importId?: string;
    exportId?: string;
    convertId?: string;
};

const getCloudConvertTasksInfo = (): Map<string, ItemConvertTaskInfo> => {
    const store = PropertiesService.getScriptProperties();
    const tasks = JSON.parse(store.getProperty("cloudconvert_tasks") || "[]");
    return new Map(tasks);
};

const setCloudConvertTasksInfo = (taskIds: Map<string, ItemConvertTaskInfo>): boolean => {
    try {
        const store = PropertiesService.getScriptProperties();
        store.setProperty("cloudconvert_tasks", JSON.stringify([...taskIds]));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const getCloudConvertToken = (): string => {
    try {
        const store = PropertiesService.getScriptProperties();
        return store.getProperty("cloudconvert_token") || "";
    } catch (error) {
        console.log(error);
        return "";
    }
};

const setCloudConvertToken = (token: string): boolean => {
    try {
        const store = PropertiesService.getScriptProperties();
        store.setProperty("cloudconvert_token", token);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const parseCloudConvertResponse = <T>(res: GoogleAppsScript.URL_Fetch.HTTPResponse, successCode = 200): T | undefined => {
    if (res.getResponseCode() !== successCode) return;
    const { data }: { data: T; } = JSON.parse(res.getContentText());
    return data;
};

/**
 * {@see https://cloudconvert.com/api/v2/import#import-url-tasks}
 */
const createImportUrlTask = (file: GoogleAppsScript.Drive.File): CloudConvert.Task | undefined => {
    const token = getCloudConvertToken();

    const payload: CloudConvert.ImportUrlTaskPayload = {
        filename: file.getName(),
        url: file.getDownloadUrl(),
    };

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/import/url`, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload)
    });

    return parseCloudConvertResponse(res, 201);
};

/**
 * {@see https://cloudconvert.com/api/v2/import#import-base64-tasks}
 */
const createImportBase64Task = (file: GoogleAppsScript.Drive.File): CloudConvert.Task | undefined => {
    const token = getCloudConvertToken();

    const payload: CloudConvert.ImportBase64Payload = {
        file: Utilities.base64Encode(file.getBlob().getBytes()),
        filename: file.getName(),
    };

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/import/base64`, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload)
    });

    return parseCloudConvertResponse(res, 201);
}

/**
 * {@see https://cloudconvert.com/api/v2/tasks#tasks-show}
 */
const readTask = <T extends CloudConvert.Task>(id: string): T | undefined => {
    const token = getCloudConvertToken();

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/tasks/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    return parseCloudConvertResponse(res);
};

/**
 * {@see https://cloudconvert.com/api/v2/convert#convert-tasks}
 */
const createConvertTask = (importTaskId: string, format: CloudConvert.SupportedConvertFormats): CloudConvert.Task | undefined => {
    const token = getCloudConvertToken();

    const payload: CloudConvert.ConvertTaskPayload = {
        input: importTaskId,
        output_format: format
    };

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/convert`, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload)
    });

    return parseCloudConvertResponse(res, 201);
};

/**
 * {@see https://cloudconvert.com/api/v2/export#export-url-tasks}
 */
const createExportUrlTask = (importTaskId: string): CloudConvert.ExportUrlTask | undefined => {
    const token = getCloudConvertToken();

    const payload: CloudConvert.ExportUrlTaskPayload = {
        input: importTaskId,
        archive_multiple_files: false,
        inline: false
    };

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/export/url`, {
        method: "post",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload)
    });

    return parseCloudConvertResponse(res, 201);
};

/**
 * {@see https://cloudconvert.com/api/v2/tasks#tasks-retry}
 */
const retryTask = <T extends CloudConvert.Task>(id: string): T | undefined => {
    const token = getCloudConvertToken();

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/tasks/${id}/retry`, {
        method: "post",
        headers: { "Authorization": `Bearer ${token}` }
    });

    return parseCloudConvertResponse(res, 201);
};