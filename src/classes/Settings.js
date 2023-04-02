import { lq } from "./Lightquark";

const defaultSettings = {
	ql_theme: 'dark', // Quarklight theme
	usePlainText: false, // Parse plain text clientAttribute when present
	ql_notificationVolume: 0.5, // Notification sound volume
	notificationsEnabled: true, // Enable notifications
	mutedChannels: [], // Array of channel IDs to mute
	ql_showModifiedToggle: true,
	ql_compactMode: false
};

class Settings {

	#settingsState;

	#settings = defaultSettings

	constructor() {
		if (Settings._instance) {
			return Settings._instance;
		}
		Settings._instance = this;
		this.#restoreSaved();
		//this.#restoreRemote();
	}

	set settingsState(context) {
		this.#settingsState = context;
	}
	get settingsState() {
		return this.#settingsState;
	}

	#restoreSaved() {
		try {
			const saved = localStorage.getItem('settings');
			if (saved) {
				// Overwrite default settings with saved settings
				this.#settings = Object.assign({...this.#settings}, JSON.parse(saved));
			} else {
				console.log("No saved settings found.");
			}
		} catch (e) {
			console.error(e);
			this.#settings = defaultSettings;
			lq.pendingWarning = {
				message: "An error occurred while loading settings. Try restoring default settings.",
				severityColor: "#F79824",
				severity: "WARNING"
			};
		}
	}

	// Object with all settings, and custom setter
	get settings() {
		return new Proxy(this.#settings, {
			set: (target, prop, value) => {
				target[prop] = value;
				this.#save();
				return true;
			}
		});
	}

	#save() {
		localStorage.setItem('settings', JSON.stringify(this.#settings));
		if (this.#settingsState) {
			this.#settingsState.setState(this.settings);
		}
	}
}

const settings = new Settings();

export default settings;