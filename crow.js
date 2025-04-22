class Crow {
  constructor() {
    this.x = -100;
    this.y = height - 100;
    this.size = 40;
    this.speed = 2;
    this.target = null;
    this.angry = false;

    // 金块追逐
    this.chasingGold = false;
    this.goldStartTime = 0;
    this.goldDelay = 120; // 停顿 2 秒
    this.goldPause = false;
  }

  startMovingToward(block) {
    if (!block.isGold) {
      this.target = block;
      this.x = -100;
      this.speed = this.angry ? 5 : 2;
      this.chasingGold = false;
    }
  }

  reactToGold(block) {
    this.target = block;
    this.x = -100;
    this.chasingGold = true;
    this.goldPause = true;
    this.goldStartTime = frameCount;

    setTimeout(() => {
      this.goldPause = false;
      this.speed = 3.5;
      // 播放乌鸦叫声
    }, this.goldDelay * (1000 / 60)); // 2秒
  }

  update() {
    if (!this.target || this.goldPause) return;

    if (this.x < this.target.x - 10) {
      this.x += this.speed;
    } else {
      this.target.collected = true;
      this.target = null;
      this.chasingGold = false;
    }
  }

  display() {
    fill(30);
    ellipse(this.x, this.y, this.size);
    triangle(this.x + 10, this.y - 5, this.x + 30, this.y, this.x + 10, this.y + 5);
  }

  isHovered(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }

  getAngry() {
    this.angry = true;
    this.speed = 5;
    // 播放叫声音效
  }
}
