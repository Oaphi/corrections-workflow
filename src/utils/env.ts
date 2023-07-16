const ensureEnvDefaults = (
    store: GoogleAppsScript.Properties.Properties
): void => {
    try {
        const newItemsTriggerDisabled = store.getProperty(
            newItemsTriggerDisabledKey
        );
        const readyItemsTriggerDisabled = store.getProperty(
            readyItemsTriggerDisabledKey
        );

        if (newItemsTriggerDisabled === null) {
            store.setProperty(newItemsTriggerDisabledKey, "false");
        }

        if (readyItemsTriggerDisabled === null) {
            store.setProperties({
                [newItemsTriggerDisabledKey]: "false",
                [readyItemsTriggerDisabledKey]: "false",
            });
        }
    } catch (error) {
        console.log(`[env] failed to initialize environment`);
    }
};

const isNewItemsTriggerDisabled = (): boolean => {
    try {
        const store = PropertiesService.getScriptProperties();

        ensureEnvDefaults(store);

        return JSON.parse(
            store.getProperty(newItemsTriggerDisabledKey) || "false"
        );
    } catch (error) {
        console.log(`[env] failed to get new items trigger env\n${error}`);
        return false;
    }
};

const isProcessReadyItemsTriggerDisabled = (): boolean => {
    try {
        const store = PropertiesService.getScriptProperties();

        ensureEnvDefaults(store);

        return JSON.parse(
            store.getProperty(readyItemsTriggerDisabledKey) || "false"
        );
    } catch (error) {
        console.log(`[env] failed to get ready items trigger env\n${error}`);
        return false;
    }
};
