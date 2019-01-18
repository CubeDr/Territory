class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style) {
        super(scene, x, y, text, style);

        this.onClick = getValue(style.onClick, null);
        this.hoverColor = getValue(style.hoverColor, '#ddd');
        this.downColor = getValue(style.downColor, '#aaa');
        this.idleColor = getValue(style.fill, '#fff');

        this.setStyle({fill: this.idleColor});

        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', (pointer, localX, localY, event) => {
                event.stopPropagation();
                this.enterButtonActiveState()
                this.down = true;
            })
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerup', () => {
                if(this.down)
                    this.click();
                this.down = false;
                this.enterButtonHoverState();
            });
    }

    enterButtonActiveState() {
        this.setStyle({fill: this.downColor});
    }

    enterButtonRestState() {
        this.setStyle({fill: this.idleColor});
    }


    enterButtonHoverState() {
        this.setStyle({fill: this.hoverColor});
    }

    click() {
        if(this.onClick)
            this.onClick();
    }
}

class HorizontalSlider extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, config) {
        super(scene, x, y);

        this.width = width;
        this.min = getValue(config.min, 0);
        this.max = getValue(config.max, 100);
        this.isDescrete = getValue(config.isDescrete, false);
        this.thumbRadius = getValue(config.thumbRadius, 10);

        this.value = 0;
        this.valueChangeListener = null;

        this.bar = scene.add.rectangle(0, 0, width, 3, 0x777777).setOrigin(0.5);
        this.add(this.bar);

        this.thumb = scene.add.circle(0, 0, this.thumbRadius, 0xffff00);
        this.add(this.thumb);
        this.thumb.setInteractive({draggable: true})
            .on('drag', (p, x, y) => {
                if(x < -width/2) x = -width/2;
                else if(x > width/2) x = width/2;
                this.thumb.setPosition(x, 0);

                this._calculateValue();
            }, this)
            .on('dragend', (p, x, y) => {
                this._snapToPoint();
            }, this);
    }

    _calculateValue() {
        let value = (this.thumb.x + this.width/2) / this.width * (this.max - this.min) + this.min;
        if(this.isDescrete) value = Math.floor(value);
        if(value !== this.value) {
            this.value = value;
            if(this.valueChangeListener)
                this.valueChangeListener(this.value);
        }
    }

    _snapToPoint() {
        if(!this.isDescrete) return;
    }

    setOnValueChangeListener(listener) {
        this.valueChangeListener = listener;
    }
}

