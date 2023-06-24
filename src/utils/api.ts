/**
 * Processes unsuccessful requests to APIs
 * @param res errored response from the API
 */
const processAPIError = (res: GoogleAppsScript.URL_Fetch.HTTPResponse) => {
    const code = res.getResponseCode();
    const text = res.getContentText();

    try {
        const parsed = JSON.parse(text);
        console.log(`[api ${code}] JSON response from API:\n`, parsed);
    } catch (error) {
        console.log(`[api ${code}] non-JSON response from API:\n${text}`);
    }
};
