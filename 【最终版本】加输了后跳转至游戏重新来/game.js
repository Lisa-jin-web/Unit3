let gameEnded = false;
let endingImage = null;
let winImage, loseImage, tieImage;
let resultShown = false; // 防止跳转多次


let introImages = [];  // 存储六张图片
let currentIntroIndex = 0;  // 当前展示第几张图
let introFinished = false;  // 是否看完了全部六页
let shadowOffsets = {
    left: { x: -39, y: 0},
    right: { x:-29, y: -5 },
    up: { x: -32, y: -15 },
    down: { x: -34, y: -25 },
    staticLeft: { x: -5, y: 38},
    staticRight: { x: 15, y: 38 }
};
let crowShadows = {
    left: null,
    right: null,
    up: null,
    down: null,
    staticLeft: null,
    staticRight: null
};
let blockImages = {
    red: null,
    green: null,  // 注意：原代码使用'green'但你说要替换红黄蓝
    blue: null,
    gold: null    // 金色方块图片（如果需要）
};
let bgImage;
let bgWidth, bgHeight; // 背景原始尺寸
let crowAnimations = {
    left: [],
    right: [],
    up: [],
    down: [],
    staticLeft: null,  // 从左到右停止时的静态图
    staticRight: null  // 从右到左停止时的静态图
};
let currentAnimation = [];
let currentFrame = 0;
let lastFrameTime = 0;
let frameRate = 15; // 15帧/秒
let frameInterval = 1000 / frameRate; // 每帧间隔(毫秒)
let crow;
let blocks = [];
let colors = ['red', 'green', 'blue'];
let bgColor = 'white';
let goldenBlock = false;
let lastBlockTime = 0;
let crowSpeed = 2.5;
let crowAngry = false;
let blockColor;
let blockSize = 40; // 增大一倍
let currentTarget = null; // 当前追逐的方块
let draggableBlock = null; // 当前被拖动的方块
let basket;
let clickCount = 0;
let timerVisible = false;
let countdownStart = 0;
let countdownDuration = 40000; // 40秒
let countdownActive = false;
let hasCrowEatenOnce = false;
let timerBox;
let playerScore = 0;
let crowScore = 0;
let scoreboardVisible = false;
let scoreboard;
let scoreActive = false; // 控制记分器是否在计数状态

function preload() {
    winImage = loadImage('assets/ending_win.JPG');
loseImage = loadImage('assets/ending_lose.JPG');
tieImage = loadImage('assets/ending_tie.JPG');

    for (let i = 1; i <= 6; i++) {
        introImages.push(loadImage(`assets/intro${i}.JPG`));
      }
    // 修正拼写错误并确保路径正确
    for (let i = 0; i < 4; i++) {
        crowAnimations.left[i] = loadImage('assets/crow_left_' + i + '.png');
        crowAnimations.right[i] = loadImage('assets/crow_right_' + i + '.png');
        crowAnimations.up[i] = loadImage('assets/crow_up_' + i + '.png');
        crowAnimations.down[i] = loadImage('assets/crow_down_' + i + '.png');
    }
    crowAnimations.staticLeft = loadImage('assets/crow_static_left.png');
    crowAnimations.staticRight = loadImage('assets/crow_static_right.png');
    bgImage = loadImage('assets/game_bg.jpg', img => {
        // 获取图片原始尺寸
        bgWidth = img.width;
        bgHeight = img.height;
    });
    Basket.loadImage(); // 加载篮子图片
    TimerBox.loadImage(); // 加载计时器图片
    blockImages.red = loadImage('assets/block_red.png');
    blockImages.green = loadImage('assets/block_green.png'); 
    blockImages.blue = loadImage('assets/block_blue.png');

    crowShadows.left = loadImage('assets/crow_shadow_left.png');
    crowShadows.right = loadImage('assets/crow_shadow_right.png');
    crowShadows.up = loadImage('assets/crow_shadow_up.png');
    crowShadows.down = loadImage('assets/crow_shadow_down.png');
    crowShadows.staticLeft = loadImage('assets/crow_shadow_static_left.png');
    crowShadows.staticRight = loadImage('assets/crow_shadow_static_right.png');    

}

