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

  @property(cc.Node)
  public testNode: cc.Node = null;

  private _startLocation: cc.Vec2 = null;
  private _swipeThres: number = 20;
  private _isSwipeEnd: boolean = true;

  private _table: number[][] = [];

  private _animTable: number[][] = [];

  private _tileInitVal: number = 2;

  private _tiles: cc.Node[] = [];

  private _canSwipe = true;

  private _tileColors: cc.Color[] = [
    cc.color(238, 228, 218),
    cc.color(237, 224, 200),
    cc.color(242, 177, 121),
    cc.color(245, 149, 99),
    cc.color(246, 124, 96),
    cc.color(246, 94, 59),
    cc.color(237, 207, 115),
    cc.color(237, 204, 98),
    cc.color(237, 200, 80),
    cc.color(237, 197, 63),
    cc.color(237, 294, 45),
  ];

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

    if (!randIndex) {
      return;
    }
    let rowIndex = Math.floor(randIndex / this.tableSize);
    let colIndex = randIndex % this.tableSize;

    this._table[rowIndex][colIndex] = this._tileInitVal;

    let tile = this._tiles[randIndex];
    tile.scale = 0;
    cc.tween(tile).to(0.1, { scale: 1 }).start();
  }

  private moveGrid(dir: SwipeDirection) {
    this._animTable = this._animTable.map((row) => row.map(() => 0));

    let mergeTable = [];
    for (let i = 0; i < this.tableSize; i++) {
      mergeTable.push([]);
      for (let j = 0; j < this.tableSize; j++) {
        mergeTable[i].push(0);
      }
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
      const merge = [];

      for (let i = 0; i < row.length; i++) {
        step.push(0);
        merge.push(0);
      }
      let i = row.length - 1;

      while (i >= 0) {
        let j = i - 1;
        while (j >= -1) {
          if (j == -1) {
            i = -1;
            break;
          }
          if (row[j] === 0) {
            j--;
            continue;
          }

          if (row[i] !== 0) {
            if (row[j] === row[i]) {
              row[i] += row[j];
              row[j] = 0;
              step[j] = i - j;
              merge[i] = 1;
            } else if (i - 1 != j) {
              row[i - 1] = row[j];
              row[j] = 0;
              step[j] = i - j - 1;
            }

            i--;
          } else {
            row[i] += row[j];
            row[j] = 0;
            step[j] = i - j;
          }

          break;
        }
      }

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Up) {
        merge.reverse();
        row.reverse();
        step.reverse();
      }

      if (dir === SwipeDirection.Left || dir === SwipeDirection.Right) {
        this._animTable[k] = step;
        this._table[k] = row;
        mergeTable[k] = merge;
      } else {
        for (let i = 0; i < row.length; i++) {
          this._table[i][k] = row[i];
          this._animTable[i][k] = step[i];
          mergeTable[i][k] = merge[i];
        }
      }
    }

    console.log('mergetable', mergeTable);

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
        let tile = this._tiles[idx];
        let pos = tile.position;
        let zIdx = tile.zIndex;

        console.log('zindex 0', tile.zIndex);

        tile.zIndex = -Math.abs(step);

        this._canSwipe = false;
        tweens.push(
          cc
            .tween(tile)
            .to(0.2, {
              position: cc.v3(
                tile.x + x * (spacing + this._tiles[idx].width),
                tile.y + y * (spacing + this._tiles[idx].height),
                0
              ),
            })
            .call(() => {
              tile.active = false;
              tile.position = pos;
              tile.zIndex = zIdx;

              // let destineTile = this._tiles[(i + y) * this.tableSize + j + x];
              // cc.tween(destineTile)
              //   .to(0.1, { scale: 1.1 })
              //   .to(0.1, { scale: 1.0 })
              //   .start();
            })
        );
      }
    }

    for (let i = 0; i < tweens.length; i++) {
      if (i === tweens.length - 1) {
        tweens[i].call(() => {
          for (let i = 0; i < this.tableSize; i++) {
            for (let j = 0; j < this.tableSize; j++) {
              if (mergeTable[i][j] === 1) {
                let tile = this._tiles[i * this.tableSize + j];
                let colorIdx = Math.min(
                  Math.round(Math.log2(this._table[i][j])) - 1,
                  this._tileColors.length - 1
                );

                console.log('color index bla', this._tileColors[colorIdx]);
                // this._tiles[index].children[0].color = this._tileColors[coloIdx];
                cc.tween(tile)
                  .parallel(
                    cc
                      .tween()
                      .to(0.05, { scale: 1.2 })
                      .to(0.05, { scale: 1.0 }),
                    cc.tween().to(0.5, { color: this._tileColors[colorIdx] })
                  )
                  // .to(0.05, { scale: 1.2 })
                  // .to(0.05, { scale: 1.0 })
                  // .to(0.1, { color: this._tileColors[colorIdx] })
                  .start();
              }
            }
          }

          this.addRandomTile();
          this.updateGridTile();

          this.scheduleOnce(() => {
            this._canSwipe = true;
            if (!this.validMoves()) {
              console.log('thua roi');
            }
          }, 0.1);
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
          this._tiles[index].children[0].children[0].getComponent(
            cc.Label
          ).string = <string>(<any>this._table[i][j]);

          // let coloIdx = Math.min(
          //   Math.round(Math.log2(this._table[i][j])) - 1,
          //   this._tileColors.length - 1
          // );

          // console.log('color index', this._tileColors[coloIdx]);
          // this._tiles[index].children[0].color = this._tileColors[coloIdx];

          this._tiles[index].active = true;
        } else {
          this._tiles[index].active = false;
        }
      }
    }
  }

  private validMoves(): boolean {
    for (let i = 0; i < this._table.length; i++) {
      for (let j = 0; j < this._table.length; j++) {
        if (this._table[i][j] === 0) {
          return true;
        }
      }
    }

    for (let i = 0; i < this._table.length; i++) {
      for (let j = 0; j < this._table.length - 1; j++) {
        if (this._table[i][j] === this._table[i][j + 1]) {
          return true;
        }
        if (this._table[j][i] === this._table[j + 1][i]) {
          return true;
        }
      }
    }

    return false;
  }

  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    let i = 1;
    this.node.children.forEach((tile) => {
      // tile.children[0].children[0].getComponent(cc.Label).fontSize = 64;
      tile.active = false;
      this._tiles.push(tile);
      i++;
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
    // this._table = this._table.map((row) => row.map(() => 0));
    // this.addRandomTile();
    // this.updateGridTile();
    // cc.tween(this._tiles[2])
    //   .to(1, { position: cc.v3(100, 100) })
    //   .start();
  }

  // update (dt) {}
}
