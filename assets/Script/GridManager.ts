// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GridManager extends cc.Component {
  @property(cc.Label)
  label: cc.Label = null;

  @property
  text: string = 'hello';

  // private xDown : number = null;
  // private yDown : number = null;
  private _startLocation: cc.Vec2 = null;
  private _swipeThres: number = 20;
  private _isSwipeEnd: boolean = true;

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.node.on('mousedown', function (event) {
      console.log('ell');
    });
    this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
      this._startLocation = event.getStartLocation();
      this._isSwipeEnd = false;
    });

    this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
      if (this._isSwipeEnd || !this._startLocation) {
        return;
      }

      let currentLocation: cc.Vec2 = event.getLocation();
      let xDiff = currentLocation.x - this._startLocation.x;
      let yDiff = currentLocation.y - this._startLocation.y;

      if (Math.abs(xDiff) == Math.abs(yDiff)) {
        if (Math.abs(xDiff) > this._swipeThres) {
          if (xDiff > 0) {
            console.log('swipe right');
          } else {
            console.log('swipe left');
          }
          this._isSwipeEnd = true;
        }
      } else {
        if (Math.abs(yDiff) > this._swipeThres) {
          if (yDiff > 0) {
            console.log('swipe up');
          } else {
            console.log('swipe down');
          }
          this._isSwipeEnd = true;
        }
      }
    });

    this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
      this._isSwipeEnd = true;
    });

    this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
      this._isSwipeEnd = true;
    });
  }

  start() {
    console.log('hello world');
  }

  // update (dt) {}
}
