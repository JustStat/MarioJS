Mario.Character = function() {

    this.GroundInertia = 0.89;
    this.AirInertia = 0.89;

    this.RunTime = 0;
    this.OnGround = false;
    this.MayJump = false;
    this.JumpTime = 0;
    this.XJumpSpeed = 0;
    this.YJumpSpeed = 0;

    this.Width = 4;
    this.Height = 24;

    this.World = null;
    this.Facing = 0;

    this.IsDead = false;
    this.isFirstMove = true;

};

Mario.Character.prototype = new Mario.NotchSprite(null);

Mario.Character.prototype.Initialize = function(world) {
    this.World = world;
    this.X = 32;
    this.Y = 0;

    this.RunTime = 0;
    this.OnGround = false;
    this.MayJump = false;
    this.JumpTime = 0;
    this.XJumpSpeed = 0;
    this.YJumpSpeed = 0;

    this.Width = 4;
    this.Height = 24;

    this.World = world;
    this.Facing = 0;

    this.isFirstMove = true;
    this.XDeathPos = 0; this.YDeathPos = 0;


    this.Blink(true);
};


Mario.Character.prototype.Blink = function(on) {

    this.Image = Enjine.Resources.Images["smallMario"];
    this.XPicO = 8;
    this.YPicO = 15;
    this.PicWidth = this.PicHeight = 16;
};

Mario.Character.prototype.Move = function() {
    if (this.WinTime > 0) {
        this.WinTime++;
        this.Xa = 0;
        this.Ya = 0;
        return;
    }

    this.Visible = (((this.InvulerableTime / 2) | 0) & 1) === 0;

    var sideWaysSpeed = 0.6;

    if (this.Xa > 2) {
        this.Facing = 1;
    }
    if (this.Xa < -2) {
        this.Facing = -1;
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Up) || (this.JumpTime < 0 && !this.OnGround)) {
        if (this.JumpTime < 0) {
            this.Xa = this.XJumpSpeed;
            this.Ya = -this.JumpTime * this.YJumpSpeed;
            this.JumpTime++;
        } else if (this.OnGround && this.MayJump) {
            Enjine.Resources.PlaySound("jump");
            this.XJumpSpeed = 0;
            this.YJumpSpeed = -1.9;
            this.JumpTime = 7;
            this.Ya = this.JumpTime * this.YJumpSpeed;
            this.OnGround = false;
        } else if (this.MayJump) {
            Enjine.Resources.PlaySound("jump");
            this.XJumpSpeed = -this.Facing * 6;
            this.YJumpSpeed = -2;
            this.JumpTime = -6;
            this.Xa = this.XJumpSpeed;
            this.Ya = -this.JumpTime * this.YJumpSpeed;
            this.OnGround = false;
            this.Facing = -this.Facing;
        } else if (this.JumpTime > 0) {
            this.Xa += this.XJumpSpeed;
            this.Ya = this.JumpTime * this.YJumpSpeed;
            this.JumpTime--;
        }
    } else {
        this.JumpTime = 0;
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Left)) {
        this.isFirstMove = false;
        this.Xa -= sideWaysSpeed;
        if (this.JumpTime >= 0) {
            this.Facing = -1;
        }
    }

    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Right)) {
        this.isFirstMove = false;
        this.Xa += sideWaysSpeed;
        if (this.JumpTime >= 0) {
            this.Facing = 1;
        }
    }

    this.MayJump = (this.OnGround) && !Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Up);
    this.XFlip = (this.Facing === -1);
    this.RunTime += Math.abs(this.Xa) + 5;

    if (Math.abs(this.Xa) < 0.5) {
        this.RunTime = 0;
        this.Xa = 0;
    }

    this.CalcPic();

    this.OnGround = false;
    this.SubMove(this.Xa, 0);
    this.SubMove(0, this.Ya);
    if (this.Y > this.World.Level.Height * 16 + 16) {
        this.IsDead = true;
    }

    if (this.X < 0) {
        this.X = 0;
        this.Xa = 0;
    }

    if (this.X > this.World.Level.ExitX * 16) {
        this.IsDead = true;
    }

    if (this.X > this.World.Level.Width * 16) {
        this.X = this.World.Level.Width * 16;
        this.Xa = 0;
    }

    this.Ya *= 0.85;
    if (this.OnGround) {
        this.Xa *= this.GroundInertia;
    } else {
        this.Xa *= this.AirInertia;
    }

    if (!this.OnGround) {
        this.Ya += 3;
    }
};

