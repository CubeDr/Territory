class MinimapDialog extends Phaser.GameObjects.Container {
    constructor(scene, width, height, hMargin=0, vMargin=0) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.hMargin = hMargin;
        this.vMargin = vMargin;
        
        this.add(this.scene.add.nineslice(0, 0, width, height, 'background_dialog', 30, 10));
    }

    setMap(territories) {
        let boundary = MinimapDialog._getTerritoryBoundary(territories);

        territories.forEach((t) => {

        });
    }

    static _getTerritoryBoundary(territories) {
        let b = {
            minY: 100,
            minX: 100,
            maxY: -100,
            maxX: -100
        };

        territories.forEach((t) => {
            if(t.x < b.minX) b.minX = t.x;
            if(t.x > b.maxX) b.maxX = t.x;
            if(t.y < b.minY) b.minY = t.y;
            if(t.y > b.maxY) b.maxY = t.y;
        });

        // margin
        b.minY -= 2;
        b.minX -= 2;
        b.maxY += 2;
        b.maxX += 2;

        return b;
    }
}