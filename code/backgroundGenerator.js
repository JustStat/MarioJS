Mario.BackgroundGenerator = function(width, height, distant, type) {
    this.Width = width;
    this.Height = height;
    this.Distant = distant;
};

Mario.BackgroundGenerator.prototype = {
    SetValues: function(width, height, distant) {
        this.Width = width;
        this.Height = height;
        this.Distant = distant;
    },

    CreateLevel: function() {
        var level = new Mario.Level(this.Width, this.Height);
        this.GenerateOverground(level);
        return level;
    },
    
    GenerateOverground: function(level) {
        var range = this.Distant ? 4 : 6;
        var offs = this.Distant ? 2 : 1;
        var oh = Math.floor(Math.random() * range) + offs;
        var h = Math.floor(Math.random() * range) + offs;
        
        var x = 0, y = 0, h0 = 0, h1 = 0, s = 2;
        for (x = 0; x < this.Width; x++) {
            oh = h;
            while (oh === h) {
                h = Math.floor(Math.random() * range) + offs;
            }
            
            for (y = 0; y < this.Height; y++) {
                h0 = (oh < h) ? oh : h;
                h1 = (oh < h) ? h : oh;
                s = 2;
                if (y < h0) {
                    if (this.Distant){
                        s = 2;
                        if (y < 2) { s = y; }
                        level.SetBlock(x, y, 4 + s * 8);
                    } else {
                        level.SetBlock(x, y, 5);
                    }
                } else if (y === h0) {
                    s = h0 === h ? 0 : 1;
                    s += this.Distant ? 2 : 0;
                    level.SetBlock(x, y, s);
                } else if (y === h1) {
                    s = h0 === h ? 0 : 1;
                    s += this.Distant ? 2 : 0;
                    level.SetBlock(x, y, s + 16);
                } else {
                    s = (y > h1) ? 1 : 0;
                    if (h0 === oh) { s = 1 - s; }
                    s += this.Distant ? 2 : 0;
                    level.SetBlock(x, y, s + 8);
                }
            }
        }
    }
};