Mario.Character.prototype.CalcPic = function() {
    var runFrame = 0, i = 0;

    runFrame = ((this.RunTime / 20) | 0) % 2;
    if (Math.abs(this.Xa) > 10) {
        runFrame += 2;
    }
    if (!this.OnGround) {
        if (Math.abs(this.Xa) > 10) {
            runFrame = 5;
        } else {
            runFrame = 4;
        }
    }

    if (this.OnGround && ((this.Facing === -1 && this.Xa > 0) || (this.Facing === 1 && this.Xa < 0))) {
        if (this.Xa > 1 || this.Xa < -1) {
            runFrame = 7;
        }
    }

    this.Height = 12;

    this.XPic = runFrame;
};

Mario.Character.prototype.SubMove = function(xa, ya) {
    var collide = false;

    while (xa > 8) {
        if (!this.SubMove(8, 0)) {
            return false;
        }
        xa -= 8;
    }
    while (xa < -8) {
        if (!this.SubMove(-8, 0)) {
            return false;
        }
        xa += 8;
    }
    while (ya > 8) {
        if (!this.SubMove(0, 8)) {
            return false;
        }
        ya -= 8;
    }
    while (ya < -8) {
        if (!this.SubMove(0, -8)) {
            return false;
        }
        ya += 8;
    }

    if (ya > 0) {
        if (this.IsBlocking(this.X + xa - this.Width, this.Y + ya, xa, 0)) {
            collide = true;
        } else if (this.IsBlocking(this.X + xa + this.Width, this.Y + ya, xa, 0)) {
            collide = true;
        } else if (this.IsBlocking(this.X + xa - this.Width, this.Y + ya + 1, xa, ya)) {
            collide = true;
        } else if (this.IsBlocking(this.X + xa + this.Width, this.Y + ya + 1, xa, ya)) {
            collide = true;
        }
    }
    if (ya < 0) {
        if (this.IsBlocking(this.X + xa, this.Y + ya - this.Height, xa, ya)) {
            collide = true;
        } else if (collide || this.IsBlocking(this.X + xa - this.Width, this.Y + ya - this.Height, xa, ya)) {
            collide = true;
        } else if (collide || this.IsBlocking(this.X + xa + this.Width, this.Y + ya - this.Height, xa, ya)) {
            collide = true;
        }
    }

    if (xa > 0) {
        if (this.IsBlocking(this.X + xa + this.Width, this.Y + ya - this.Height, xa, ya)) {
            collide = true;
        }

        if (this.IsBlocking(this.X + xa + this.Width, this.Y + ya - ((this.Height / 2) | 0), xa, ya)) {
            collide = true;
        }

        if (this.IsBlocking(this.X + xa + this.Width, this.Y + ya, xa, ya)) {
            collide = true;
        }
    }
    if (xa < 0) {
        if (this.IsBlocking(this.X + xa - this.Width, this.Y + ya - this.Height, xa, ya)) {
            collide = true;
        }

        if (this.IsBlocking(this.X + xa - this.Width, this.Y + ya - ((this.Height / 2) | 0), xa, ya)) {
            collide = true;
        }

        if (this.IsBlocking(this.X + xa - this.Width, this.Y + ya, xa, ya)) {
            collide = true;
        }
    }

    if (collide) {
        if (xa < 0) {
            this.X = (((this.X - this.Width) / 16) | 0) * 16 + this.Width;
            this.Xa = 0;
        }
        if (xa > 0) {
            this.X = (((this.X + this.Width) / 16 + 1) | 0) * 16 - this.Width - 1;
            this.Xa = 0;
        }
        if (ya < 0) {
            this.Y = (((this.Y - this.Height) / 16) | 0) * 16 + this.Height;
            this.JumpTime = 0;
            this.Ya = 0;
        }
        if (ya > 0) {
            this.Y = (((this.Y - 1) / 16 + 1) | 0) * 16 - 1;
            this.OnGround = true;
        }

        return false;
    } else {
        this.X += xa;
        this.Y += ya;
        return true;
    }
};

Mario.Character.prototype.IsBlocking = function(x, y, xa, ya) {
    var blocking = false, block = 0, xx = 0, yy = 0;

    x = (x / 16) | 0;
    y = (y / 16) | 0;
    if (x === ((this.X / 16) | 0) && y === ((this.Y / 16) | 0)) {
        return false;
    }

    block = this.World.Level.GetBlock(x, y);

    blocking = this.World.Level.IsBlocking(x, y, xa, ya);
    if (blocking && ya < 0) {
        this.World.Bump(x, y, false);
    }
    return blocking;
};


Mario.Character.prototype.Win = function() {
    this.XDeathPos = this.X | 0;
    this.YDeathPos = this.Y | 0;
    this.World.Paused = true;
    this.WinTime = 1;
    Enjine.Resources.PlaySound("exit");
};