import { h, Component } from 'preact';
import { executeAlgo, calcWT, calcTAT } from '../../lib/Algos';

import ProcessInput from '../../components/ProcessInput';

import Textfield from 'preact-material-components/Textfield';
import 'preact-material-components/Textfield/style.css';

import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';

import Select from 'preact-material-components/Select';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';

import LayoutGrid from 'preact-material-components/LayoutGrid';
import 'preact-material-components/LayoutGrid/style.css';

import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';

import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';

import style from './style';

function getByValue(arr, value) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].pid == value) {
			return i;
		}
	}
}

export default class Home extends Component {
	handleTotalProcesses(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		this.setState({
			[name]: value
		});

		if (name === 'numberOfProcesses') {
			let processArray = [];
			for (let i = 0; i < value; i++) {
				const singleObject = {
					pid: i + 1,
					arrivalTime: null,
					burstTime: null,
					priority: null
				};
				processArray.push(singleObject);
			}
			this.setState({
				processes: processArray
			});
		}
	}

	handleProcessInfo(event, type) {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		//Lookup by PID
		const arrayLocation = getByValue(this.state.processes, name);
		let tempArray = this.state.processes;
		switch (type) {
			//Burst Time
			case 1:
				tempArray[arrayLocation].arrivalTime = parseInt(value, 10);
				break;
			case 2:
				tempArray[arrayLocation].burstTime = parseInt(value, 10);
				break;
			case 3:
				tempArray[arrayLocation].priority = parseInt(value, 10);
				break;
		}
		this.setState({
			processes: tempArray
		});
	}

	handleInputChangeSelect = e => {
		this.setState({
			selectedAlgo: e.selectedIndex
		});
		if (e.selectedIndex == 3) {
			this.setState({
				isPriority: true
			});
		}
		else {
			this.setState({
				isPriority: false
			});
		}
	};

	updateCanvas() {
		const ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, 1200, 70);
		let startPosition = 5;
		let prevRectTime = 0;
		//Print the zero
		ctx.fillText(0, 3, 57);
		for (let i = 0; i < this.state.gantchart.length; i++) {
			(i => {
				window.setTimeout(() => {
					let currentRectTime = this.state.gantchart[i].runningTime;
					if (i != 0) prevRectTime = this.state.gantchart[i - 1].endTime;
					let currentEndTime = this.state.gantchart[i].endTime;
					let currentPid = this.state.gantchart[i].pid;
					ctx.font = '12px Roboto';
					ctx.strokeRect(startPosition, 20, currentRectTime * 11, 25);
					ctx.fillText(
						currentPid,
						currentRectTime * 11 / 2 + prevRectTime * 11,
						35
					);
					ctx.fillText(
						currentEndTime,
						currentRectTime * 11 + prevRectTime * 11,
						57
					);
					startPosition += currentRectTime * 11;
				}, i * 1000);
			})(i);
		}

