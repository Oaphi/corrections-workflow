declare namespace CloudConvert {

    // TODO: expand
    type SupportedConvertFormats = "7z" | "img" | "doc" | "docm" | "docx" | "pages";

    type TaskStatus = "waiting" | "processing" | "finished" | "error";

    /**
     * {@see https://cloudconvert.com/api/v2/convert#convert-tasks}
     */
    interface ConvertTaskPayload {
        engine?: string;
        engine_version?: string;
        filename?: string;
        input: string;
        input_format?: SupportedConvertFormats;
        output_format: SupportedConvertFormats;
        timeout?: number;
    }

    /**
     * {@see https://cloudconvert.com/api/v2/export#export-url-tasks}
     */
    interface ExportUrlTaskPayload {
        archive_multiple_files?: boolean;
        inline?: boolean;
        input: string;
    }

    /**
     * {@see https://cloudconvert.com/api/v2/import#import-url-tasks}
     */
    interface ImportUrlTaskPayload {
        filename?: string;
        headers?: Record<string, string>;
        url: string;
    }

    /**
     * {@see https://cloudconvert.com/api/v2/tasks#tasks-show}
     */
    interface Task {
        code: string;
        created_at: string;
        ended_at: string;
        engine: string;
        engine_version: string;
        id: string;
        job_id: string;
        message: string;
        operation: string;
        payload: object;
        result: object;
        started_at: string;
        status: TaskStatus;
    }

    interface ExportUrlTask extends Task {
        result: {
            files: Array<{
                filename: string,
                url: string;
            }>;
        };
    }

    interface FinishedTask extends Task {
        credits: number;
        status: "finished";
    }
}

const cloudConvertApiBase = "https://api.cloudconvert.com/v2";

type ItemConvertTaskInfo = {
    importUrlId?: string;
    exportUrlId?: string;
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

    if (res.getResponseCode() !== 201) return;

    const { data } = JSON.parse(res.getContentText());
    return data;
};

/**
 * {@see https://cloudconvert.com/api/v2/tasks#tasks-show}
 */
const readTask = <T extends CloudConvert.Task>(id: string): T | undefined => {
    const token = getCloudConvertToken();

    const res = UrlFetchApp.fetch(`${cloudConvertApiBase}/tasks/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.getResponseCode() !== 200) return;

    const { data } = JSON.parse(res.getContentText());
    return data;
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

    if (res.getResponseCode() !== 201) return;

    const { data } = JSON.parse(res.getContentText());
    return data;
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

    if (res.getResponseCode() !== 201) return;

    const { data } = JSON.parse(res.getContentText());
    return data;
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

    if (res.getResponseCode() !== 201) return;

    const { data } = JSON.parse(res.getContentText());
    return data;
};