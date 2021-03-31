// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
enum SwipeDirection {
  Up,
  Down,
  Left,
  Right,
}

@ccclass
export default class GridManager extends cc.Component {
  // @property(cc.Label)
  // label: cc.Label = null;

  // @property
  // text: string = 'hello';
  @property
  public tableSize: number = 4;

  private _startLocation: cc.Vec2 = null;
  private _swipeThres: number = 20;
  private _isSwipeEnd: boolean = true;

  private _table: number[][] = [];

  private _tileInitVal: number = 2;

  private _gridTileLabel = [];

  private addRandomTile(): void {
    let blankIndices = [];
    for (let i = 0; i < this.tableSize; i++) {
      for (let j = 0; j < this.tableSize; j++) {
        if (this._table[i][j] === 0) {
          blankIndices.push(i * this.tableSize + j);
        }
      }
    }

    let randIndex =
      blankIndices[Math.floor(Math.random() * blankIndices.length)];
    let rowIndex = Math.floor(randIndex / this.tableSize);
    let colIndex = randIndex % this.tableSize;

    this._table[rowIndex][colIndex] = this._tileInitVal;
  }

  private moveGrid(dir: SwipeDirection) {
    let prevGrid = [];
    for (let i = 0; i < this.tableSize; i++) {
      prevGrid.push(this._table[i].slice());
    }

    switch (dir) {
      case SwipeDirection.Right: {
        for (let k = 0; k < this.tableSize; k++) {
          let valCells = this._table[k].filter((val) => val != 0);

          let i = valCells.length - 1;
          while (i > 0) {
            if (valCells[i] === valCells[i - 1]) {
              valCells[i] += valCells[i - 1];
              valCells.splice(i - 1, 1);
              i -= 2;
            } else {
              i--;
            }
          }
          while (valCells.length < this.tableSize) {
            valCells.unshift(0);
          }

          this._table[k] = valCells;
        }

        console.log('swipe right', this._table);

        break;
      }
      case SwipeDirection.Left: {
        for (let k = 0; k < this.tableSize; k++) {
          let valCells = this._table[k].filter((val) => val != 0);

          let i = 0;
          while (i < valCells.length - 1) {
            if (valCells[i] === valCells[i + 1]) {
              valCells[i] += valCells[i + 1];
              valCells.splice(i + 1, 1);
              i += 2;
            } else {
              i++;
            }
          }

          while (valCells.length < this.tableSize) {
            valCells.push(0);
          }

          this._table[k] = valCells;
        }

        console.log('swipe left', this._table);

        break;
      }

      case SwipeDirection.Down: {
        for (let i = 0; i < this.tableSize; i++) {
          let colCells = [];

          for (let j = 0; j < this.tableSize; j++) {
            colCells.push(this._table[j][i]);
          }

          let valCells = colCells.filter((val) => val != 0);

          let k = valCells.length - 1;
          while (k > 0) {
            if (valCells[k] === valCells[k - 1]) {
              valCells[k] += valCells[k - 1];
              valCells.splice(k - 1, 1);
              k -= 2;
            } else {
              k--;
            }
          }
          while (valCells.length < this.tableSize) {
            valCells.unshift(0);
          }

          for (let j = 0; j < this.tableSize; j++) {
            this._table[j][i] = valCells[j];
          }
        }

        console.log('swipe down', this._table);

        break;
      }

      case SwipeDirection.Up: {
        for (let i = 0; i < this.tableSize; i++) {
          let colCells = [];

          for (let j = 0; j < this.tableSize; j++) {
            colCells.push(this._table[j][i]);
          }

          let valCells = colCells.filter((val) => val != 0);

          let k = 0;
          while (k < valCells.length - 1) {
            if (valCells[k] === valCells[k + 1]) {
              valCells[k] += valCells[k + 1];
              valCells.splice(k + 1, 1);
              k += 2;
            } else {
              k++;
            }
          }
          while (valCells.length < this.tableSize) {
            valCells.push(0);
          }

          for (let j = 0; j < this.tableSize; j++) {
            this._table[j][i] = valCells[j];
          }
        }

        console.log('swipe up', this._table);

        break;
      }
    }

    let isValid = false;
    for (let i = 0; i < this.tableSize; i++) {
      for (let j = 0; j < this.tableSize; j++) {
        if (prevGrid[i][j] != this._table[i][j]) {
          isValid = true;
          break;
        }
      }
    }

    if (isValid) {
      console.log('is valid!');
      this.addRandomTile();
      this.updateGridTile();
    }

    // console.log('isvalid', isValid);
  }

  private updateGridTile() {
    for (let i = 0; i < this.tableSize; i++) {
      for (let j = 0; j < this.tableSize; j++) {
        let index = i * this.tableSize + j;
        this._gridTileLabel[index].string = this._table[i][j];
      }
    }
  }

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.node.children.forEach((row) => {
      row.children.forEach((button) => {
        button.children[0].children[0].getComponent(cc.Label).string = '';
        button.children[0].children[0].getComponent(cc.Label).fontSize = 48;
        this._gridTileLabel.push(
          button.children[0].children[0].getComponent(cc.Label)
        );
      });
    });

    console.log('gridtilelabel', this._gridTileLabel);

    for (let i = 0; i < this.tableSize; i++) {
      this._table.push([]);
      for (let j = 0; j < this.tableSize; j++) {
        this._table[i].push(0);
      }
    }

    console.log('table', this._table);

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

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (Math.abs(xDiff) > this._swipeThres) {
          if (xDiff > 0) {
            this.moveGrid(SwipeDirection.Right);
          } else {
            this.moveGrid(SwipeDirection.Left);
          }
          this._isSwipeEnd = true;
        }
      } else {
        if (Math.abs(yDiff) > this._swipeThres) {
          if (yDiff > 0) {
            this.moveGrid(SwipeDirection.Up);
          } else {
            this.moveGrid(SwipeDirection.Down);
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
    this.addRandomTile();
    this.addRandomTile();
    this.updateGridTile();
  }

  public resetGame() {
    // console.log('reset game');
    this._table = this._table.map((row) => row.map(() => 0));
    this.addRandomTile();
  }

  // update (dt) {}
}
