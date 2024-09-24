export interface DisplayController {
	/**
	 * Turn on all parts of the display.
	 */
	on(): void;

	/**
	 * Turn off all parts of the display
	 */
	off(): void;
}

export interface SevenSegParts {
	a: SVGElement;
	b: SVGElement;
	c: SVGElement;
	d: SVGElement;
	e: SVGElement;
	f: SVGElement;
	g: SVGElement;
	dp?: SVGElement;
}

export type SegmentName = keyof SevenSegParts;

export const segments: SegmentName[] = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"dp",
] as const;

export const digits = [
	//abcdefgD
	0b11111100, // 0
	0b01100000, // 1
	0b11011010, // 2
	0b11110010, // 3
	0b01100110, // 4
	0b10110110, // 5
	0b10111110, // 6
	0b11100000, // 7
	0b11111110, // 8
	0b11110110, // 9
] as const;

export const ALL_ON = 255;
export const ALL_OFF = 0;

export class SevenSegController implements DisplayController {
	#parts: SevenSegParts;
	#onClass: string;
	#offClass: string;

	constructor(
		parts: SevenSegParts,
		onClass: string = "seven-seg--on",
		offClass: string = "seven-seg--off",
	) {
		this.#parts = parts;
		this.#onClass = onClass;
		this.#offClass = offClass;
	}

	setDigit(digit: number): void {
		this.setSegments(digits[digit % 10]!);
	}

	/**
	 * Set the on/off state of all segments at
	 * once.
	 *
	 * The input is an 'abcdefgDP'-encoded
	 * number.
	 *
	 * The least significant 8 bits represent
	 * the various segments. 1 means the segment
	 * is on, 0 means it is off.
	 *
	 * For example, to switch on only the 'a'
	 * segment, pass in 0b10000000 (128 in
	 * decimal:
	 *
	 * | a | b | c | d | e | f | g | dp |
	 * |---|---|---|---|---|---|---|----|
	 * | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0  |
	 */
	setSegments(encoded: number): void {
		/*
			Iterate over each segment a do a bitwise
			AND with a mask for that segment's bit to
			determine if it should be on or off.

			Start with mask for the 'a' segment as it
			has the highest value. Then do a right shift
			by 1 on the mask on each iteration to get
			the mask for the next segment:

			| segment | i | bitmask    |
			|---------|---|------------|
			| 'a'     | 0 | 0b10000000 |
			| 'b'     | 1 | 0b01000000 |
			| 'c'     | 2 | 0b00100000 |
			...and so on.
		*/
		let bitmask = 0b10000000;
		for (let i = 0; i < segments.length; ++i) {
			this._setPart(this.#parts[segments[i]!], (bitmask & encoded) > 0);
			bitmask = bitmask >>> 1;
		}
	}

	on(): void {
		this.setSegments(ALL_ON);
	}

	off(): void {
		this.setSegments(ALL_OFF);
	}

	private _setPart(part: SVGElement | undefined, on: boolean): void {
		if (part !== undefined) {
			part.classList.toggle(this.#onClass, on);
			part.classList.toggle(this.#offClass, !on);
		}
	}
}
