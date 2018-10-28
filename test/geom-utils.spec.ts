import { expect } from 'chai';
import 'mocha';
import {GeomUtils} from "../src/utils/geom-utils";
import * as Phaser from 'phaser';
import Line = Phaser.Geom.Line;
import Rectangle = Phaser.Geom.Rectangle;
import {ExtRectangle} from "../src/objects/ext-rectangle";

describe('line contains line function', () => {
    it('should work', () => {
        const testInfos = new TestInfos([
            new TestInfo([new Line(1, 1, 5, 1), new Line(1, 1, 2, 1)], true, 'horizontal test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(3, 1, 5, 1)], true, 'horizontal test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(1, 1, 5, 1)], true, 'horizontal test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(1, 1, 6, 1)], false, 'horizontal test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(0, 1, 5, 1)], false, 'horizontal test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(6, 1, 7, 1)], false, 'horizontal test'),
            new TestInfo([new Line(5, 1, 1, 1), new Line(1, 1, 2, 1)], true, 'horizontal test'),
            new TestInfo([new Line(5, 1, 1, 1), new Line(2, 1, 1, 1)], true, 'horizontal test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 1, 1, 2)], true, 'vertical test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 3, 1, 5)], true, 'vertical test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 1, 1, 5)], true, 'vertical test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 1, 1, 6)], false, 'vertical test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 0, 1, 5)], false, 'vertical test'),
            new TestInfo([new Line(1, 1, 1, 5), new Line(1, 6, 1, 7)], false, 'vertical test'),
            new TestInfo([new Line(1, 5, 1, 1), new Line(1, 1, 1, 2)], true, 'vertical test'),
            new TestInfo([new Line(1, 5, 1, 1), new Line(1, 2, 1, 1)], true, 'vertical test'),
            new TestInfo([new Line(1, 2, 3, 1), new Line(1, 2, 3, 1)], true, 'equivalence test')
        ]);

        testInfos.tests.forEach((test) => {
            console.info(`    ${test.title} ${GeomUtils.lineToString(test.data[0])} ${GeomUtils.lineToString(test.data[1])} ${test.expectedResult}`);

            const contains = GeomUtils.lineContainsLine(test.data[0], test.data[1]);
            expect(contains).to.equal(test.expectedResult, `${test}`);
        });
    });
});

describe('Check if 2 line segments collide', () => {
    it('should work', () => {
        const testInfos = new TestInfos([
            new TestInfo([new Line(1, 2, 5, 7), new Line(1, 2, 5, 7)], true, 'equivalent lines test'),
            new TestInfo([new Line(1, 2, 5, 7), new Line(5, 7, 2, 1)], true, 'equivalent reversed lines test'),
            new TestInfo([new Line(2, 0, 5, 0), new Line(0, 0, 10, 0)], true, 'contained lines test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(5, 1, 10, 1)], true, 'same slope test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(3, 1, 10, 1)], true, 'same slope test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(5.1, 1, 10, 1)], false, 'same slope test'),
            new TestInfo([new Line(1, 1, 5, 1), new Line(10, 1, 3, 1)], true, 'same reversed slope test'),
            new TestInfo([new Line(5, 1, 1, 1), new Line(3, 1, 10, 1)], true, 'same reversed slope test'),
            new TestInfo([new Line(1, 1, 5, 5), new Line(5, 5, 1, 1)], true, 'diff slope test'),
            new TestInfo([new Line(1, 1, 5, 5), new Line(1, 5, 5, 1)], true, 'diff slope test'),
            new TestInfo([new Line(1, 1, 5, 5), new Line(1, 5, 1.5, 4.5)], false, 'diff slope test'),
            new TestInfo([new Line(1, 1, 5, 5), new Line(455,200, 123, 987)], false, 'diff slope test'),
            new TestInfo([new Line(0,0,0,5), new Line(0,3,0,7)], true, 'same vertical slope test'),
            new TestInfo([new Line(0,0,0,5), new Line(0,6,0,7)], false, 'same vertical slope test'),
            new TestInfo([new Line(0,0,0,5), new Line(1,3,1,7)], false, 'same vertical slope test'),
            new TestInfo([new Line(790,10,790,450), new Line(705,193,804,210)], true, 'diff slope, 1 line vertical, test'),
            new TestInfo([new Line(705,193,804,210), new Line(790,10,790,450)], true, 'diff slope, 1 line vertical, test'),
            new TestInfo([new Line(0,0,0,5), new Line(-2,4,2,7)], false, 'diff slope, 1 line vertical, test'),
            new TestInfo([new Line(189,174,265,238), new Line(10,450,10,10)], false, 'diff slope, 1 line vertical, test'),
            new TestInfo([new Line(330,200,230,200), new Line(790,10,790,450)], false, 'diff slope, 1 line vertical, test'),
        ]);

        testInfos.tests.forEach((test) => {
            console.info(`    ${test.title} ${GeomUtils.lineToString(test.data[0])} ${GeomUtils.lineToString(test.data[1])} ${test.expectedResult}`);

            const collision = GeomUtils.collisionLineSegments(test.data[0], test.data[1]);
            expect(collision).to.equal(test.expectedResult, `${test}`);
        });
    });
});

describe('Check if non intersecting line outside rectangle', () => {
    it('should work', () => {
        const rectangle = new ExtRectangle(new Rectangle(100,100,500,500));
        const testInfos = new TestInfos([
            new TestInfo([new Line(1,1,2,2)], true, 'test'),
        ]);

        testInfos.tests.forEach((test) => {
            console.info(`    ${test.title} ${GeomUtils.lineToString(test.data[0])} ${test.expectedResult}`);

            const outside = rectangle.nonInteresectingLineOutside(test.data[0]);
            expect(outside).to.equal(test.expectedResult, `${test}`);
        });
    });
});



class TestInfos {
    tests: TestInfo[];

    constructor(tests: TestInfo[]) {
        this.tests = tests;
    }
}

class TestInfo {
    data: any[];
    expectedResult: any;
    title: String;

    constructor(data: any[], expectedResult: any, title: String = '') {
        this.data = data;
        this.expectedResult = expectedResult;
        this.title = title;
    }
}
