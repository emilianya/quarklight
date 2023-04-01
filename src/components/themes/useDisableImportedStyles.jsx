import { useEffect } from 'react'

// https://gist.github.com/arniebradfo/dc1dcb0793108cfc4cfca8faf0cb15d3
// https://stackoverflow.com/questions/48047362/how-to-remove-imported-css-in-reactjs
// Black magic.

const switchableGlobalStyleSheets = []

export const createUseDisableImportedStyles = (
	immediatelyUnloadStyle = true
) => {
	let localStyleSheet
	return () => {
		useEffect(() => {

			// if there are no stylesheets, you did something wrong...
			if (document.styleSheets.length < 1) return

			// set the localStyleSheet if this is the first time this instance of this useEffect is called
			if (localStyleSheet == null) {
				localStyleSheet = document.styleSheets[document.styleSheets.length - 1]
				switchableGlobalStyleSheets.push(localStyleSheet)
			}

			// if we are switching StyleSheets, disable all switchableGlobalStyleSheets
			if (!immediatelyUnloadStyle) {
				switchableGlobalStyleSheets.forEach(styleSheet => styleSheet.disabled = true)
			}

			// enable our StyleSheet!
			localStyleSheet.disabled = false

			// if we are NOT switching StyleSheets, disable this StyleSheet when the component is unmounted
			if (immediatelyUnloadStyle) return () => {
				if (localStyleSheet != null) localStyleSheet.disabled = true
			}

		})
	}
}