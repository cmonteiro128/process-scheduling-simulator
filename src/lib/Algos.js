//Caluclates average turn-around times based on gant chart
//Params: Gant Chart object
//Returns: WT/TAT Times in
export function calcTAT(gantchart, processes) {
	//Lets zero out our TAT
	for (let i = 0; i < processes.length; i++) {
		processes[i].TAT = 0;
	}
	//First lets see how many processes we have
	let TotalProcesses = processes.length;
	//Lets go through each process and assign the time it ended at
	for (let i = 0; i < gantchart.length; i++) {
		if (i == 0) {
			gantchart[i].endTime = gantchart[i].runningTime;
		}
		else {
			gantchart[i].endTime =
				gantchart[i - 1].endTime + gantchart[i].runningTime;
		}
	}
	//For each process, lets find its final end time (TAT)
	for (let i = gantchart.length - 1; i >= 0; i--) {
		for (let j = 0; j < TotalProcesses; j++) {
			if (gantchart[i].pid == processes[j].pid && processes[j].TAT == 0) {
				processes[j].TAT = gantchart[i].endTime - processes[j].arrivalTime;
			}
		}
	}
	//Lets get the average
	let total = 0;
	for (let i = 0; i < processes.length; i++) {
		total += processes[i].TAT;
	}
	let averageTAT = total / processes.length;
	return averageTAT;
}

//Caluclates average wait time based on gant chart
//Params: Gant Chart object, original processes
//Returns: WT/TAT Times in object
export function calcWT(gantchart, processes) {
	//Get wait for each process. Easy!, just: Wt = tat - bt - at
	for (let i = 0; i < processes.length; i++) {
		processes[i].WT = processes[i].TAT - processes[i].burstTime;
	}
	//Lets get the average
	let total = 0;
	for (let i = 0; i < processes.length; i++) {
		total += processes[i].WT;
	}
	let averageWT = total / processes.length;
	return averageWT;
}

//Non-Preemptive
//First Come First Serve & Shortest Job First
//Params: Array of objects containg process information, ID of algo to run (1 = FCFS, 2 = SJF)
//Returns: Gant Chart object
export function nonpreemptive(processes, algoType) {
	let internalProcesses = JSON.parse(JSON.stringify(processes));
	let finished = false;
	let currentTime = 0;
	let gantchart = [];
	let currentGantBlock;
	let runningTime;
	let shortestJobDidRun = false;

	//Assign a remaining time to all processes
	for (let i = 0; i < internalProcesses.length; i++) {
		internalProcesses[i].remainingTime = internalProcesses[i].burstTime;
	}

	//Check if there's only 1 process and it arrives at 0
	if (internalProcesses.length == 1 && internalProcesses[0].arrivalTime == 0) {
		currentGantBlock = {
			runningTime: internalProcesses[0].burstTime,
			pid: internalProcesses[0].pid
		};
		console.log(currentGantBlock);
		gantchart.push(currentGantBlock);
		finished = true;
	}

	while (!finished) {
		//Let's iterate and make checks at every second
		shortestJobDidRun = false;

		//Sort processes
		if (algoType === 1)
			internalProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
		else if (algoType === 2)
			internalProcesses.sort((a, b) => a.burstTime - b.burstTime);

		//Start at first arrival/burst process, see if it arrived
		if (internalProcesses[0].arrivalTime <= currentTime) {
			runningTime = internalProcesses[0].remainingTime;
			currentGantBlock = {
				runningTime,
				pid: internalProcesses[0].pid
			};
			internalProcesses[0].remainingTime = 0;
			shortestJobDidRun = true;
			currentTime += runningTime;
		}

		//Not arrived? Let's check next available
		//Sort by arrival time
		if (shortestJobDidRun === false) {
			internalProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
			if (internalProcesses[0].arrivalTime <= currentTime) {
				runningTime = internalProcesses[0].remainingTime;
				currentGantBlock = {
					runningTime,
					pid: internalProcesses[0].pid
				};
				internalProcesses[0].remainingTime = 0;
				currentTime += runningTime;
			}
			else {
				//Shortest remaining and soonest available not arrived, lets idle
				runningTime = 1;
				currentGantBlock = {
					runningTime,
					pid: 'Idle'
				};
				currentTime++;
			}
		}

		//TEMP: append to gant chart, start over
		gantchart.push(currentGantBlock);

		//Check if any are empty
		for (let i = 0; i < internalProcesses.length; i++) {
			if (internalProcesses[i].remainingTime <= 0) {
				//Remove if empty
				internalProcesses.splice(i, 1);
			}
		}

		//Check if were done
		if (internalProcesses.length == 0) {
			finished = true;
		}
	}

	return mergeDuplicates(gantchart);
}

