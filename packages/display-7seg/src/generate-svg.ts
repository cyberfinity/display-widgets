import { SevenSegParts } from "./controller.js";

const svgNS = "http://www.w3.org/2000/svg";

export interface SegmentParameters {
	x: number;
	y: number;
	width: number;
	height: number;
	offset: number;
}

export function createVerticalSegment({
	x,
	y,
	width,
	height,
	offset,
}: SegmentParameters): SVGPolygonElement {
	const segment = document.createElementNS(svgNS, "polygon");
	const points = [];
	points.push([x + width / 2, y]);
	points.push([x + width, y + offset]);
	points.push([x + width, y + height - offset]);
	points.push([x + width / 2, y + height]);
	points.push([x, y + height - offset]);
	points.push([x, y + offset]);
	segment.setAttribute(
		"points",
		points.map((point) => point.join(",")).join(" "),
	);
	return segment;
}

export function createHorizontalSegment({
	x,
	y,
	width,
	height,
	offset,
}: SegmentParameters): SVGPolygonElement {
	const segment = document.createElementNS(svgNS, "polygon");
	const points = [];
	points.push([x, y + height / 2]);
	points.push([x + offset, y]);
	points.push([x + width - offset, y]);
	points.push([x + width, y + height / 2]);
	points.push([x + width - offset, y + height]);
	points.push([x + offset, y + height]);
	segment.setAttribute(
		"points",
		points.map((point) => point.join(",")).join(" "),
	);
	return segment;
}

export interface DpParameters {
	x: number;
	y: number;
	diameter: number;
}

export function createDp({ x, y, diameter }: DpParameters): SVGCircleElement {
	const radius = diameter / 2;
	const circle = document.createElementNS(svgNS, "circle");
	circle.setAttribute("cx", (x + radius).toString());
	circle.setAttribute("cy", (y + radius).toString());
	circle.setAttribute("r", radius.toString());
	return circle;
}

interface SevenSegmentSizes {
	horizontalSegment: {
		width: number;
		height: number;
	};

	verticalSegment: {
		width: number;
		height: number;
	};

	dp: {
		diameter: number;
		nudgeX: number;
		nudgeY: number;
	};

	gap: number;

	digitSkewDistance: number;
}

export function createSevenSegmentSvg({
	horizontalSegment,
	verticalSegment,
	dp: dpParams,
	gap,
	digitSkewDistance,
}: SevenSegmentSizes): {
	svg: SVGElement;
	parts: SevenSegParts;
} {
	const viewBoxWidth =
		horizontalSegment.width +
		verticalSegment.width +
		dpParams.nudgeX +
		Math.abs(digitSkewDistance) +
		gap * 2 +
		dpParams.diameter;
	const viewBoxHeight =
		verticalSegment.height * 2 +
		dpParams.nudgeY +
		gap * 4 +
		Math.max(horizontalSegment.height, dpParams.diameter);

	const svgElement = document.createElementNS(svgNS, "svg");
	svgElement.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
	svgElement.setAttribute("width", viewBoxWidth.toString());
	svgElement.setAttribute("height", viewBoxHeight.toString());

	const digit = document.createElementNS(svgNS, "g");

	const a = createHorizontalSegment({
		x: verticalSegment.width / 2 + gap,
		y: 0,
		width: horizontalSegment.width,
		height: horizontalSegment.height,
		offset: verticalSegment.width / 2,
	});
	digit.appendChild(a);

	const b = createVerticalSegment({
		x: horizontalSegment.width + gap * 2,
		y: horizontalSegment.height / 2 + gap,
		width: verticalSegment.width,
		height: verticalSegment.height,
		offset: horizontalSegment.height / 2,
	});
	digit.appendChild(b);

	const c = createVerticalSegment({
		x: horizontalSegment.width + gap * 2,
		y: verticalSegment.height + horizontalSegment.height / 2 + gap * 3,
		width: verticalSegment.width,
		height: verticalSegment.height,
		offset: horizontalSegment.height / 2,
	});
	digit.appendChild(c);

	const d = createHorizontalSegment({
		x: verticalSegment.width / 2 + gap,
		y: verticalSegment.height * 2 + gap * 4,
		width: horizontalSegment.width,
		height: horizontalSegment.height,
		offset: verticalSegment.width / 2,
	});
	digit.appendChild(d);

	const e = createVerticalSegment({
		x: 0,
		y: verticalSegment.height + horizontalSegment.height / 2 + gap * 3,
		width: verticalSegment.width,
		height: verticalSegment.height,
		offset: horizontalSegment.height / 2,
	});
	digit.appendChild(e);

	const f = createVerticalSegment({
		x: 0,
		y: horizontalSegment.height / 2 + gap,
		width: verticalSegment.width,
		height: verticalSegment.height,
		offset: horizontalSegment.height / 2,
	});
	digit.appendChild(f);

	const g = createHorizontalSegment({
		x: verticalSegment.width / 2 + gap,
		y: verticalSegment.height + gap * 2,
		width: horizontalSegment.width,
		height: horizontalSegment.height,
		offset: verticalSegment.width / 2,
	});
	digit.appendChild(g);

	const digitHeight =
		verticalSegment.height * 2 + gap * 4 + horizontalSegment.height;
	const skewAngle =
		(Math.asin(digitSkewDistance / digitHeight) * 180) / Math.PI;
	digit.setAttribute(
		"transform",
		`skewX(${skewAngle}), translate(${Math.max(0, -1 * digitSkewDistance)})`,
	);

	svgElement.appendChild(digit);

	const dp = createDp({
		x:
			horizontalSegment.width +
			verticalSegment.width +
			Math.abs(digitSkewDistance) +
			dpParams.nudgeX +
			gap * 2,
		y: verticalSegment.height * 2 + dpParams.nudgeY + gap * 4,
		diameter: dpParams.diameter,
	});
	svgElement.appendChild(dp);

	return {
		svg: svgElement,
		parts: {
			a,
			b,
			c,
			d,
			e,
			f,
			g,
			dp,
		},
	};
}
