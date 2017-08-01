import { h } from 'preact';
import LayoutGrid from 'preact-material-components/LayoutGrid';
import Textfield from 'preact-material-components/Textfield';

const processLabel = {
	fontWeight: 'bold'
}

const ProcessInput = props => {
	const numDisplay = props.num + 1;
	return (
		<LayoutGrid.Cell cols="2">
			<div style={processLabel} class="mdc-typography--subheading1 processLabel">
				Process {numDisplay}
			</div>
			<Textfield value={props.value.arrivalTime} name={numDisplay} onChange={(e) => props.textHandle(e, 1)} type="number" label="Arrival Time" />
			<Textfield value={props.value.burstTime} name={numDisplay} onChange={(e) => props.textHandle(e, 2)} type="number" label="Burst Time" />
			<Textfield value={props.value.priority} name={numDisplay} onChange={(e) => props.textHandle(e, 3)} type="number" label="Priority" />
		</LayoutGrid.Cell>
	);
};

export default ProcessInput;