//Preemptive
//Shortest Remaining Time & Priority
//Params: Array of objects containg process information, ID of algo to run (1 = SRT, 2 = Priority)
//Returns: Gant Chart object
function preemptive(processes, algoType) {
	let internalProcesses = JSON.parse(JSON.stringify(processes));
	let finished = false;
	let currentTime = 0;
	let gantchart = [];
	let currentGantBlock;
	let runningTime = 0;
	let shortestJobDidRun;

	//Assign a remaining time to all processes
	for (let i = 0; i < internalProcesses.length; i++) {
		internalProcesses[i].remainingTime = internalProcesses[i].burstTime;
	}

	while (!finished) {
		runningTime = 0;
		shortestJobDidRun = false;

		//Let's iterate and make checks at every second
		//Sort processes
		if (algoType === 1)
			internalProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
		else if (algoType === 2)
			internalProcesses.sort((a, b) => a.priority - b.priority);

		//Start at first shortest/priority process, see if it arrived
		if (internalProcesses[0].arrivalTime <= currentTime) {
			runningTime++;
			currentGantBlock = {
				runningTime,
				pid: internalProcesses[0].pid
			};
			internalProcesses[0].remainingTime--;
			shortestJobDidRun = true;
		}

		//Not arrived? Let's check next available
		//Sort by arrival time
		if (shortestJobDidRun === false) {
			internalProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
			if (internalProcesses[0].arrivalTime <= currentTime) {
				runningTime++;
				currentGantBlock = {
					runningTime,
					pid: internalProcesses[0].pid
				};
				internalProcesses[0].remainingTime--;
			}
			else {
				//Shortest remaining and soonest available not arrived, lets idle
				runningTime++;
				currentGantBlock = {
					runningTime,
					pid: 'Idle'
				};
			}
		}

		//Increase time
		currentTime++;

		//append to gant chart, start over
		gantchart.push(currentGantBlock);

		//Check if any are empty
		for (let i = 0; i < internalProcesses.length; i++) {
			if (internalProcesses[i].remainingTime <= 0) {
				//Remove if empty
				internalProcesses.splice(i, 1);
			}
		}

		//Check if were done
		if (internalProcesses.length == 0) {
			finished = true;
		}
	}

	return mergeDuplicates(gantchart);
}

