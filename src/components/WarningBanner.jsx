import {useContext} from "react";
import {MainContext} from "../contexts/MainContext";
import {
	faCircleExclamation,
	faCircleInfo,
	faRadiation,
	faTriangleExclamation,
	faX
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const WarningSeverity = {
	INFO: faCircleInfo,
	NORMAL: faCircleExclamation,
	WARNING: faTriangleExclamation,
	NUCLEAR: faRadiation
}

const SeverityKeys = Object.keys(WarningSeverity);

export const WarningBanner = () => {
	let mainContext = useContext(MainContext)

	return mainContext.warning ? (
		<div className={mainContext.warning.onClick ? "warningBanner clickable" : "warningBanner"} style={{backgroundColor: mainContext.warning.severityColor}} onClick={() => {

			if (mainContext.warning.onClick) mainContext.warning.onClick();
			if (!mainContext.warning.dontDismissOnClick) mainContext.setWarning(null);
		}}>
			{SeverityKeys.includes(mainContext.warning.severity) && (
				<FontAwesomeIcon className="warningBannerIcon" icon={WarningSeverity[mainContext.warning.severity]} />
			)}
			<span>{mainContext.warning.message}</span>
			{!mainContext.warning.onClick && <FontAwesomeIcon icon={faX} className="warningBannerClose" onClick={() => {
				mainContext.setWarning(null)
			}}/>}
		</div>
	) : null;
}