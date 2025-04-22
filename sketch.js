// 定义乌鸦类
class Crow {
  constructor() {
    this.x = -100; // 初始位置在屏幕外
    this.y = height / 2; // 垂直居中
    this.size = 40; // 乌鸦的大小
    this.speed = 2; // 乌鸦的初始速度
    this.angry = false; // 乌鸦是否生气
  }

  // 更新乌鸦的位置
  update() {
    if (this.angry) {
      this.speed = 5; // 乌鸦生气时，速度加快
    }

    this.x += this.speed; // 乌鸦沿水平方向移动
    if (this.x > width + this.size) { // 如果乌鸦移出屏幕
      this.x = -this.size; // 让乌鸦从左边重新出现
    }
  }

  // 显示乌鸦
  display() {
    fill(this.angry ? color(255, 0, 0) : color(0)); // 生气时乌鸦颜色为红色
    ellipse(this.x, this.y, this.size); // 画一个圆形代表乌鸦
  }

  // 判断鼠标是否点击到乌鸦
  isHovered(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2; // 如果鼠标在乌鸦范围内，返回true
  }

  // 乌鸦变生气
  getAngry() {
    this.angry = true;
  }
}

let crow;
let bgColor = color(255); // 默认背景为白色

function setup() {
  createCanvas(800, 600); // 创建画布
  crow = new Crow(); // 创建一个乌鸦实例
}

function draw() {
  background(bgColor); // 背景颜色（默认白色）

  crow.update(); // 更新乌鸦的位置
  crow.display(); // 绘制乌鸦
}

// 监听鼠标点击
function mousePressed() {
  // 检查是否点击到乌鸦
  if (crow.isHovered(mouseX, mouseY)) {
    crow.getAngry(); // 乌鸦变生气
    bgColor = color(255, 0, 0); // 改变背景颜色为红色
  }
}
