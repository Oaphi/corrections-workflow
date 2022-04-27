/**
 * @summary installs a time-based trigger
 * @param name trigger name
 * @param callback function to call
 * @param minutes interval (in minutes)
 */
const installTrigger = (name: string, callback: Function, minutes: number) => {
    const store = PropertiesService.getScriptProperties();

    const existing = store.getProperty(name);
    if (existing) {
        console.log(`[${name}] trigger already exists`);
        return;
    }

    const trigger = ScriptApp
        .newTrigger(callback.name)
        .timeBased()
        .everyMinutes(minutes)
        .create();

    const triggerId = trigger.getUniqueId();
    store.setProperty(name, triggerId);
};

/**
 * @summary installs trigger for new items processing
 */
const installNewItemsTrigger = () => installTrigger("new_items_trgger", processNewItems, 5);

/**
 * @summary installs trigger for ready items processing
 */
const installReadyItemsTrigger = () => installTrigger("ready_items_trigger", processReadyItems, 30);