		/*let canvas = document.getElementById('canvas');
		this.setState({
			canvasImage: canvas.toDataURL('image/png')
		});*/
	}

	simulate() {
		if (this.state.quantum == 0) {
			this.bar.MDComponent.show({
				message: 'Quantum cannot be 0!'
			});
		}
		else {
			this.setState({
				gantchart: executeAlgo(
					this.state.selectedAlgo,
					this.state.processes,
					this.state.quantum
				)
			});
			this.setState({
				averageTAT: calcTAT(this.state.gantchart, this.state.processes), //We calc TAT first so we can use it for arrival time
				averageWt: calcWT(this.state.gantchart, this.state.processes)
			});
			this.updateCanvas();
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			numberOfProcesses: '',
			selectedAlgo: '-1',
			processes: [
				{
					pid: '',
					arrivalTime: null,
					burstTime: null,
					priority: null
				}
			],
			quantum: 1, //Default if blank
			gantchart: '',
			averageWt: null,
			averageTAT: null,
			canvasImage: '',
			showCanvas: false,
			isPriority: false
		};

		this.handleTotalProcesses = this.handleTotalProcesses.bind(this);
		this.handleInputChangeSelect = this.handleInputChangeSelect.bind(this);
		this.handleProcessInfo = this.handleProcessInfo.bind(this);
		this.simulate = this.simulate.bind(this);
		this.updateCanvas = this.updateCanvas.bind(this);
	}

	componentDidUpdate() {
		//document.getElementById('canvas').style.display = 'none';

		//Our select menu keeps changing value, lets fix it directly
		if (this.state.selectedAlgo != -1)
			document.getElementById(
				'selectMenu'
			).childNodes[0].textContent = this.presel.props.children[
				this.state.selectedAlgo
			].children[0];
	}

	render() {
		let processInputs = [];
		for (let i = 0; i < this.state.numberOfProcesses; i++) {
			processInputs.push(
				<ProcessInput
					isPriority={this.state.isPriority}
					value={this.state.processes[i]}
					textHandle={this.handleProcessInfo}
					num={i}
					key={i}
				/>
			);
		}

		return (
			<div class={style.home}>
				<LayoutGrid>
					<LayoutGrid.Inner>
						<LayoutGrid.Cell desktopCols="5" tabletCols="4" phoneCols="4">
							<Card>
								<Card.Primary>
									<Card.Title>Welcome</Card.Title>
									<Card.Subtitle>
										To begin, please enter the total number of processes you
										would like to simulate. You may then choose an algorithm,
										and enter the appropirate process information. When
										finished, press the simulate button.
									</Card.Subtitle>
									<br />
									<Card.Subtitle>
										If arrival time is left blank for any process, it will
										default to 0. If quantum is left blank for RR, it will
										default to 1.
									</Card.Subtitle>

									<br />
									<Card.Subtitle>
										Note: There are currently some UI bugs. If you experiece
										some issues with the text fields, just refresh the page.
									</Card.Subtitle>
									<br />
									<Card.Subtitle>Author: Chris Monteiro</Card.Subtitle>
								</Card.Primary>
							</Card>
						</LayoutGrid.Cell>
					</LayoutGrid.Inner>
					<LayoutGrid.Inner>
						<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
							<div
								id={style.processText}
								class="label mdc-typography--subheading2"
							>
								Please enter number of processes
							</div>
						</LayoutGrid.Cell>
						<LayoutGrid.Cell cols="5">
							<Textfield
								name="numberOfProcesses"
								value={this.state.numberOfProcesses}
								onChange={this.handleTotalProcesses}
								isPriority={this.state.isPriority}
								type="number"
								label="Processes"
							/>
						</LayoutGrid.Cell>
					</LayoutGrid.Inner>
					{this.state.numberOfProcesses
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
								<div class="label mdc-typography--subheading2" id="simulate">
										Please Select an Algorithm to Simulate
								</div>
							</LayoutGrid.Cell>
							<LayoutGrid.Cell cols="5">
								<Select
									name="selectedAlgo"
									id="selectMenu"
									ref={presel => {
										this.presel = presel;
									}}
									selectedIndex={this.state.selectedAlgo}
									onChange={this.handleInputChangeSelect}
								>
									<Select.Item>First Come First Serve</Select.Item>
									<Select.Item>Shortest Job First</Select.Item>
									<Select.Item>Shortest Remaining Time</Select.Item>
									<Select.Item>Priority</Select.Item>
									<Select.Item>Round Robin - Fixed</Select.Item>
									<Select.Item>Round Robin - Variable</Select.Item>
								</Select>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null}
					{this.state.selectedAlgo == 4 || this.state.selectedAlgo == 5
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
								<div
									id={style.quantumText}
									class="label mdc-typography--subheading2"
								>
										Quantum
								</div>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null}
					{this.state.selectedAlgo == 4 || this.state.selectedAlgo == 5
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell cols="2">
								<Textfield
									name="quantum"
									//value={this.state.quantum}
									onChange={this.handleTotalProcesses}
									type="number"
									min="1"
									label="Quantum"
								/>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null}
					{this.state.selectedAlgo != -1
						? <LayoutGrid.Inner>
							{processInputs}
						</LayoutGrid.Inner>
						: null}
					{/*this.state.selectedAlgo != -1
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
								<div>
									{JSON.stringify(this.state.gantchart)}
								</div>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null*/}
					{this.state.selectedAlgo != -1
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
								<Button
									id={style.simulate}
									onclick={this.simulate}
									ripple
									raised
									primary
								>
										Simulate
								</Button>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null}
					<LayoutGrid.Inner>
						<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
							{this.state.showCanvas != false
								? <div id={style.quantumText}>Gant Chart</div>
								: null}
							<div>
								<canvas
									ref={canvas => {
										this.canvas = canvas;
									}}
									width={1200}
									height={70}
									id="canvas"
								/>
								{/*<img src={this.state.canvasImage} />*/}
							</div>
						</LayoutGrid.Cell>
					</LayoutGrid.Inner>
					{this.state.averageTAT != 0 && this.state.averageTAT != null
						? <LayoutGrid.Inner>
							<LayoutGrid.Cell desktopCols="3" tabletCols="4" phoneCols="4">
								<div id={style.quantumText}>Average Wait Time</div>
								<div>
									{this.state.averageWt}
								</div>
								<div id={style.quantumText}>Average Turn Around Time</div>
								<div>
									{this.state.averageTAT}
								</div>
							</LayoutGrid.Cell>
						</LayoutGrid.Inner>
						: null}
				</LayoutGrid>
				<Snackbar
					ref={bar => {
						this.bar = bar;
					}}
				/>
			</div>
		);
	}
}
