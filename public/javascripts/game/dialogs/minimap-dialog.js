class MinimapDialog extends Phaser.GameObjects.Container {
    constructor(scene, width, height, hMargin=0, vMargin=0) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.hMargin = hMargin;
        this.vMargin = vMargin;

        this.contentWidth = width - hMargin * 2;
        this.contentHeight = height - vMargin * 2;

        this.add(this.scene.add.nineslice(0, 0, width, height, 'background_dialog', 30, 10));
        this.add(this.scene.add.nineslice(hMargin, vMargin,
            this.contentWidth, this.contentHeight,
            'green', 0, 0));
    }

    setMap(territories) {
        let boundary = MinimapDialog._getTerritoryBoundary(territories);
        let tileSize = MinimapDialog._getTimeSize(boundary, this.contentWidth, this.contentHeight);

        let scaleX = tileSize.width / 80;
        let scaleY = tileSize.height / 80;

        territories.forEach((t) => {
            let tile = this.scene.add.image(
                this.hMargin + (t.x - boundary.minX) * tileSize.width,
                this.vMargin + (t.y - boundary.minY) * tileSize.height,
                t.hasArmy?'army':'resource'
            );
            tile.setScale(scaleX, scaleY);
            tile.setOrigin(0);
            this.add(tile);
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

        // make it close to square
        while(b.maxX - b.minX < b.maxY - b.minY) {
            b.maxX += 1;
            b.minX -= 1;
        }

        // margin
        b.minY -= 2;
        b.minX -= 2;
        b.maxY += 2;
        b.maxX += 2;

        return b;
    }

    static _getTimeSize(boundary, width, height) {
        let w = boundary.maxX - boundary.minX + 1;
        let h = boundary.maxY - boundary.minY + 1;
        return {
            width: width / w,
            height: height / h
        }
    }
}