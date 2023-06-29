const getAuthRoute = (): GoogleAppsScript.HTML.HtmlOutput => {
    const template = HtmlService.createTemplateFromFile("src/auth.html");
    template.url = getWebAppUrl();
    return template.evaluate();
};
