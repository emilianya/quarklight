import { Tooltip } from 'react-tooltip'
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';

export function Quark(props) {
	let quark = props.quark;
	const { show } = useContextMenu({
		id: `${quark._id}_menu`,
	});

	function handleContextMenu(event){
		show({
			event,
			props: {
				key: 'value'
			}
		})
	}

	return (
		<>
			<img onContextMenu={handleContextMenu} id={quark._id} data-tooltip-content={quark.name} onClick={() => props.setSelectedQuark(quark._id)} width={"48px"} height={"48px"} src={quark.iconUri} alt={quark.name} className="quarkImage quarkBox" />
			<Tooltip className="quarkTip" anchorId={quark._id} positionStrategy={"fixed"} place={"left"} style={{opacity: 1, backgroundColor: "var(--tooltip)"}} />
			<Menu id={`${quark._id}_menu`} className="quarkMenu" theme={"dark"}>
				<Item disabled={true}><span>{quark.name}</span></Item>
				<Separator />
				<Item onClick={() => {}} className="leaveButton">Leave</Item>
				<Item onClick={() => navigator.clipboard.writeText(quark._id)}>Copy ID</Item>
			</Menu>
		</>
	);
}