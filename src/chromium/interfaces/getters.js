import { getExternalBrowser } from "Shared/backgroundScripts/getters.js";

const nativeApps = [
  "org.mozilla.firefox_bridge_nmh_dev",
  "org.mozilla.firefox_bridge_nmh_nightly",
  "org.mozilla.firefox_bridge_nmh",
  "org.mozilla.firefox_bridge_nmh_esr",
];

/**
 * Determines whether Firefox is installed on the system and returns the name of the installed Firefox variant in
 * order of preference: dev, nightly, release, esr.
 *
 * @returns {Promise<string>} The name of the installed Firefox variant, or undefined if a Firefox variant is not installed.
 */
export async function getInstalledFirefoxVariant() {
  const isNativeAppValid = async (nativeApp) => {
    try {
      const response = await browser.runtime.sendNativeMessage(nativeApp, {
        command: "GetVersion",
        data: {},
      });
      if (response.result_code !== 0) {
        throw new Error(response.message);
      }
      return true;
    } catch (error) {
      console.error("Error getting NMH version:", error.message);
      return false;
    }
  };

  const previousNativeApp = await browser.storage.local.get("nativeApp");
  if (
    previousNativeApp &&
    (await isNativeAppValid(previousNativeApp.nativeApp))
  ) {
    return previousNativeApp.nativeApp;
  }

  // Check for installed variants using the respective native messaging host.
  for (const nativeApp of nativeApps) {
    if (await isNativeAppValid(nativeApp)) {
      await browser.storage.local.set({ nativeApp });
      return nativeApp;
    }
  }

  return undefined;
}
