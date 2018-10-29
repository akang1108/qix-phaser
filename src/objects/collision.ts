export enum CollisionType {
    NONE = 1,
    WITH_VERTICAL_LINE,
    WITH_HORIZONTAL_LINE,
}

export class Collision {
    type: CollisionType;

    static NONE = new Collision(CollisionType.NONE);
    static WITH_VERTICAL_LINE = new Collision(CollisionType.WITH_HORIZONTAL_LINE);
    static WITH_HORIZONTAL_LINE = new Collision(CollisionType.WITH_HORIZONTAL_LINE);

    private constructor(type: CollisionType) {
        this.type = type;
    }

    or(checkCollisionFunc: () => Collision): Collision {
        if (this.type === CollisionType.NONE) {
            return checkCollisionFunc();
        } else {
            return this;
        }
    }

    and(checkCollisionFunc: () => Collision): Collision {
        if (this.type === CollisionType.NONE) {
            return this;
        } else {
            return checkCollisionFunc();
        }
    }
}

