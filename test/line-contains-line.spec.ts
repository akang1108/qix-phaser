import { expect } from 'chai';
import 'mocha';
// import 'jsdom-global/register';
// import Phaser from 'phaser';
// import {GeomUtils} from "../src/utils/geom-utils";
// import Line = Phaser.Geom.Line;

//
// Can't seem to get this unit test working with GeomUtils and the Phaser dependencies
//
describe('line contains line function', () => {
    it('should work', () => {
        const testDatas = new TestDatas([
            // Horizontal Tests
            new TestData(new Line(1, 1, 5, 1), new Line(1, 1, 2, 1), true),
            new TestData(new Line(1, 1, 5, 1), new Line(3, 1, 5, 1), true),
            new TestData(new Line(1, 1, 5, 1), new Line(1, 1, 5, 1), true),
            new TestData(new Line(1, 1, 5, 1), new Line(1, 1, 6, 1), false),
            new TestData(new Line(1, 1, 5, 1), new Line(0, 1, 5, 1), false),
            new TestData(new Line(1, 1, 5, 1), new Line(6, 1, 7, 1), false),
            new TestData(new Line(5, 1, 1, 1), new Line(1, 1, 2, 1), true),
            new TestData(new Line(5, 1, 1, 1), new Line(2, 1, 1, 1), true),

            // Vertical Tests
            new TestData(new Line(1, 1, 1, 5), new Line(1, 1, 1, 2), true),
            new TestData(new Line(1, 1, 1, 5), new Line(1, 3, 1, 5), true),
            new TestData(new Line(1, 1, 1, 5), new Line(1, 1, 1, 5), true),
            new TestData(new Line(1, 1, 1, 5), new Line(1, 1, 1, 6), false),
            new TestData(new Line(1, 1, 1, 5), new Line(1, 0, 1, 5), false),
            new TestData(new Line(1, 1, 1, 5), new Line(1, 6, 1, 7), false),
            new TestData(new Line(1, 5, 1, 1), new Line(1, 1, 1, 2), true),
            new TestData(new Line(1, 5, 1, 1), new Line(1, 2, 1, 1), true),

            // Additional false tests
            new TestData(new Line(1, 2, 3, 1), new Line(1, 2, 3, 1), false),
        ]);

        testDatas.data.forEach((data) => {
            const contains = lineContainsLine(data.line1, data.line2);
            expect(contains).to.equal(data.expectedResult, `${data}`);
        });
    });
});

class TestDatas {
    data: TestData[];

    constructor(data: TestData[]) {
        this.data = data;
    }
}

class TestData {
    line1: Line;
    line2: Line;
    expectedResult: boolean;

    constructor(line1: Line, line2: Line, expectedResult: boolean) {
        this.line1 = line1;
        this.line2 = line2;
        this.expectedResult = expectedResult;
    }

    public toString = () : string => {
        return `line1: (${this.line1}), line2: (${this.line2}, expectedResult: ${this.expectedResult})`;
    }
}

class Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    public toString = () : string => {
        return `x1: ${this.x1}, y1: ${this.y1}, x2: ${this.x2}, y2: ${this.y2}`;
    }
}

/**
 * Only support horizontal and vertical lines
 *
 * @param {Line} line1
 * @param {Line} line2
 * @returns {boolean}
 */
function lineContainsLine(line1: Line, line2: Line): boolean {
    // Vertical
    if (line1.x1 === line1.x2 && line1.x1 === line2.x1 && line1.x1 === line2.x2) {
        const line1Small = smaller(line1.y1, line1.y2);
        const line1Large = larger(line1.y1, line1.y2);
        const line2Small = smaller(line2.y1, line2.y2);
        const line2Large = larger(line2.y1, line2.y2);

        return (line2Small >= line1Small && line2Large <= line1Large);
    }

    // Horizontal
    if (line1.y1 === line1.y2 && line1.y1 === line2.y1 && line1.y1 === line2.y2) {
        const line1Small = smaller(line1.x1, line1.x2);
        const line1Large = larger(line1.x1, line1.x2);
        const line2Small = smaller(line2.x1, line2.x2);
        const line2Large = larger(line2.x1, line2.x2);

        return (line2Small >= line1Small && line2Large <= line1Large);
    }

    function smaller(num1: number, num2: number) {
        return Math.min(num1, num2);
    }

    function larger(num1: number, num2: number) {
        return Math.max(num1, num2);
    }

    return false;
}


