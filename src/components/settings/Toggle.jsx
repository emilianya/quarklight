export default function Toggle (props) {
	if (typeof props.checked === "undefined" || typeof props.setChecked === "undefined") return <>Toggle missing required props</>
	let checked = props.checked;
	let onChange = props.onChange;
	let setChecked = props.setChecked;

	return (
		<div className={checked ? "toggle toggle-checked" : "toggle"} onClick={() => {
			setChecked(p => !p);
			if (onChange) onChange({newValue: checked, oldValue: !checked});
		}}>
			<div className={checked ? "toggle-ball toggle-ball-checked" : "toggle-ball"} >

			</div>
		</div>
	);
}