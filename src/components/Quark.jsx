export function Quark(props) {
	let quark = props.quark;
	return (
			<img onClick={() => props.setSelectedQuark(quark._id)} width={"48px"} height={"48px"} src={quark.iconUri} alt={quark.name} className="quarkImage quarkBox" />
	);
}