function setup() {
    createCanvas(600, 400);
    crow = new Crow();
    basket = new Basket();
    timerBox = new TimerBox();
    scoreboard = new Scoreboard();
    
    // 默认动画
    currentAnimation = crowAnimations.right;
    
    // 检查图片是否加载
    console.log('动画资源加载情况:', {
        left: crowAnimations.left,
        right: crowAnimations.right,
        up: crowAnimations.up,
        down: crowAnimations.down
    });
}

function draw() {
    if (gameEnded) {
        image(endingImage, 0, 0, width, height);
        return;
    }
    background(255);
    
    if (!introFinished) {
      image(introImages[currentIntroIndex], 0, 0, width, height);
      return;  // 阻止游戏逻辑继续运行
    }
    // 绘制背景（适配画布大小）
    //image(bgImage, 0, 0, width, height);
     // 智能适配背景（保持宽高比）
     let ratio = Math.min(width/bgWidth, height/bgHeight);
     let scaledWidth = bgWidth * ratio;
     let scaledHeight = bgHeight * ratio;
     let offsetX = (width - scaledWidth) / 2;
     let offsetY = (height - scaledHeight) / 2;
     
     image(bgImage, offsetX, offsetY, scaledWidth, scaledHeight);
    //background(bgColor);

    // 生成普通方块
    if (millis() - lastBlockTime > random(3000, 4000)) {
        spawnBlock();
        lastBlockTime = millis();
    }    

    // 生成金色方块
    if (millis() % 180000 === 0 && !goldenBlock) {
        goldenBlock = true;
        blocks.push(new Block(random(width), 0, 'gold'));
    }

    // 移动并显示所有方块
    for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].show();      

        // 如果方块是被拖动的，更新它的位置
        if (blocks[i] === draggableBlock) {
            blocks[i].x = mouseX;
            blocks[i].y = mouseY;
        }

        // 如果方块在篮子里
        if (basket.contains(blocks[i])) {
            blocks.splice(i, 1);
            if (scoreActive) { // 只在记分器活动时计分
                playerScore++;
            }
            continue;
        }
        
        // 如果乌鸦吃掉方块
        if (currentTarget && crow.intersects(blocks[i])) {
            blocks.splice(i, 1);
            currentTarget = null;
            crow.leaveScreen();
            if (scoreActive) { // 只在记分器活动时计分
                crowScore++;
            }
            
            if (!hasCrowEatenOnce) {
                hasCrowEatenOnce = true;
                timerVisible = true;
                countdownStart = millis();
                countdownActive = true;
            }
        }
    }

    // 如果没有目标，获取最近的方块作为目标
    if (!currentTarget) {
        currentTarget = getNearestBlock();
    }

    crow.update(currentTarget); // 更新乌鸦的位置
    crow.show();
    
    // 显示篮子
    basket.show();

    // 显示计时器和记分板（如果计时器可见）
    if (timerVisible) {
        let elapsed = millis() - countdownStart;
        let remaining = max(0, int((countdownDuration - elapsed) / 1000));
    
        timerBox.show(remaining);
        scoreboard.show();
    
        if (remaining > 0) {
            scoreActive = true;
        } else {
            scoreActive = false;
    
            if (!resultShown) {
                resultShown = true;

                if (playerScore > crowScore) {
                    endingImage = winImage;
                    gameEnded = true;
                } else if (crowScore > playerScore) {
                    endingImage = loseImage;
                    gameEnded = true;
                } else {
                    endingImage = tieImage;
                    gameEnded = true;
                }
            }
        }
    }
}
    

