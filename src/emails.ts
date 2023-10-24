/**
 * @summary creates an email signature
 */
const makeEmailSignature = (): string => {
    const store = PropertiesService.getScriptProperties();
    return store.getProperty('email_signature') || 'WR,';
};