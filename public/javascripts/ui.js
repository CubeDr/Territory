
/* ===== External Methods ===== */

function preloadUiElements(self) {
    self.load.image('button', 'assets/ui/background_button.png');
    self.load.image('purple_button', 'assets/ui/strong_background_button.png');
}

/* ====== ImageButton definition ===== */
// Constructor
function ImageButton(scene, x, y, w, h, imageKey, text, clickListener, longClickListener, backgroundKey='button') {
    Phaser.GameObjects.GameObject.call(this, scene, 'imageButton');

    var self = this;

    self.x = x;
    self.y = y;
    self.width = w;
    self.height = h;
    self.state = 'idle';
    self.clickListener = clickListener;
    self.longClickListener = longClickListener;

    var background = scene.add.image(0, 0, backgroundKey);
    background.setOrigin(0, 0);
    w /= background.width;
    h /= background.height;
    background.setScale(w, h);

    var image = scene.add.image(0, 0, imageKey);
    var s = w > h ? h : w;
    image.setScale(.7 * s, .7 * s);
    image.setOrigin(.5);

    var title = scene.add.text(0, 0, text, {fill: '#000'});
    title.setOrigin(.5);

    self.button = scene.add.container(x, y, [background, image, title]);
    image.setPosition(self.width/2, self.height * .45);
    title.setPosition(self.width/2, self.height * .9);

    this.button.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, self.width, self.height),
        Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', function() {
            if(self.state === 'disabled') return;
            self.setState('down');
            if(self.longClickListener)
                self.downTimer = self.time.delayedCall(600, function() {
                    if(self.state !== 'down') return;
                    self.longClickListener();
                    self.setState('hover');
                }, [], this);
        }).on('pointerup', function() {
        if(self.state === 'disabled') return;
            if(self.state === 'down') self.clickListener();
            self.setState('hover');
            if(self.downTimer) {
                self.downTimer.remove();
                self.downTimer = null;
            }
        }).on('pointerover', function() {
            if(self.state === 'disabled') return;
            self.setState('hover');
        }).on('pointerout', function() {
            if(self.state === 'disabled') return;
            self.setState('idle');
    });
    self.button.parent = self;
    self.setState('idle');
}

ImageButton.prototype = Object.create(Phaser.GameObjects.GameObject.prototype);
ImageButton.prototype.constructor = ImageButton;

// Member Methods
ImageButton.prototype.setPosition = function(x, y) {
    this.button.setPosition(x, y);
};

ImageButton.prototype.setState = function(state) {
    this.state = state;
    switch(state) {
        case 'idle':
            this.button.iterate(function(child) {
                child.clearTint();
            });
            break;
        case 'hover':
            this.button.iterate(function(child) {
                child.setTint(0xaaaaaa);
            });
            break;
        case 'down':
            this.button.iterate(function(child) {
                child.setTint(0x999999);
            });
            break;
        case 'disabled':
            button.setTint(0x999999);
            break;
    }
};

ImageButton.prototype.destroy = function() {
    this.button.iterate(function(child) {
        child.destroy();
    });
    this.button.destroy();
    Phaser.GameObjects.GameObject.prototype.destroy.call(this);
};


/* ===== List definition ===== */
// Constructor
function List(scene, x, y, w, h, orientation, gap) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.orientation = orientation;
    this.gap = gap;

    this.list = scene.add.container(x, y);
    this.state = 'open';

    this.maskShape = scene.make.graphics();
    this.maskShape.fillStyle(0xffffff);
    this.maskShape.beginPath();
    this.maskShape.fillRect(x, y, w, h);
    this.list.mask = this.maskShape.createGeometryMask();
}

// Member Methods
List.prototype.open = function() {
    this.state = 'open';
    this.__drawChildren();
};

List.prototype.close = function() {
    this.state = 'close';
    this.__drawChildren();
};

List.prototype.addChild = function(child) {
    this.list.add(child.button);
    this.__drawChildren();
};

List.prototype.deleteChild = function(index) {
    var target = this.list.getAt(index);
    this.list.removeAt(index);
    this.__drawChildren();
    return target;
};

List.prototype.size = function() {
    return this.list.length;
};

List.prototype.setOrientation = function(orientation) {
    this.orientation = orientation;
    this.__drawChildren();
};

// private methods
List.prototype.__drawChildrenAligned = function(offset) {
    var self = this;

    var offsetX = 0;
    var offsetY = 0;

    if(self.orientation === 'horizontal')
        offsetX -= offset;
    else offsetY -= offset;

    this.list.iterate(function(ibChild) {
        var button = ibChild.parent;
        button.setPosition(offsetX, offsetY);
        if(self.orientation === 'horizontal')
            offsetX += button.width + self.gap;
        else
            offsetY += button.height + self.gap;
    });
};

List.prototype.__drawChildren = function() {
    if(this.state === 'open')
        this.__drawChildrenAligned(0);
    else if(this.state === 'close') {
        var offset = 0;
        if(this.orientation === 'horizontal')
            this.list.iterate(function(child) {
                offset += this.gap + child.width;
            });
        else this.list.iterate(function(child) {
                offset += this.gap + child.height;
        });
        this.__drawChildrenAligned(offset);
    }
};