// const ACTION_POINTER_DOWN  = 'pointerdown';
// const ACTION_POINTER_UP    = 'pointerup';
// const ACTION_POINTER_OVER  = 'pointerover';
// const ACTION_POINTER_OUT   = 'pointerout';
// const ACTION_POINTER_MOVE  = 'pointermove';
//
// class Widget extends Phaser.GameObjects.Container {
//
//     constructor(scene, config) {
//         super(scene,
//             config.x? config.x : 0,
//             config.y? config.y : 0
//         );
//         this.scene = scene;
//         this.scene.add.existing(this);
//
//         this.childrenContainer = scene.add.container(0, 0);
//         this.add(this.childrenContainer);
//
//         this.__init(config);
//
//         this.setMargin(config.margin);
//         this.setPadding(config.padding);
//
//         this.on(ACTION_POINTER_DOWN, () => {
//             console.log("event from Widget " + this.key);
//         });
//     }
//
//     __init(config) {
//         this.width = config.width? config.width : 100;
//         this.height = config.height? config.height : 100;
//         this.parentWidget = config.parentWidget;
//         this.key = config.key;
//
//         this.margin = {top:0, bottom:0, left:0, right:0};
//         this.padding = {top:0, bottom:0, left:0, right:0};
//
//         this._clipChildren = config.clipChildren? config.clipChildren : false;
//         this._clipToPadding = config.clipToPadding? config.clipToPadding : false;
//     }
//
//     setMargin(margin) {
//         this.margin = margin? margin : {};
//         if(!this.margin.top) this.margin.top = 0;
//         if(!this.margin.bottom) this.margin.bottom = 0;
//         if(!this.margin.left) this.margin.left = 0;
//         if(!this.margin.right) this.margin.right = 0;
//         this.__fitBackground();
//         this.__fitChildrenContainer();
//         this.__attachInteractive();
//         this.__fitClipMask();
//     }
//
//     setPadding(padding) {
//         this.padding = padding? padding: {};
//         if(!this.padding.top) this.padding.top = 0;
//         if(!this.padding.bottom) this.padding.bottom = 0;
//         if(!this.padding.left) this.padding.left = 0;
//         if(!this.padding.right) this.padding.right = 0;
//         this.__fitBackground();
//         this.__fitChildrenContainer();
//         this.__attachInteractive();
//         this.__fitClipMask();
//     }
//
//     setSize(size) {
//         if(size.width) this.width = size.width;
//         if(size.height) this.height = size.height;
//         this.__fitBackground();
//         this.__fitChildrenContainer();
//         this.__attachInteractive();
//         this.__fitClipMask();
//     }
//
//     __attachInteractive() {
//         this.removeInteractive();
//         this.setInteractive(
//             new Phaser.Geom.Rectangle(this.width/2 + this.margin.left,
//                 this.height/2 + this.margin.top,
//                 this.width - this.margin.left - this.margin.right,
//                 this.height - this.margin.top - this.margin.bottom),
//             Phaser.Geom.Rectangle.Contains
//         );
//     }
//
//     setBackground(backgroundKey) {
//         if(this.background) {
//             this.background.destroy();
//             this.background = null;
//         }
//         this.background = this.scene.add.image(0, 0, backgroundKey).setOrigin(0);
//         this.add(this.background);
//         this.sendToBack(this.background);
//         this.__fitBackground();
//     }
//
//     __fitBackground() {
//         if(!this.background) return;
//         let ws = (this.width - this.margin.left - this.margin.right) / this.background.width;
//         let hs = (this.height - this.margin.top - this.margin.bottom) / this.background.height;
//         this.background.setScale(ws, hs);
//         this.background.setPosition(this.margin.left, this.margin.top);
//     }
//
//     __fitChildrenContainer() {
//         this.childrenContainer.setPosition(this.margin.left + this.padding.left, this.margin.top + this.padding.top);
//         this.childrenContainer.width = this.width
//                                         - (this.margin.left + this.margin.right)
//                                         - (this.padding.left + this.padding.right);
//         this.childrenContainer.height = this.height
//                                         - (this.margin.top + this.margin.bottom)
//                                         - (this.padding.top + this.padding.bottom);
//         this.__fitChildren();
//     }
//
//     __fitChildren() {}
//
//     __fitClipMask() {
//         this._clipChildrenMask = this.scene.make.graphics();
//         this._clipChildrenMask.fillStyle(0xffffff);
//         this._clipChildrenMask.beginPath();
//         this._clipChildrenMask.fillRect(this.x + this.margin.left, this.y + this.margin.top,
//             this.width - this.margin.left - this.margin.right,
//             this.height - this.margin.top - this.margin.bottom);
//         if(this._clipChildren) this.mask = this._clipChildrenMask.createGeometryMask();
//         else this.mask = null;
//
//         console.log(this);
//         this._clipPaddingMask = this.scene.make.graphics();
//         this._clipPaddingMask.fillStyle(0xffffff);
//         this._clipPaddingMask.beginPath();
//         this._clipPaddingMask.fillRect( this.x + this.margin.left + this.padding.left,
//                                         this.y + this.margin.top + this.padding.top,
//             this.width - this.margin.left - this.margin.right - this.padding.left - this.padding.right,
//             this.height - this.margin.top - this.margin.bottom - this.padding.top - this.padding.bottom);
//         if(this._clipToPadding) this.childrenContainer.mask = this._clipPaddingMask.createGeometryMask();
//         else this.childrenContainer.mask = null;
//         // this.mask = this._clipPaddingMask; works
//     }
// }
//
// class Text extends Widget {
//     constructor(scene, config) {
//         super(scene, config);
//
//         this.text = this.scene.add.text(0, 0, config.text);
//         this.childrenContainer.add(this.text);
//         if(config.textConfig) {
//             config.textConfig.backgroundColor = null;
//             this.text.setStyle(config.textConfig);
//         }
//         if(config.gravity) this.setGravity(config.gravity);
//     }
//
//     __init(config) {
//         super.__init(config);
//         this.gravity = 'center|left';
//     }
//
//     setGravity(gravity) {
//         this.gravity = gravity;
//         if(!this.text) return;
//         gravity.split("|").forEach((g) => {
//             switch(g) {
//                 case 'center':
//                     this.text.setOrigin(0.5);
//                     this.text.setPosition(this.childrenContainer.width/2, this.childrenContainer.height/2);
//                     break;
//                 case 'top':
//                     this.text.setOrigin(this.text.originX, 0);
//                     this.text.setY(0);
//                     break;
//                 case 'bottom':
//                     this.text.setOrigin(this.text.originX, 1);
//                     this.text.setY(this.childrenContainer.height);
//                     break;
//                 case 'left':
//                     this.text.setOrigin(0, this.text.originY);
//                     this.text.setX(0);
//                     break;
//                 case 'right':
//                     this.text.setOrigin(1, this.text.originY);
//                     this.text.setX(this.childrenContainer.width);
//                     break;
//             }
//         });
//     }
//
//     __fitChildren() {
//         this.setGravity(this.gravity);
//     }
// }