// 在鼠标按下时检查是否点击了方块
function mousePressed() {
    if (gameEnded) {
        // 只在失败或平局结局时允许重开
        if (endingImage === loseImage || endingImage === tieImage) {
            restartGame();  // 自定义的重置函数
        }
        return;
    }

    if (!introFinished) {
      if (currentIntroIndex < introImages.length - 1) {
        currentIntroIndex++;
      } else {
        introFinished = true;
        // 可以在此处初始化计时器或开启游戏元素
        startGame();
      }
      return;  // 不再触发后续点击事件（如激怒乌鸦等）
    }
    // 检查是否点击方块
    for (let i = 0; i < blocks.length; i++) {
        if (dist(mouseX, mouseY, blocks[i].x, blocks[i].y) < blocks[i].size / 2) {
            draggableBlock = blocks[i]; // 将方块设为当前拖动的方块
            break;
        }
    }

    clickCount++;

    if (clickCount % int(random(2, 5)) === 0) {
        // 满足随机次数条件时才触发加速
        crowAngry = true;
        crow.speedUp();
    
        // 2秒后逐渐恢复速度（你之前的机制）
        let restoreDuration = 2000;
        let steps = 20;
        let stepTime = restoreDuration / steps;
        let speedStep = (crow.speed - crowSpeed) / steps;
        let i = 0;
        let interval = setInterval(() => {
            crow.speed -= speedStep;
            i++;
            if (i >= steps) {
                clearInterval(interval);
                crow.speed = crowSpeed;
                crowAngry = false;
            }
        }, stepTime);
    }
    
}

// 在鼠标松开时，取消拖动
function mouseReleased() {
    draggableBlock = null; // 放开拖动的方块
}

// 修改获取最近方块的方法，排除篮子里的方块
function getNearestBlock() {
    let nearest = null;
    let minDist = Infinity;
    
    for (let block of blocks) {
        // 跳过篮子里的方块
        if (basket.contains(block)) continue;
        
        let d = dist(crow.x, crow.y, block.x, block.y);
        if (d < minDist) {
            minDist = d;
            nearest = block;
        }
    }
    return nearest;
}
class Crow {
    constructor() {
        this.x = 50;
        this.y = height / 2;
        this.size = 80;
        this.speed = crowSpeed;
        this.targetX = this.x;
        this.targetY = this.y;
        this.isAngry = false;
        this.angryStartTime = 0;
        this.speedRestoreStartTime = 0;
        this.lastDirection = 'right'; // 记录最后移动方向
        this.isMoving = false;
        this.lastMoveDirection = 'right'; // 记录最后移动方向
        this.prevX = this.x;
        this.prevY = this.y;
    }

    update(target) {
        // 保存上一帧位置
        this.prevX = this.x;
        this.prevY = this.y;
        
        // 检查是否太靠近篮子
        if (this.isTooCloseToBasket()) {
            currentTarget = null;
            this.leaveScreen();
            return;
        }

        if (target) {
            if (basket.contains(target)) {
                currentTarget = null;
                return;
            }
            
            // 计算移动方向
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let angle = atan2(dy, dx);
            
            // 更新位置
            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;
            
            // 修复这里：原代码缺少右括号 ▼▼▼
            this.isMoving = (abs(this.x - this.prevX) > 0.1 || (abs(this.y - this.prevY) > 0.1));
            
            if(this.isMoving) {
                if(this.x > this.prevX) this.lastMoveDirection = 'right';
                else if(this.x < this.prevX) this.lastMoveDirection = 'left';
            }
            
            // 根据移动方向选择动画
            this.updateAnimation(dx, dy);
        } else {
            // 没有目标时设为静止
            this.isMoving = false;
        }
    }
        
        updateAnimation(dx, dy) {
            // 静止时不更新动画 ▼▼▼
            if(!this.isMoving) return;
            // ▲▲▲
            
            // 确定主要移动方向
            if (abs(dx) > abs(dy)) {
                // 水平移动为主
                if (dx > 0) {
                    this.lastDirection = 'right';
                } else {
                    this.lastDirection = 'left';
                }
            } else {
                // 垂直移动为主
                if (dy > 0) {
                    this.lastDirection = 'down';
                } else {
                    this.lastDirection = 'up';
                }
            }
            
            // 更新当前动画
            currentAnimation = crowAnimations[this.lastDirection];
            
            // 更新动画帧
            if (millis() - lastFrameTime > frameInterval) {
                currentFrame = (currentFrame + 1) % currentAnimation.length;
                lastFrameTime = millis();
            }
        }
    
