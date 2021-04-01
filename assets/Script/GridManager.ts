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

  private _animTable: number[][] = [];

  private _tileInitVal: number = 2;

  private _gridTile: cc.Node[] = [];

  private _canSwipe = true;

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
    // let button = this._gridTile[randIndex];
    // button.children[0].children[0].getComponent(cc.Label).string = <string>(
    //   (<any>this._tileInitVal)
    // );
    // button.children[0].active = true;
    // this.updateGridTile();
  }

  private moveGrid(dir: SwipeDirection) {
    this._animTable = this._animTable.map((row) => row.map(() => 0));

    let prevGrid = [];
    for (let i = 0; i < this.tableSize; i++) {
      prevGrid.push(this._table[i].slice());
    }

    for (let k = 0; k < this.tableSize; k++) {
      let row = [];

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Right) {
        row = this._table[k];
      } else {
        for (let j = 0; j < this.tableSize; j++) {
          row.push(this._table[j][k]);
        }
      }

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Up) {
        row.reverse();
      }
      const step = [];

      for (let i = 0; i < row.length; i++) {
        step.push(0);
      }
      let idx = row.length - 1;

      while (idx >= 0) {
        if (row[idx] === 0) {
          let j = idx - 1;
          while (j >= 0) {
            if (row[j] !== 0) {
              step[j] = idx - j;
              row[idx] = row[j];
              row[j] = 0;

              if (
                idx < row.length - 1 &&
                (row[idx + 1] === row[idx] || row[idx + 1] === 0)
              ) {
                row[idx + 1] += row[idx];
                row[idx] = 0;
                step[j]++;
              }

              break;
            }
            j--;
          }
        } else if (
          idx < row.length - 1 &&
          (row[idx + 1] === row[idx] || row[idx + 1] === 0)
        ) {
          row[idx + 1] += row[idx];
          row[idx] = 0;
          step[idx]++;
        }

        idx--;
      }

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Up) {
        row.reverse();
        step.reverse();
      }

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Right) {
        this._animTable[k] = step;
        this._table[k] = row;
      } else {
        for (let i = 0; i < row.length; i++) {
          this._table[i][k] = row[i];
          this._animTable[i][k] = step[i];
        }
      }
    }

    let tweens: cc.Tween[] = [];
    for (let i = 0; i < this.tableSize; i++) {
      for (let j = 0; j < this.tableSize; j++) {
        const step = this._animTable[i][j];
        if (step === 0) {
          continue;
        }
        let idx = i * this.tableSize + j;
        let x = 0,
          y = 0;
        switch (dir) {
          case SwipeDirection.Right:
            x = step;
            break;
          case SwipeDirection.Left:
            x = -step;
            break;
          case SwipeDirection.Up:
            y = step;
            break;
          case SwipeDirection.Down:
            y = -step;
            break;
        }

        let spacing = 8;
        let btnBackground = this._gridTile[idx].children[0];
        tweens.push(
          cc
            .tween(btnBackground)
            .to(0.2, {
              position: cc.v3(
                x * (spacing + this._gridTile[idx].width),
                y * (spacing + this._gridTile[idx].height),
                0
              ),
            })
            .call(() => {
              btnBackground.active = false;
              btnBackground.position = cc.Vec3.ZERO;
            })
        );
      }
    }

    for (let i = 0; i < tweens.length; i++) {
      if (i === tweens.length - 1) {
        tweens[i].call(() => {
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
        });
      }
      tweens[i].start();
    }
  }

  private updateGridTile() {
    for (let i = 0; i < this.tableSize; i++) {
      for (let j = 0; j < this.tableSize; j++) {
        let index = i * this.tableSize + j;
        if (this._table[i][j] != 0) {
          this._gridTile[index].children[0].children[0].getComponent(
            cc.Label
          ).string = <string>(<any>this._table[i][j]);
          this._gridTile[index].children[0].active = true;
        } else {
          this._gridTile[index].children[0].active = false;
        }
      }
    }
  }

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.node.children.forEach((row) => {
      row.children.forEach((button) => {
        button.children[0].children[0].getComponent(cc.Label).string = '';
        button.children[0].children[0].getComponent(cc.Label).fontSize = 48;
        button.children[0].active = false;

        this._gridTile.push(button);
      });
    });

    for (let i = 0; i < this.tableSize; i++) {
      this._table.push([]);
      this._animTable.push([]);
      for (let j = 0; j < this.tableSize; j++) {
        this._table[i].push(0);
        this._animTable[i].push(0);
      }
    }

    console.log('table', this._table);

    this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
      this._startLocation = event.getStartLocation();
      this._isSwipeEnd = false;
    });

    this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
      if (this._isSwipeEnd || !this._startLocation || this._canSwipe == false) {
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
    this.updateGridTile();

    // cc.tween(this._gridTile[2].children[0])
    //   .to(1, { position: cc.v3(200, 300) })
    //   .start();
  }

  // update (dt) {}
}
