import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
	matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
	allFrames: true,
	async main() {
		const res = await fetch(
			"https://cdn.jsdelivr.net/gh/simochee/textlint-for-backlog/vendor/textlint-worker.js",
		);
		const script = await res.text();
		const blob = new Blob([script], { type: "application/javascript" });
		const worker = new Worker(URL.createObjectURL(blob));

		worker.onmessage = console.log;
	},
});