        show() {
  // 先绘制阴影（比乌鸦尺寸稍大、半透明黑色）
  // 根据乌鸦状态调整阴影
  const shadowSize = this.isAngry ? 20 : 10;
  const shadowOffset = map(this.speed, 2.5, 5, 5, 15);
  
  drawingContext.shadowColor = `rgba(0, 0, 0, ${this.isAngry ? 0.4 : 0.2})`;
  drawingContext.shadowBlur = shadowSize;
  drawingContext.shadowOffsetY = shadowOffset;
            // 新增：静止状态显示静态图片 ▼▼▼
            // 先绘制投影（在乌鸦本体之前）
   // 选择当前方向的阴影图
   let shadowImg = crowShadows[this.lastDirection];
   let offset = shadowOffsets[this.lastDirection];
   
   if (!this.isMoving) {
       shadowImg = this.lastMoveDirection === 'right' ? crowShadows.staticRight : crowShadows.staticLeft;
       offset = this.lastMoveDirection === 'right' ? shadowOffsets.staticRight : shadowOffsets.staticLeft;
   }
   
   if (shadowImg && shadowImg.width > 0) {
       const shadowScale = 0.8;
       const scale = getScaleFromY(this.y) * shadowScale;
       const shadowWidth = this.size * scale;
       const shadowHeight = shadowImg.height * (shadowWidth / shadowImg.width);
   
       imageMode(CENTER);
       tint(255, 180);
       image(
           shadowImg,
           this.x + offset.x,
           this.y + offset.y,
           shadowWidth,
           shadowHeight
       );
       noTint();
   }
   


    // 然后绘制乌鸦本体（原有代码保持不变）
            if(!this.isMoving) {
                let staticImg = this.lastMoveDirection === 'right' ? 
                    crowAnimations.staticRight : crowAnimations.staticLeft;
                    
                if(staticImg && staticImg.width > 0) {
                    let scale = getScaleFromY(this.y);
                    imageMode(CENTER);
                    image(staticImg, this.x, this.y, this.size * scale, this.size * scale);
                    imageMode(CORNER);
                    return;
                }
            }
            // ▲▲▲
            
            // 如果有动画帧可用，则显示动画
            if (currentAnimation.length > 0 && currentFrame < currentAnimation.length) {
                let scale = getScaleFromY(this.y);
                let img = currentAnimation[currentFrame];
                
                // 计算绘制尺寸
                let drawWidth = this.size * scale;
                let drawHeight = this.size * scale;
                
                // 根据方向调整绘制位置
                let drawX = this.x - drawWidth/2;
                let drawY = this.y - drawHeight/2;
                
                // 绘制图像
                image(img, drawX, drawY, drawWidth, drawHeight);
            } else {
                // 如果没有动画，显示默认圆形
                let scale = getScaleFromY(this.y);
                fill(50);
                noStroke();
                ellipse(this.x, this.y, (this.size * scale) / 2, (this.size * scale) / 2);
            }
            // 重置阴影设置（避免影响其他元素）
    drawingContext.shadowColor = 'transparent';
        }
        
    // ▼▼▼ 把下面这个新方法添加在这里 ▼▼▼
    isTooCloseToBasket() {
        let basketCenterX = basket.x + basket.width/2;
        let basketCenterY = basket.y + basket.height/2;
        let safeDistance = 100; // 安全距离，可以调整
        
        return dist(this.x, this.y, basketCenterX, basketCenterY) < safeDistance;
    }
    // ▲▲▲ 新增方法结束 ▲▲▲


    speedUp() {
        this.isAngry = true;
        this.angryStartTime = millis();
        this.speed = crowSpeed * 2; // 加速状态为基本速度的2倍
        this.speedRestoreStartTime = millis();
    }
    
    restoreSpeed() {
        if (this.isAngry && millis() - this.angryStartTime > 2000) {
            let elapsedTime = millis() - this.speedRestoreStartTime;
            if (elapsedTime < 2000) {
                this.speed = lerp(crowSpeed * 2, crowSpeed, elapsedTime / 2000);
            } else {
                this.isAngry = false;
                this.speed = crowSpeed; // 恢复基本速度
            }
        }
    }

