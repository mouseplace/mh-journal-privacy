// ==UserScript==
// @name         🐭️ Mousehunt - Journal Privacy
// @version      1.0.1
// @description  Hides usernames from the journal entries on the journal page.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://brrad.com/mouse.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

((function () {
	'use strict';

	/**
	 * Add styles to the page.
	 *
	 * @param {string} styles The styles to add.
	 */
	const addStyles = (styles) => {
		const existingStyles = document.getElementById('mh-mouseplace-custom-styles');

		if (existingStyles) {
			existingStyles.innerHTML += styles;
			return;
		}

		const style = document.createElement('style');
		style.id = 'mh-mouseplace-custom-styles';
		style.innerHTML = styles;
		document.head.appendChild(style);
	};

	/**
	 * Do something when ajax requests are completed.
	 *
	 * @param {Function} callback    The callback to call when an ajax request is completed.
	 * @param {string}   url         The url to match. If not provided, all ajax requests will be matched.
	 * @param {boolean}  skipSuccess Skip the success check.
	 */
	const onAjaxRequest = (callback, url = null, skipSuccess = false) => {
		const req = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				if (this.responseText) {
					let response = {};
					try {
						response = JSON.parse(this.responseText);
					} catch (e) {
						return;
					}

					if (response.success || skipSuccess) {
						if (! url) {
							callback(response);
							return;
						}

						if (this.responseURL.indexOf(url) !== -1) {
							callback(response);
						}
					}
				}
			});
			req.apply(this, arguments);
		};
	};

	const applyClassToNames = () => {
		const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
		if (! entries) {
			return;
		}

		entries.forEach((entry) => {
			if (! entry || ! entry.textContent) {
				return;
			}

			// if entry matches a name, add class
			const match = entry.textContent.match(/(.*)( has joined the | has left the | used Rare Map Dust |, the map owner, has )/);
			if (match && match[ 1 ]) {
				// Wrap the match in a span.
				const span = document.createElement('span');
				span.classList.add('mh-journal-privacy-name');
				span.textContent = match[ 1 ];

				// Replace the match with the span.
				entry.innerHTML = entry.innerHTML.replace(match[ 1 ], span.outerHTML);
			}
		});
	};

	addStyles(`
		#journalContainer .entry:not(.badge) a[href*="profile.php"],
		#journalContainer .entry.socialGift .journaltext a,
		#journalContainer .relicHunter_complete > .journalbody > .journaltext > b:nth-child(6),
		#journalContainer .wanted_poster-complete > .journalbody > .journaltext > b:nth-child(8),
		#journalContainer .journal__hunter-name,
		.mh-journal-privacy-name {
			color: transparent;
		}

		#journalContainer .entry:not(.badge) a[href*="profile.php"]:hover,
		#journalContainer .entry:not(.badge) a[href*="profile.php"]:focus,
		#journalContainer .entry.socialGift .journaltext a:hover,
		#journalContainer .entry.socialGift .journaltext a:focus,
		#journalContainer .relicHunter_complete > .journalbody > .journaltext > b:nth-child(6):hover,
		#journalContainer .relicHunter_complete > .journalbody > .journaltext > b:nth-child(6):focus,
		#journalContainer .wanted_poster-complete > .journalbody > .journaltext > b:nth-child(8):hover,
		#journalContainer .wanted_poster-complete > .journalbody > .journaltext > b:nth-child(8):focus
		#journalContainer .journal__hunter-name:hover,
		#journalContainer .journal__hunter-name:focus,
		.mh-journal-privacy-name:hover,
		.mh-journal-privacy-name:focus {
			color: #3b5998;
		}
	`);

	onAjaxRequest(() => {
		applyClassToNames();
	}, 'managers/ajax/pages/journal.php');
})());
