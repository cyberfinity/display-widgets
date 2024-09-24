import { createSevenSegmentSvg, SevenSegController } from "../src/index";

const generated = createSevenSegmentSvg({
	horizontalSegment: {
		width: 6,
		height: 2,
	},
	verticalSegment: {
		width: 2,
		height: 7,
	},
	dp: {
		diameter: 2,
		nudgeX: -1,
		nudgeY: 0,
	},
	gap: 0.25,
	digitSkewDistance: -2,
});

const controller = new SevenSegController(generated.parts);
controller.off();

window["sevenSeg"] = controller;

document.body.appendChild(generated.svg);

function clamp(input: number, min: number, max: number): number {
	return Math.min(max, Math.max(input, min));
}

async function count(
	controller: SevenSegController,
	from: number,
	to: number,
	delay: number = 300,
): Promise<void> {
	const clampedFrom = clamp(from, 0, 9);
	const clampedTo = clamp(to, 0, 9);
	const step = from < to ? 1 : -1;
	let current = clampedFrom;
	return new Promise<void>(function (resolve) {
		const intervalId = setInterval(() => {
			controller.setDigit(current);
			if (current === clampedTo) {
				// stop counting
				clearInterval(intervalId);
				resolve();
			} else {
				current = current + step;
			}
		}, delay);
	});
}

async function randomSegments(
	controller: SevenSegController,
	duration: number,
	delay: number = 100,
): Promise<void> {
	return new Promise<void>(function (resolve) {
		const intervalId = setInterval(() => {
			controller.setSegments(Math.floor(Math.random() * 256));
		}, delay);
		setTimeout(() => {
			clearInterval(intervalId);
			resolve();
		}, duration);
	});
}

async function randomDigits(
	controller: SevenSegController,
	duration: number,
	delay: number = 100,
): Promise<void> {
	return new Promise<void>(function (resolve) {
		const intervalId = setInterval(() => {
			controller.setDigit(Math.floor(Math.random() * 10));
		}, delay);
		setTimeout(() => {
			clearInterval(intervalId);
			resolve();
		}, duration);
	});
}

while (true) {
	await count(controller, 9, 0);
	await randomSegments(controller, 4000);
	await count(controller, 0, 9);
	await randomDigits(controller, 2000);
}