    intersects(block) {
        return dist(this.x, this.y, block.x, block.y) < this.size / 2 + block.size / 2;
    }

    leaveScreen() {
        // 修改后的离开行为：远离篮子而不是屏幕边缘
        let basketCenterX = basket.x + basket.width/2;
        let basketCenterY = basket.y + basket.height/2;
        
        let angle = atan2(this.y - basketCenterY, this.x - basketCenterX);
        this.x += cos(angle) * this.speed * 2;
        this.y += sin(angle) * this.speed * 2;
        
        currentTarget = getNearestBlock();
    }

    getNearestEdge() {
        let left = {x: 0, y: this.y};
        let right = {x: width, y: this.y};
        let top = {x: this.x, y: 0};
        let bottom = {x: this.x, y: height};

        let leftDist = dist(this.x, this.y, left.x, left.y);
        let rightDist = dist(this.x, this.y, right.x, right.y);
        let topDist = dist(this.x, this.y, top.x, top.y);
        let bottomDist = dist(this.x, this.y, bottom.x, bottom.y);

        let minDist = min(leftDist, rightDist, topDist, bottomDist);

        if (minDist === leftDist) return left;
        if (minDist === rightDist) return right;
        if (minDist === topDist) return top;
        return bottom;
    }
}


class Block {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color; // 'red', 'green', 'blue' 或 'gold'
        this.size = blockSize / 2;
        this.birthTime = millis();
        this.fadeInDuration = 2000;
    }

    show() {
        let elapsed = millis() - this.birthTime;
        let alpha = map(elapsed, 0, this.fadeInDuration, 0, 255);
        alpha = constrain(alpha, 0, 255);
        
        let scale = getScaleFromY(this.y);
        let img = blockImages[this.color];
        
        if (img && img.width > 0) {
            // 使用图片绘制方块
            imageMode(CENTER);
            tint(255, alpha); // 应用淡入效果
            image(img, this.x, this.y, this.size * scale, this.size * scale);
            noTint(); // 重置tint
        } else {
            // 回退方案：原始彩色圆形
            let c = color(this.color);
            c.setAlpha(alpha);
            fill(c);
            noStroke();
            ellipse(this.x, this.y, this.size * scale);
        }
    }
}



function spawnBlock() {
    let blockX, blockY;
    let attempts = 0;
    const maxAttempts = 100; // 增加尝试次数
    const minDistanceFromCrow = 150; // 与乌鸦的最小距离
    
    // UI元素边界框（保持不变）
    const uiElements = [
        { x: basket.x, y: basket.y, w: basket.width, h: basket.height },
        { x: timerBox.x, y: timerBox.y, w: timerBox.width, h: timerBox.height },
        { x: scoreboard.x, y: scoreboard.y, w: scoreboard.width, h: scoreboard.height }
    ];
    
    // 通过循环寻找合适位置
    let validPosition = false;
    do {
        blockX = random(20, width - 20);
        blockY = random(20, height - 20);
        validPosition = true;
        
        // 1. 检查与乌鸦的距离
        if (dist(blockX, blockY, crow.x, crow.y) < minDistanceFromCrow) {
            validPosition = false;
            continue; // 跳过后续检查
        }
        
        // 2. 检查是否与UI元素重叠
        for (let ui of uiElements) {
            if (blockX > ui.x - blockSize && 
                blockX < ui.x + ui.w + blockSize &&
                blockY > ui.y - blockSize && 
                blockY < ui.y + ui.h + blockSize) {
                validPosition = false;
                break;
            }
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
            // 最终尝试：至少远离乌鸦50像素
            if (dist(blockX, blockY, crow.x, crow.y) < 50) {
                // 如果还是太近，就强制放在屏幕角落
                blockX = random() > 0.5 ? 30 : width - 30;
                blockY = random() > 0.5 ? 30 : height - 30;
            }
            break;
        }
    } while (!validPosition);

    let colorChoice = random(colors);
    blocks.push(new Block(blockX, blockY, colorChoice));
}


function getScaleFromY(y) {
    // 屏幕顶部 = 0.5倍，底部 = 1.5倍
    return map(y, 0, height, 0.5, 1.5);
}

