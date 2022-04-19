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
     * {@see https://cloudconvert.com/api/v2/import#import-base64-tasks}
     */
    interface ImportBase64Payload {
        file: string;
        filename: string;
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