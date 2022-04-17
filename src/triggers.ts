/**
 * @summary installs the time-based trigger
 */
const installTrigger = () => {
    const key = "new_items_trgger";

    const store = PropertiesService.getScriptProperties();

    const existing = store.getProperty(key);
    if (existing) {
        console.log("new items trigger already exists");
        return;
    }

    const trigger = ScriptApp
        .newTrigger(processNewItems.name)
        .timeBased()
        .everyMinutes(5)
        .create();

    const triggerId = trigger.getUniqueId();
    store.setProperty(key, triggerId);
};