class Basket {
    constructor() {
        this.width = 90;
        this.height = 60;
        this.x = 30;
        this.y = height - this.height - 30;
        this.img = null;
    }

    // 修改静态加载方法 ▼▼▼
    static loadImage() {
        // 将加载的图片存储在类属性上
        Basket.basketImg = loadImage('assets/basket.png'); 
    }
    // ▲▲▲

    // 修改show方法 ▼▼▼
    show() {
        // 使用Basket.basketImg而不是this.img
        if (Basket.basketImg && Basket.basketImg.width > 0) {
            imageMode(CORNER);
            image(Basket.basketImg, this.x, this.y, this.width, this.height);
        } else {
            fill(150, 50, 200);
            rect(this.x, this.y, this.width, this.height, 10);
            
            // 调试用 - 如果看到这个文字说明图片加载有问题
            fill(255);
            text("Basket Image Missing", this.x, this.y + 30);
        }
    }
    // ▲▲▲

    contains(block) {
        return block.x > this.x &&
               block.x < this.x + this.width &&
               block.y > this.y &&
               block.y < this.y + this.height;
    }
}

class TimerBox {
    constructor() {
        this.width = blockSize * 3;
        this.height = blockSize * 2;
        this.x = width - this.width - 30;
        this.y = height - this.height - 30;
        this.img = null; // 新增图片属性
    }
// 静态方法加载图片
static loadImage() {
    this.timerImg = loadImage('assets/timer_box.png');
}

show(remainingTime) {
    // 绘制背景（图片或回退矩形）
    if (TimerBox.timerImg && TimerBox.timerImg.width > 0) {
        imageMode(CORNER);
        image(TimerBox.timerImg, this.x, this.y, this.width, this.height);
    } else {
        fill(150, 50, 200);
        rect(this.x, this.y, this.width, this.height, 10);
    }

    // ======== 新增数字样式代码 ======== //
    textAlign(CENTER, CENTER);
    textStyle(BOLD); // 加粗字体
    textSize(20);    // 稍大字号
    
    // 文字阴影效果（先绘制阴影）
    fill(0, 100);   // 半透明黑色
    text(nf(remainingTime, 2), this.x + this.width/2 + 2, this.y + this.height/2 + 2);
    
    // 主文字（金色）
    fill(255, 132, 0); // 橘色
    text(nf(remainingTime, 2), this.x + this.width/2, this.y + this.height/2);
    // ======== 新增代码结束 ======== //
    
    // 重置文本样式（避免影响其他文本）
    textStyle(NORMAL);
    fill(255); // 恢复默认白色
}
}
// 修改Scoreboard类，添加活动状态指示
class Scoreboard {
    constructor() {
        this.width = 300;
        this.height = 60;
        this.x = width/2 - this.width/2;
        this.y = 30;
    }
    
    show() {
        // 玩家分数样式
        textSize(24);
        textAlign(RIGHT, CENTER);
        
        // 玩家分数 - 改为绿色
        fill(232, 200, 142); // 米黄
        text(playerScore, width/2 - 20, this.y + this.height/2);
        
        // 乌鸦分数 - 改为红色
        fill(232, 200, 142); // 米黄
        textAlign(LEFT, CENTER);
        text(crowScore, width/2 + 20, this.y + this.height/2);
        
        // 标签文字 - 改为白色
        textSize(14);
        fill(255); // 白色
        textAlign(CENTER, CENTER);
        text("You", width/2 - 60, this.y + 15);
        text("Crow", width/2 + 60, this.y + 15);
    }
}
function restartGame() {
    // 重置游戏状态
    gameEnded = false;
    resultShown = false;
    endingImage = null;

    blocks = [];
    currentTarget = null;
    draggableBlock = null;
    clickCount = 0;
    playerScore = 0;
    crowScore = 0;
    hasCrowEatenOnce = false;
    timerVisible = false;
    countdownStart = 0;
    countdownActive = false;
    scoreActive = false;
    goldenBlock = false;

    crow = new Crow();  // 重新生成乌鸦
}