//Round Robin
//Fixed and Variable
//Params: Array of objects containg process information, ID of algo to run (1 = Fixed, 2 = Variable)
//Returns: Gant Chart object
function roundrobin(processes, algoType, quantum) {
	let internalProcesses = JSON.parse(JSON.stringify(processes));
	let finished = false;
	let currentTime = 0;
	let gantchart = [];
	let currentGantBlock;
	parseInt(quantum, 10);
	console.log(quantum);
	//Assign a remaining time to all processes
	for (let i = 0; i < internalProcesses.length; i++) {
		internalProcesses[i].remainingTime = internalProcesses[i].burstTime;
	}

	//We will iterate for every quantum time
	while (!finished) {
		let arriveLoop = false;

		//See if the first process in our queue has arrived
		if (internalProcesses[0].arrivalTime <= currentTime) {
			//Check if value is equal to or more than the quantum
			if (internalProcesses[0].remainingTime >= quantum) {
				//It will fill whole quantum
				currentGantBlock = {
					runningTime: parseInt(quantum, 10),
					pid: internalProcesses[0].pid
				};
				gantchart.push(currentGantBlock);
				internalProcesses[0].remainingTime -= parseInt(quantum, 10);
				//If it finished, remove it
				if (internalProcesses[0].remainingTime <= 0)
					internalProcesses.splice(0, 1);
				else {
					//Move to back of queue
					internalProcesses.push(internalProcesses[0]);
					internalProcesses.shift();
				}
				currentTime += parseInt(quantum, 10);
			}
			else {
				//Wont occupy the whole quantum (Finish process and shift it off)
				currentGantBlock = {
					runningTime: internalProcesses[0].remainingTime,
					pid: internalProcesses[0].pid
				};
				gantchart.push(currentGantBlock);
				if (algoType == 1) {
					//Fixed
					//Push Idle for the rest of the quantum
					currentGantBlock = {
						runningTime:
							parseInt(quantum, 10) - internalProcesses[0].remainingTime,
						pid: 'Idle'
					};
					gantchart.push(currentGantBlock);
					currentTime += parseInt(quantum, 10);
				}
				else if (algoType == 2) {
					//Variable
					//No Idle here
					currentTime += internalProcesses[0].remainingTime;
				}
				internalProcesses.shift();
			}
		}
		else {
			//First process is not arrived, loop through to find one that has
			let loopCheck = 0;
			while (arriveLoop == false) {
				//If this if runs, it means nothing is arrived, so we add idle time
				if (loopCheck == internalProcesses.length) {
					if (algoType == 1) {
						//For fixed RR, we want idle to fill the quantum
						currentGantBlock = {
							runningTime: parseInt(quantum, 10),
							pid: 'Idle'
						};
						gantchart.push(currentGantBlock);
						currentTime += parseInt(quantum, 10);
						break;
					}
					else if (algoType == 2) {
						//For variable we want it to be only 1 and check repeatedly
						currentGantBlock = {
							runningTime: 1,
							pid: 'Idle'
						};
						gantchart.push(currentGantBlock);
						currentTime++;
						break;
					}
				}
				if (internalProcesses[loopCheck].arrivalTime <= currentTime) {
					//This is arrived, move it to front
					internalProcesses.unshift(internalProcesses[loopCheck]); //Push value to front of array
					internalProcesses.splice(loopCheck + 1, 1); //Splice out old value
					arriveLoop = true;
				}
				loopCheck++;
			}
		}
		//Check if were done
		if (internalProcesses.length == 0) {
			finished = true;
		}
	}
	if (gantchart[gantchart.length - 1].pid == 'Idle') {
		gantchart.splice(gantchart.length - 1, 1);
		console.log("test");
	}
	return mergeDuplicates(gantchart);
}

function mergeDuplicates(gantchart) {
	let newGantchart = [];
	let count = 0;

	//If length is 1, we dont need this function
	if (gantchart.length == 1) return gantchart;

	for (let i = 0; i < gantchart.length; i++) {
		//Add until i changes

		//Initial i
		if (i == 0) {
			count = gantchart[i].runningTime;
		}

		//If bigger than 0 and size of previous
		if (i > 0 && gantchart[i].pid == gantchart[i - 1].pid) {
			count += gantchart[i].runningTime;
		}
		//i changed
		if (
			(i > 0 && gantchart[i].pid != gantchart[i - 1].pid) ||
			gantchart.length == 0
		) {
			newGantchart.push({
				runningTime: count,
				pid: gantchart[i - 1].pid
			});
			count = gantchart[i].runningTime; //Reset count
		}

		if (i > 0 && i == gantchart.length - 1) {
			newGantchart.push({
				runningTime: count,
				pid: gantchart[i].pid
			});
		}
	}
	return newGantchart;
}

//Execute Algorithms based on input from state
//Params: Algo ID (See Below), array of objects containg process info
//Returns: Gant Chart + WT/TAT Times
//FCFS = 0;
//SJF = 1;
//SRT = 2;
//Prioirty = 3;
//RRFixed = 4;
//RRVaribale = 5;
export function executeAlgo(algoID, processes, quantum) {
	let gant;
	switch (algoID) {
		case 0:
			gant = nonpreemptive(processes, 1);
			break;
		case 1:
			gant = nonpreemptive(processes, 2);
			break;
		case 2:
			gant = preemptive(processes, 1);
			break;
		case 3:
			gant = preemptive(processes, 2);
			break;
		case 4:
			gant = roundrobin(processes, 1, quantum);
			break;
		case 5:
			gant = roundrobin(processes, 2, quantum);
			break;
	}
	return gant;
}
