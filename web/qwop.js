// Taken from http://foddy.net/Athletics.html?webgl=true
// Formatted using http://jsbeautifier.org.
// Comments beginning with "CHANGE:" indicate places I
// have modified.
//
// Exposes an API via the window.qwopControl object.
// - wait(): get a Promise that resolves when the game has
//   loaded and a new episode has been started.
// - setButtons([boolean]): set the button mask.
//   The buttons are [Q, W, O, P].
// - step(): step the game by one timestep. Returns a
//   boolean indicating if the game is over.
// - reset(): start a new game. Should only be called
//   once the current game is over.
// - score(): get the current score.
// - screenshot(width, height): get a screenshot as a
//   base64-encoded PNG.
// - setStandingBonus(): set a bonus for every timestep
//   that the agent is not kneeling.

// CHANGE: global variables used to hook into the game.
TIMESTEP_DURATION = 1 / 15;
INIT_STEPS = 15;
KNEE_THRESHOLD = 6.7;
window.qwopControl = {
    'wait': function() {
        return new Promise((resolve) => {
            var interval;
            interval = setInterval(() => {
                if (!this.step) {
                    // Still loading.
                    return;
                }
                this.step();
                if (this.mainObject) {
                    this.mainObject.onmousedown({pos: {x: 100, y: 100}});
                    for (var i = 0; i < INIT_STEPS; ++i) {
                        this.step();
                    }
                    clearInterval(interval);
                    resolve();
                }
            }, 10);
        });
    },
    'setButtons': function(mask) {
        this.mainObject.QDown = mask[0];
        this.mainObject.WDown = mask[1];
        this.mainObject.ODown = mask[2];
        this.mainObject.PDown = mask[3];
    },
    'step': null,
    'reset': function() {
        // Early resets are useful for timestep limits.
        // if (!this.isDone) {
        //     throw Error('episode is not finished');
        // }
        this.isDone = false;
        this.totalBonus = 0;
        this.mainObject.oninputup('reset');
        this.setButtons([false, false, false, false]);
        for (var i = 0; i < INIT_STEPS; ++i) {
            this.step();
        }
    },
    'score': function() {
        return this.mainObject.score + this.totalBonus;
    },
    'screenshot': function(width, height) {
        var canvas = document.getElementsByTagName('canvas')[0];
        var dst = document.createElement('canvas');
        dst.width = width;
        dst.height = height;
        dst.getContext('2d').drawImage(canvas, 0, 0, width, height);
        var prefixLen = 'data:image/png;base64,'.length;
        return dst.toDataURL('image/png').slice(prefixLen);
    },
    'setStandingBonus': function(value) {
        this.standingBonus = value;
    },
    'mainObject': null,
    'timestamp': 0,
    'isDone': false,
    'totalBonus': 0,
    'standingBonus': 0,
    'leftKneeY': 0,
    'rightKneeY': 0
};

! function() {
    "use strict";

    function t(t, e) {
        function s() {}
        s.prototype = t;
        var i = new s;
        for (var n in e) i[n] = e[n];
        return e.toString !== Object.prototype.toString && (i.toString = e.toString), i
    }

    function e(t) {
        return t instanceof Array ? function() {
            return h.iter(t)
        } : "function" == typeof t.iterator ? s(t, t.iterator) : t.iterator
    }

    function s(t, e) {
        if (null == e) return null;
        null == e.__id__ && (e.__id__ = M++);
        var s;
        return null == t.hx__closures__ ? t.hx__closures__ = {} : s = t.hx__closures__[e.__id__], null == s && (s = function() {
            return s.method.apply(s.scope, arguments)
        }, s.scope = t, s.method = e, t.hx__closures__[e.__id__] = s), s
    }
    var i = {},
        n = function() {
            return A.Boot.__string_rec(this, "")
        },
        o = {};
    o.ID = function(t, e) {
        null == e && (e = ""), null == t && (t = ""), this.name = "", this.name = t, this.id = "" == e ? m.utils.uniqueid(null) : e
    }, i["luxe.ID"] = o.ID, o.ID.__name__ = !0, o.ID.prototype = {
        __class__: o.ID
    }, o.Component = function(t) {
        var e = "";
        null != t && null != t.name && (e = t.name), o.ID.call(this, "" == e ? m.utils.uniqueid(null) : e)
    }, i["luxe.Component"] = o.Component, o.Component.__name__ = !0, o.Component.__super__ = o.ID, o.Component.prototype = t(o.ID.prototype, {
        init: function() {},
        update: function() {},
        onadded: function() {},
        onremoved: function() {},
        onfixedupdate: function() {},
        onreset: function() {},
        ondestroy: function() {},
        _detach_entity: function() {
            null != this.get_entity()
        },
        _attach_entity: function() {
            null != this.get_entity()
        },
        set_entity: function(t) {
            return this._detach_entity(), this.entity = t, this._attach_entity(), this.get_entity()
        },
        get_entity: function() {
            return this.entity
        },
        entity_pos_change: function() {},
        entity_scale_change: function() {},
        entity_rotation_change: function() {},
        entity_origin_change: function() {},
        entity_parent_change: function() {},
        __class__: o.Component,
        __properties__: {
            set_entity: "set_entity",
            get_entity: "get_entity"
        }
    });
    var r = function(t) {
        this.type = 2, this.isBullet = !1, this.isAwake = !0, this.restitution = 0, this.friction = .2, this.density = 1, o.Component.call(this, t)
    };
    i.Box = r, r.__name__ = !0, r.__super__ = o.Component, r.prototype = t(o.Component.prototype, {
        onadded: function() {
            this.sprite = this.get_entity();
            var t = new p.dynamics.B2BodyDef;
            t.type = this.type, t.position.set(this.sprite.get_pos().x / l.worldScale, this.sprite.get_pos().y / l.worldScale);
            var e = new p.collision.shapes.B2PolygonShape;
            e.setAsBox(.5 * this.sprite.size.x / l.worldScale, .5 * this.sprite.size.y / l.worldScale);
            var s = new p.dynamics.B2FixtureDef;
            s.shape = e, s.density = this.density, s.friction = this.friction, s.restitution = this.restitution, s.filter.categoryBits = this.categoryBits, s.filter.maskBits = this.maskBits, this.body = this.world.createBody(t), this.body.createFixture(s), this.body.setBullet(this.isBullet), this.body.setAwake(this.isAwake), this.body.setUserData(this.userData)
        },
        setPosition: function(t, e) {
            null != this.body && this.body.setPosition(new p.common.math.B2Vec2(t, e))
        },
        getPosition: function() {
            return null != this.body ? this.body.getPosition() : new p.common.math.B2Vec2(0, 0)
        },
        getLinearVelocity: function() {
            return null != this.body ? this.body.getLinearVelocity() : new p.common.math.B2Vec2(0, 0)
        },
        setAngle: function(t) {
            null != this.body && this.body.setAngle(t)
        },
        applyTorque: function(t) {
            null != this.body && this.body.applyTorque(t)
        },
        getWorldCenter: function() {
            return null != this.body ? this.body.getWorldCenter() : new p.common.math.B2Vec2(0, 0)
        },
        getAngle: function() {
            return null != this.body ? this.body.getAngle() : 0
        },
        update: function() {
            null != this.body && (this.sprite.get_pos().set_x(this.body.getPosition().x * l.worldScale), this.sprite.get_pos().set_y(this.body.getPosition().y * l.worldScale), this.sprite.set_rotation_z(180 * this.body.getAngle() / Math.PI))
        },
        ondestroy: function() {
            this.world.destroyBody(this.body), o.Component.prototype.ondestroy.call(this)
        },
        init: function() {
            o.Component.prototype.init.call(this)
        },
        onremoved: function() {
            o.Component.prototype.onremoved.call(this)
        },
        __class__: r
    });
    var a = function(t, e) {
        e = e.split("u").join(""), this.r = new RegExp(t, e)
    };
    i.EReg = a, a.__name__ = !0, a.prototype = {
        match: function(t) {
            return this.r.global && (this.r.lastIndex = 0), this.r.m = this.r.exec(t), this.r.s = t, null != this.r.m
        },
        replace: function(t, e) {
            return t.replace(this.r, e)
        },
        __class__: a
    };
    var l = function() {};
    i.Globals = l, l.__name__ = !0;
    var h = function() {};
    i.HxOverrides = h, h.__name__ = !0, h.strDate = function(t) {
        var e = t.length;
        switch (e) {
            case 8:
                var s = t.split(":"),
                    i = new Date;
                return i.setTime(0), i.setUTCHours(s[0]), i.setUTCMinutes(s[1]), i.setUTCSeconds(s[2]), i;
            case 10:
                var n = t.split("-");
                return new Date(n[0], n[1] - 1, n[2], 0, 0, 0);
            case 19:
                var o = t.split(" "),
                    r = o[0].split("-"),
                    a = o[1].split(":");
                return new Date(r[0], r[1] - 1, r[2], a[0], a[1], a[2]);
            default:
                throw "Invalid date format : " + t
        }
    }, h.cca = function(t, e) {
        var s = t.charCodeAt(e);
        return s != s ? void 0 : s
    }, h.substr = function(t, e, s) {
        return null != e && 0 != e && null != s && 0 > s ? "" : (null == s && (s = t.length), 0 > e ? (e = t.length + e, 0 > e && (e = 0)) : 0 > s && (s = t.length + s - e), t.substr(e, s))
    }, h.indexOf = function(t, e, s) {
        var i = t.length;
        for (0 > s && (s += i, 0 > s && (s = 0)); i > s;) {
            if (t[s] === e) return s;
            s++
        }
        return -1
    }, h.remove = function(t, e) {
        var s = h.indexOf(t, e, 0);
        return -1 == s ? !1 : (t.splice(s, 1), !0)
    }, h.iter = function(t) {
        return {
            cur: 0,
            arr: t,
            hasNext: function() {
                return this.cur < this.arr.length
            },
            next: function() {
                return this.arr[this.cur++]
            }
        }
    };
    var c = function() {};
    i.Lambda = c, c.__name__ = !0, c.has = function(t, s) {
        for (var i = e(t)(); i.hasNext();) {
            var n = i.next();
            if (n == s) return !0
        }
        return !1
    }, c.count = function(t, s) {
        var i = 0;
        if (null == s)
            for (var n = e(t)(); n.hasNext();) {
                {
                    n.next()
                }
                i++
            } else
                for (var o = e(t)(); o.hasNext();) {
                    var r = o.next();
                    s(r) && i++
                }
        return i
    };
    var _ = function() {
        this.length = 0
    };
    i.List = _, _.__name__ = !0, _.prototype = {
        add: function(t) {
            var e = [t];
            null == this.h ? this.h = e : this.q[1] = e, this.q = e, this.length++
        },
        push: function(t) {
            var e = [t, this.h];
            this.h = e, null == this.q && (this.q = e), this.length++
        },
        remove: function(t) {
            for (var e = null, s = this.h; null != s;) {
                if (s[0] == t) return null == e ? this.h = s[1] : e[1] = s[1], this.q == s && (this.q = e), this.length--, !0;
                e = s, s = s[1]
            }
            return !1
        },
        iterator: function() {
            return {
                h: this.h,
                hasNext: function() {
                    return null != this.h
                },
                next: function() {
                    if (null == this.h) return null;
                    var t = this.h[0];
                    return this.h = this.h[1], t
                }
            }
        },
        __class__: _
    };
    var m = function() {};
    i.Luxe = m, m.__name__ = !0, m.__properties__ = {
        set_alpha: "set_alpha",
        get_alpha: "get_alpha",
        set_cur_frame_start: "set_cur_frame_start",
        get_cur_frame_start: "get_cur_frame_start",
        set_current_time: "set_current_time",
        get_current_time: "get_current_time",
        set_last_frame_start: "set_last_frame_start",
        get_last_frame_start: "get_last_frame_start",
        set_delta_sim: "set_delta_sim",
        get_delta_sim: "get_delta_sim",
        set_dt: "set_dt",
        get_dt: "get_dt",
        set_max_frame_time: "set_max_frame_time",
        get_max_frame_time: "get_max_frame_time",
        set_update_rate: "set_update_rate",
        get_update_rate: "get_update_rate",
        set_fixed_delta: "set_fixed_delta",
        get_fixed_delta: "get_fixed_delta",
        set_timescale: "set_timescale",
        get_timescale: "get_timescale",
        get_screen: "get_screen",
        get_time: "get_time",
        get_snow: "get_snow"
    }, m.on = function(t, e) {
        m.core.emitter.on(t, e)
    }, m.off = function(t, e) {
        return m.core.emitter.off(t, e)
    }, m.next = function(t) {
        C.Snow.next(t)
    }, m.shutdown = function() {
        m.core.shutdown()
    }, m.showConsole = function(t) {
        m.core.show_console(t)
    }, m.get_snow = function() {
        return m.core.app
    }, m.get_screen = function() {
        return m.core.screen
    }, m.get_time = function() {
        return C.Snow.core.timestamp()
    }, m.get_timescale = function() {
        return m.core.timescale
    }, m.get_fixed_delta = function() {
        return m.core.fixed_delta
    }, m.get_update_rate = function() {
        return m.core.update_rate
    }, m.get_max_frame_time = function() {
        return m.core.max_frame_time
    }, m.get_dt = function() {
        return m.core.delta_time
    }, m.get_delta_sim = function() {
        return m.core.delta_sim
    }, m.get_last_frame_start = function() {
        return m.core.last_frame_start
    }, m.get_current_time = function() {
        return m.core.current_time
    }, m.get_cur_frame_start = function() {
        return m.core.cur_frame_start
    }, m.get_alpha = function() {
        return m.core.alpha
    }, m.set_timescale = function(t) {
        return m.core.timescale = t
    }, m.set_fixed_delta = function(t) {
        return m.core.fixed_delta = t
    }, m.set_update_rate = function(t) {
        return m.core.update_rate = t
    }, m.set_max_frame_time = function(t) {
        return m.core.max_frame_time = t
    }, m.set_dt = function(t) {
        return m.core.delta_time = t
    }, m.set_delta_sim = function(t) {
        return m.core.delta_sim = t
    }, m.set_last_frame_start = function(t) {
        return m.core.last_frame_start = t
    }, m.set_current_time = function(t) {
        return m.core.current_time = t
    }, m.set_cur_frame_start = function(t) {
        return m.core.cur_frame_start = t
    }, m.set_alpha = function(t) {
        return m.core.alpha = t
    };
    var u = function() {};
    i.LuxeApp = u, u.__name__ = !0, u.main = function() {
        u._conf = {
            window: {
                width: 960,
                height: 640,
                fullscreen: !1,
                resizable: !0,
                borderless: !1,
                title: "luxe app"
            }
        }, u._snow = new C.Snow, u._game = new d, u._core = new o.Core(u._game, u._conf);
        var t = {
            has_loop: !0,
            config_custom_assets: !0,
            config_custom_runtime: !0,
            config_runtime_path: "config.json",
            config_assets_path: "manifest",
            app_package: "net.foddy.qwop"
        };
        u._snow.init(t, u._core)
    }, o.Emitter = function() {
        this._checking = !1, this._to_remove = new _, this.connected = new _, this.bindings = new S.ds.IntMap
    }, i["luxe.Emitter"] = o.Emitter, o.Emitter.__name__ = !0, o.Emitter.prototype = {
        emit: function(t, e) {
            this._check();
            var s = this.bindings.get(t);
            if (null != s && s.length > 0)
                for (var i = 0; i < s.length;) {
                    var n = s[i];
                    ++i, n(e)
                }
            this._check()
        },
        on: function(t, e) {
            if (this._check(), this.bindings.exists(t)) {
                var s = this.bindings.get(t); - 1 == h.indexOf(s, e, 0) && (s.push(e), this.connected.push({
                    handler: e,
                    event: t
                }))
            } else this.bindings.set(t, [e]), this.connected.push({
                handler: e,
                event: t
            })
        },
        off: function(t, e) {
            this._check();
            var s = !1;
            if (this.bindings.exists(t)) {
                this._to_remove.push({
                    event: t,
                    handler: e
                });
                for (var i = this.connected.iterator(); i.hasNext();) {
                    var n = i.next();
                    n.event == t && n.handler == e && this.connected.remove(n)
                }
                s = !0
            }
            return s
        },
        _check: function() {
            if (!this._checking) {
                if (this._checking = !0, this._to_remove.length > 0) {
                    for (var t = this._to_remove.iterator(); t.hasNext();) {
                        var e = t.next(),
                            s = this.bindings.get(e.event);
                        h.remove(s, e.handler), 0 == s.length && this.bindings.remove(e.event)
                    }
                    this._to_remove = null, this._to_remove = new _
                }
                this._checking = !1
            }
        },
        __class__: o.Emitter
    }, o.Game = function() {
        o.Emitter.call(this)
    }, i["luxe.Game"] = o.Game, o.Game.__name__ = !0, o.Game.__super__ = o.Emitter, o.Game.prototype = t(o.Emitter.prototype, {
        config: function(t) {
            return t
        },
        ready: function() {},
        update: function() {},
        onevent: function() {},
        ondestroy: function() {},
        onprerender: function() {},
        onrender: function() {},
        onpostrender: function() {},
        oninputdown: function() {},
        oninputup: function() {},
        onmousedown: function() {},
        onmouseup: function() {},
        onmousewheel: function() {},
        onmousemove: function() {},
        onkeydown: function() {},
        onkeyup: function() {},
        ontextinput: function() {},
        ontouchdown: function() {},
        ontouchup: function() {},
        ontouchmove: function() {},
        ongamepadaxis: function() {},
        ongamepaddown: function() {},
        ongamepadup: function() {},
        ongamepaddevice: function() {},
        onwindowmoved: function() {},
        onwindowresized: function() {},
        onwindowsized: function() {},
        onwindowminimized: function() {},
        onwindowrestored: function() {},
        __class__: o.Game
    });
    var d = function() {
        this.world_camera_offset = -14, this.highScore = 0, this.scoreTime = 0, this.score = 0, o.Game.call(this)
    };
    i.Main = d, d.__name__ = !0, d.__super__ = o.Game, d.prototype = t(o.Game.prototype, {
        config: function(t) {
            return t.window.title = "QWOP", t.window.resizable = !1, t.web.prevent_default_keys = [C.system.input.Keycodes.space], t.window.width = 640, t.window.height = 400, t
        },
        ready: function() {
            var t = window.document.getElementById("gameContent"),
                e = window.document.getElementById("window1");
            t.appendChild(e), this.gameOver = !1, this.gameEnded = !1, this.jumped = !1, this.jumpLanded = !1, this.fallen = !1, this.pause = !1, this.helpUp = !1, this.mute = !1, m.core.frame_time = .03333333333333333, m.core.update_rate = 0, m.core.render_rate = -1, this.QDown = this.WDown = this.ODown = this.PDown = !1, this.QID = this.WID = this.OID = this.PID = 0, this.mouseClicked = "", this.accelerometer = new I.Vector(0, 0, 0), this.initialAcceleration = new I.Vector(0, 0, 0);
            var i = new o.Parcel({
                bytes: [{
                    id: "assets/assetbundle.parcel"
                }]
            });
            new o.ParcelProgress({
                parcel: i,
                background: new I.Color(0, 0, 0, .85),
                bar_border: new I.Color(1, .5, 0, 1),
                oncomplete: s(this, this.pack_loaded)
            }), this.world_camera = new o.Camera({
                name: "camera1"
            }), this.world_camera.set_viewport(new I.Rectangle(0, 0, l.screenWidth, l.screenHeight)), this.world_camera.get_pos().set_x(-10 * l.worldScale), this.world_camera.get_pos().set_y(-200), this.world_camera.set_size_mode(o.SizeMode.fit), this.ui_camera = new o.Camera({
                name: "ui_camera"
            }), this.ui_camera.set_viewport(new I.Rectangle(0, 0, l.screenWidth, l.screenHeight)), this.world_camera.set_size_mode(o.SizeMode.fit), this.ui_batcher = m.renderer.create_batcher({
                name: "uiviewport",
                camera: this.ui_camera.view
            }), this.world_batcher = m.renderer.create_batcher({
                name: "viewport1",
                camera: this.world_camera.view
            }), this.bg_batcher = m.renderer.create_batcher({
                name: "bgviewport",
                camera: this.ui_camera.view
            }), this.doneLoading = !1, i.load();
            var n = new p.common.math.B2Vec2(0, l.gravity),
                r = !0;
            this.m_world = new p.dynamics.B2World(n, r), this.m_world.setContactListener(new y(this)), this.firstClick = !1, this.speedArray = new Array
        },
        pack_loaded: function() {
            var t = new g("assets/assetbundle.parcel");
            t.preload().then(s(this, this.assets_loaded))
        },
        load_assets: function() {
            var t = new o.Parcel({
                jsons: [{
                    id: "assets/UISprites.json"
                }, {
                    id: "assets/playercolor.json"
                }],
                textures: [{
                    id: "assets/playercolor.png"
                }, {
                    id: "assets/playerbump.jpg"
                }, {
                    id: "assets/sprintbg.jpg"
                }, {
                    id: "assets/underground.png"
                }, {
                    id: "assets/UISprites.png"
                }, {
                    id: "assets/skingradient.png"
                }, {
                    id: "assets/bodygradient.png"
                }, {
                    id: "assets/sand.png"
                }, {
                    id: "assets/sandtape.png"
                }, {
                    id: "assets/sky.png"
                }],
                sounds: [{
                    id: "assets/crunch.wav",
                    name: "crunch",
                    is_stream: !1
                }, {
                    id: "assets/Ehh.wav",
                    name: "ehh",
                    is_stream: !1
                }, {
                    id: "assets/cof2.wav",
                    name: "music",
                    is_stream: !1
                }],
                fonts: [{
                    id: "assets/font/mundo36.fnt"
                }, {
                    id: "assets/font/mundo18.fnt"
                }]
            });
            new o.ParcelProgress({
                parcel: t,
                oncomplete: s(this, this.assets_loaded)
            }), t.load()
        },
        assets_loaded: function() {
            this.bevelShaderBody = m.resources.cache.get("bevelShaderBody"), this.bevelShaderHead = m.resources.cache.get("bevelShaderHead"), this.bevelShaderLeftArm = m.resources.cache.get("bevelShaderLeftArm"), this.bevelShaderRightArm = m.resources.cache.get("bevelShaderRightArm"), this.bevelShaderLeftForearm = m.resources.cache.get("bevelShaderLeftForearm"), this.bevelShaderRightForearm = m.resources.cache.get("bevelShaderRightForearm"), this.bevelShaderLeftThigh = m.resources.cache.get("bevelShaderLeftThigh"), this.bevelShaderRightThigh = m.resources.cache.get("bevelShaderRightThigh"), this.bevelShaderLeftCalf = m.resources.cache.get("bevelShaderLeftCalf"), this.bevelShaderRightCalf = m.resources.cache.get("bevelShaderRightCalf");
            var t = m.resources.cache.get("assets/playerbump.jpg"),
                e = m.resources.cache.get("assets/skingradient.png"),
                s = m.resources.cache.get("assets/bodygradient.png");
            e.set_clamp_s(33071), e.set_clamp_t(33071), s.set_clamp_s(33071), s.set_clamp_t(33071), t.slot = 1, e.slot = 2, s.slot = 2, this.bevelShaderBody.set_texture("tex1", t), this.bevelShaderHead.set_texture("tex1", t), this.bevelShaderLeftArm.set_texture("tex1", t), this.bevelShaderRightArm.set_texture("tex1", t), this.bevelShaderLeftForearm.set_texture("tex1", t), this.bevelShaderRightForearm.set_texture("tex1", t), this.bevelShaderLeftThigh.set_texture("tex1", t), this.bevelShaderRightThigh.set_texture("tex1", t), this.bevelShaderLeftCalf.set_texture("tex1", t), this.bevelShaderRightCalf.set_texture("tex1", t), this.bevelShaderBody.set_texture("tex2", s), this.bevelShaderHead.set_texture("tex2", e), this.bevelShaderLeftArm.set_texture("tex2", e), this.bevelShaderRightArm.set_texture("tex2", e), this.bevelShaderLeftForearm.set_texture("tex2", e), this.bevelShaderRightForearm.set_texture("tex2", e), this.bevelShaderLeftThigh.set_texture("tex2", e), this.bevelShaderRightThigh.set_texture("tex2", e), this.bevelShaderLeftCalf.set_texture("tex2", e), this.bevelShaderRightCalf.set_texture("tex2", e), this.bevelShaderBody.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderHead.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderLeftArm.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderRightArm.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderLeftForearm.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderRightForearm.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderLeftThigh.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderRightThigh.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderLeftCalf.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.bevelShaderRightCalf.set_vector2("screenRes", new I.Vector(t.width, t.height)), this.ui_batcher.set_layer(2), this.bg_batcher.set_layer(-2), this.player_atlas_json = m.resources.cache.get("assets/playercolor.json").asset.json, this.ui_atlas_json = m.resources.cache.get("assets/UISprites.json").asset.json, this.atlasImage = m.resources.cache.get("assets/playercolor.png"), this.uiAtlasImage = m.resources.cache.get("assets/UISprites.png"), this.uiData = o.importers.texturepacker.TexturePackerJSON.parse(this.ui_atlas_json), this.create_world(), this.create_player(), this.create_ui(), this.connect_input(), m.audio.on("music", "load", function() {
                m.audio.loop("music"), m.audio.volume("music", 0)
            }), this.doneLoading = !0

            // CHANGE: now that we are loaded, we can be
            // controlled by an agent.
            window.qwopControl.mainObject = this;
        },
        create_world: function() {
            var t = 640,
                e = 400,
                s = m.resources.cache.get("assets/sprintbg.jpg");
            s.set_clamp_s(10497); {
                var i = (new o.Sprite({
                        name: "background",
                        texture: s,
                        pos: new I.Vector(0, -16),
                        batcher: this.bg_batcher,
                        size: new I.Vector(t, e),
                        depth: -10,
                        uv: new I.Rectangle(0, 0, t, e),
                        centered: !1
                    }), m.resources.cache.get("assets/sky.png")),
                    n = m.resources.cache.get("skyShader");
                new o.Sprite({
                    name: "sky",
                    texture: i,
                    pos: new I.Vector(-31 * l.worldScale, -30 * l.worldScale),
                    batcher: this.world_batcher,
                    depth: -11,
                    shader: n
                })
            }
            this.world_camera.bounds = new I.Rectangle(-1200, -800, 800 + l.levelSize + 93, 1600), this.floorSprites = new Array;
            var a = m.resources.cache.get("assets/underground.png");
            a.set_clamp_s(10497);
            for (var h = 0; 3 > h;) {
                var c = h++,
                    _ = new o.Sprite({
                        name: "seg" + c,
                        size: new I.Vector(l.screenWidth, a.height),
                        uv: new I.Rectangle(0, 0, l.screenWidth, a.height),
                        batcher: this.world_batcher,
                        depth: -10,
                        centered: !0,
                        texture: a
                    }),
                    u = new r({
                        name: "physicsBody"
                    });
                u.world = this.m_world, u.categoryBits = 1, u.maskBits = 65535, u.friction = .2, u.density = 30, u.userData = "track", u.type = 0, u.restitution = 0, _.component_count++, _._components.add(u);
                var d = _._components.get("physicsBody", !1);
                d.setPosition(c * l.screenWidth / l.worldScale, 10.74275), d.setAngle(0), this.floorSprites.push(_)
            }
            var p = this.uiData.frames[0];
            this.block = new o.Sprite({
                name: "block",
                size: new I.Vector(p.spriteSourceSize.w, p.spriteSourceSize.h),
                uv: p.uv,
                batcher: this.world_batcher,
                depth: -10,
                centered: !0,
                texture: this.uiAtlasImage
            });
            var y = new r({
                name: "physicsBody"
            });
            y.world = this.m_world, y.categoryBits = 1, y.maskBits = 65535, y.friction = .2, y.type = 0, y.restitution = 0, y.density = l.densityFactor, this.block.add(y);
            var f = this.block._components.get("physicsBody", !1);
            f.setPosition(-39.996249999999996, 2.10625), f.setAngle(0), p = this.uiData.frames[17];
            var g = new o.Sprite({
                name: "startingLine",
                pos: new I.Vector(90, 144),
                size: new I.Vector(p.spriteSourceSize.w, .7 * p.spriteSourceSize.h),
                uv: p.uv,
                batcher: this.world_batcher,
                texture: this.uiAtlasImage
            });
            this.hsLine = new o.Sprite({
                name: "highScoreLine",
                pos: new I.Vector(-2050, g.get_pos().y),
                size: new I.Vector(p.spriteSourceSize.w, .7 * p.spriteSourceSize.h),
                uv: p.uv,
                batcher: this.world_batcher,
                texture: this.uiAtlasImage
            }), p = this.uiData.frames[16];
            new o.Sprite({
                name: "sandpitBoard",
                pos: new I.Vector(l.sandPitAt - .5 * p.spriteSourceSize.w, 155),
                size: new I.Vector(.5 * p.spriteSourceSize.w, .5 * p.spriteSourceSize.h),
                uv: p.uv,
                batcher: this.world_batcher,
                texture: this.uiAtlasImage
            });
            p = this.uiData.frames[24];
            var v = (new o.Sprite({
                name: "sandpitSandHead",
                pos: new I.Vector(l.sandPitAt, 188.5),
                size: new I.Vector(p.spriteSourceSize.w, p.spriteSourceSize.h),
                uv: p.uv,
                depth: -2,
                batcher: this.world_batcher,
                texture: this.uiAtlasImage
            }), m.resources.cache.get("assets/sand.png"));
            v.set_clamp_s(10497);
            var x = (new o.Sprite({
                name: "sandpitSandBody",
                texture: v,
                pos: new I.Vector(l.sandPitAt - 6, 176),
                batcher: this.world_batcher,
                size: new I.Vector(2e3, v.height),
                depth: -1,
                uv: new I.Rectangle(0, 0, 2e3, v.height),
                centered: !1
            }), m.resources.cache.get("assets/sandtape.png"));
            x.set_clamp_s(10497);
            new o.Sprite({
                name: "sandpitTape",
                texture: x,
                pos: new I.Vector(l.sandPitAt - 84, 160),
                batcher: this.world_batcher,
                size: new I.Vector(2e3, x.height),
                depth: -2,
                uv: new I.Rectangle(0, 0, 2e3, x.height),
                centered: !1
            })
        },
        create_ui: function() {
            var t = m.resources.cache.get("assets/font/mundo36.fnt"),
                e = m.resources.cache.get("assets/font/mundo18.fnt");
            this.scoreText = new o.Text({
                text: "" + this.score,
                align: 2,
                pos: new I.Vector(l.screenWidth / 2, 18),
                point_size: 36,
                batcher: this.ui_batcher,
                font: t
            }), this.bestText = new o.Text({
                text: "",
                align: 0,
                pos: new I.Vector(34, 2),
                point_size: 18,
                batcher: this.ui_batcher,
                font: e
            }), this.bestLineText = new o.Text({
                text: "Best: " + this.score + "m",
                align: 2,
                pos: new I.Vector(-9e3, 70),
                point_size: 28,
                batcher: this.world_batcher,
                font: t
            }), this.gameOverText = new o.Text({
                text: "0.0 metres",
                align: 2,
                pos: new I.Vector(-9e3, 70),
                point_size: 24,
                batcher: this.world_batcher,
                depth: 2100,
                font: t
            }); {
                var s = this.uiData.frames[2];
                new o.Sprite({
                    name: "copyright",
                    pos: new I.Vector(.5 * l.screenWidth, .5 * s.spriteSourceSize.h),
                    size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                    uv: s.uv,
                    batcher: this.ui_batcher,
                    texture: this.uiAtlasImage
                })
            }
            s = this.uiData.frames[1];
            new o.Sprite({
                name: "calves",
                pos: new I.Vector(.5 * l.screenWidth + 248, 85),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                texture: this.uiAtlasImage
            });
            s = this.uiData.frames[18];
            new o.Sprite({
                name: "thighs",
                pos: new I.Vector(.5 * l.screenWidth - 248, 85),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                texture: this.uiAtlasImage
            });
            s = this.uiData.frames[15], this.QKeySprite = new o.Sprite({
                name: "QKeySprite",
                pos: new I.Vector(.5 * l.screenWidth - 274 + .5, 46.5),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !0,
                texture: this.uiAtlasImage
            }), s = this.uiData.frames[19], this.WKeySprite = new o.Sprite({
                name: "WKeySprite",
                pos: new I.Vector(.5 * l.screenWidth - 274 + .5 + 52, 46.5),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !0,
                texture: this.uiAtlasImage
            }), s = this.uiData.frames[11], this.OKeySprite = new o.Sprite({
                name: "OKeySprite",
                pos: new I.Vector(.5 * l.screenWidth + 274 + .5 - 52, 46.5),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !0,
                texture: this.uiAtlasImage
            }), s = this.uiData.frames[13], this.PKeySprite = new o.Sprite({
                name: "PKeySprite",
                pos: new I.Vector(.5 * l.screenWidth + 274 + .5, 46.5),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !0,
                texture: this.uiAtlasImage
            }), this.PButton = new o.Sprite({
                name: "PButton",
                pos: new I.Vector(this.PKeySprite.get_pos().x + .4 * this.PKeySprite.size.x, this.PKeySprite.get_pos().y + .4 * this.PKeySprite.size.y),
                size: new I.Vector(2 * this.PKeySprite.size.x, 2 * this.PKeySprite.size.y),
                batcher: this.ui_batcher,
                centered: !0,
                visible: !1
            }), this.OButton = new o.Sprite({
                name: "OButton",
                pos: new I.Vector(this.OKeySprite.get_pos().x - .4 * this.OKeySprite.size.x, this.OKeySprite.get_pos().y + .4 * this.OKeySprite.size.y),
                size: new I.Vector(2 * this.OKeySprite.size.x, 2 * this.OKeySprite.size.y),
                batcher: this.ui_batcher,
                centered: !0,
                visible: !1
            }), this.WButton = new o.Sprite({
                name: "WButton",
                pos: new I.Vector(this.WKeySprite.get_pos().x + .4 * this.WKeySprite.size.x, this.WKeySprite.get_pos().y + .4 * this.WKeySprite.size.y),
                size: new I.Vector(2 * this.WKeySprite.size.x, 2 * this.WKeySprite.size.y),
                batcher: this.ui_batcher,
                centered: !0,
                visible: !1
            }), this.QButton = new o.Sprite({
                name: "QButton",
                pos: new I.Vector(this.QKeySprite.get_pos().x - .4 * this.QKeySprite.size.x, this.QKeySprite.get_pos().y + .4 * this.QKeySprite.size.y),
                size: new I.Vector(2 * this.QKeySprite.size.x, 2 * this.QKeySprite.size.y),
                batcher: this.ui_batcher,
                centered: !0,
                visible: !1
            }), s = this.uiData.frames[21], this.burst = new o.Sprite({
                name: "burst",
                pos: new I.Vector(-2e3, -2e3),
                size: new I.Vector(20, 20),
                uv: s.uv,
                depth: 200,
                batcher: this.world_batcher,
                centered: !0,
                texture: this.uiAtlasImage
            }), this.blackSquare = new o.Sprite({
                name: "blackSquare",
                pos: new I.Vector(this.world_camera.get_pos().x, this.world_camera.get_pos().y),
                size: new I.Vector(l.screenWidth, l.screenHeight),
                color: new I.Color(0, 0, 0, .6),
                centered: !1,
                batcher: this.world_batcher,
                depth: 2e3
            }), s = this.uiData.frames[6], this.intro = new o.Sprite({
                name: "intro",
                pos: new I.Vector(this.world_camera.get_pos().x + .5 * l.screenWidth, this.world_camera.get_pos().y + .5 * l.screenHeight),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.world_batcher,
                centered: !0,
                texture: this.uiAtlasImage,
                depth: 2001
            }), s = this.uiData.frames[3], this.fallenEnding = new o.Sprite({
                name: "fallenEnding",
                pos: new I.Vector(-1e4, -1e4),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.world_batcher,
                centered: !0,
                texture: this.uiAtlasImage,
                depth: 2001
            }), s = this.uiData.frames[7], this.jumpEnding = new o.Sprite({
                name: "jumpEnding",
                pos: new I.Vector(-1e4, -1e4),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.world_batcher,
                centered: !0,
                texture: this.uiAtlasImage,
                depth: 2001
            }), s = this.uiData.frames[5], this.help = new o.Sprite({
                name: "help",
                pos: new I.Vector(-1e4, -1e4),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.world_batcher,
                centered: !0,
                texture: this.uiAtlasImage,
                depth: 2001
            }), s = this.uiData.frames[4], this.helpButton = new o.Sprite({
                name: "helpButton",
                pos: new I.Vector(-10, 2),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !1,
                texture: this.uiAtlasImage,
                depth: 2001
            }), s = this.uiData.frames[8], this.muteButton = new o.Sprite({
                name: "muteButton",
                pos: new I.Vector(l.screenWidth - 22, 2),
                size: new I.Vector(s.spriteSourceSize.w, s.spriteSourceSize.h),
                uv: s.uv,
                batcher: this.ui_batcher,
                centered: !1,
                texture: this.uiAtlasImage,
                depth: 2001
            })
        },
        endGame: function() {
            // CHANGE: note the end of an episode.
            window.qwopControl.isDone = true;

            null != this.rightHip && (this.rightHip.setMotorSpeed(0), this.rightHip.enableMotor(!1), this.leftHip.setMotorSpeed(0), this.leftHip.enableMotor(!1), this.rightKnee.enableLimit(!1), this.rightKnee.enableMotor(!1), this.leftKnee.enableLimit(!1), this.leftKnee.enableMotor(!1), this.rightShoulder.enableLimit(!1), this.rightShoulder.enableMotor(!1), this.leftShoulder.enableLimit(!1), this.leftShoulder.enableMotor(!1)), 0 == this.gameEnded && 1 == this.jumpLanded ? (this.jumpEnding.set_pos(new I.Vector(this.world_camera.get_pos().x + .5 * l.screenWidth, this.world_camera.get_pos().y + .5 * l.screenHeight)), this.gameOverText.set_text("" + this.score + " metres in " + Math.round(this.scoreTime) / 10 + " seconds"), this.gameOverText.set_pos(new I.Vector(this.jumpEnding.get_pos().x, this.jumpEnding.get_pos().y + 22)), this.gameEnded = !0) : 0 == this.gameEnded && 0 == this.jumpLanded && (this.fallenEnding.set_pos(new I.Vector(this.world_camera.get_pos().x + .5 * l.screenWidth, this.world_camera.get_pos().y + .5 * l.screenHeight)), this.gameOverText.set_text("" + this.score + " metres"), this.gameOverText.set_pos(new I.Vector(this.fallenEnding.get_pos().x, this.fallenEnding.get_pos().y - 10)), this.gameEnded = !0)
        },
        reset: function() {
            this.score = 0, this.scoreTime = 0, this.bestText.set_text("Best: " + this.highScore + "m"), this.world_camera.get_pos().set_x(-10 * l.worldScale), this.world_camera.get_pos().set_y(-200), this.ui_camera.get_pos().set_x(0), this.ui_camera.get_pos().set_y(0), this.m_world.destroyJoint(this.neck), this.m_world.destroyJoint(this.leftShoulder), this.m_world.destroyJoint(this.leftElbow), this.m_world.destroyJoint(this.leftHip), this.m_world.destroyJoint(this.leftKnee), this.m_world.destroyJoint(this.leftAnkle), this.m_world.destroyJoint(this.rightShoulder), this.m_world.destroyJoint(this.rightElbow), this.m_world.destroyJoint(this.rightHip), this.m_world.destroyJoint(this.rightKnee), this.m_world.destroyJoint(this.rightAnkle), null != this.hurdleJoint && (this.m_world.destroyJoint(this.hurdleJoint), this.hurdleJoint = null, this.hurdleBase.destroy(), this.hurdleTop.destroy()), this.torso.destroy(), this.head.destroy(), this.leftArm.destroy(), this.leftForearm.destroy(), this.leftThigh.destroy(), this.leftCalf.destroy(), this.leftFoot.destroy(), this.rightArm.destroy(), this.rightForearm.destroy(), this.rightThigh.destroy(), this.rightCalf.destroy(), this.rightFoot.destroy(), this.world_camera.get_pos().set_x(this.world_camera_offset * l.worldScale), this.m_world.setGravity(new p.common.math.B2Vec2(0, l.gravity)), this.fallenEnding.set_pos(new I.Vector(-1e4, -1e4)), this.jumpEnding.set_pos(new I.Vector(-1e4, -1e4)), this.help.set_pos(new I.Vector(-1e4, -1e4)), this.blackSquare.set_pos(new I.Vector(-1e4, -1e4)), this.gameOverText.set_pos(new I.Vector(-1e4, -1e4)), this.highScore > 1 && this.highScore < l.sandPitAt / l.worldScale * .1 - 1 ? (this.hsLine.get_pos().set_x(this.highScore * l.worldScale * 10), this.bestLineText.get_pos().set_x(this.hsLine.get_pos().x), this.bestLineText.set_text("Best: " + this.highScore + "m")) : this.highScore < l.sandPitAt / l.worldScale * .1 - 1 && (this.hsLine.get_pos().set_x(-1e4), this.bestLineText.get_pos().set_x(this.hsLine.get_pos().x), this.bestLineText.set_text("Best: " + this.highScore + "m"));
            for (var t = 0, e = this.speedArray; t < e.length;) {
                {
                    e[t]
                }++t, this.speedArray.pop()
            }
            this.create_player(), this.fallen = !1, this.gameOver = !1, this.gameEnded = !1, this.jumpLanded = !1, this.jumped = !1, this.pause = !1, this.helpUp = !1, this.update(.03333333333333333)
        },
        update: function(t) {
            if (0 == this.pause && 0 == this.gameEnded && (this.scoreTime += t), 0 == this.initialAcceleration.get_length() && 0 != this.accelerometer.get_length() && (this.initialAcceleration = this.accelerometer), this.score < -2.5 ? this.initialAcceleration.dot(this.accelerometer) < -.8 && this.m_world.setGravity(new p.common.math.B2Vec2(0, -l.gravity)) : 0 != this.accelerometer.get_length() && (this.initialAcceleration = this.accelerometer), null != this.floorSprites)
                for (var e = 0, s = this.floorSprites.length; s > e;) {
                    var i = e++,
                        n = this.floorSprites[i],
                        o = n._components.get("physicsBody", !1),
                        r = (Math.floor(this.world_camera.get_pos().x / l.screenWidth) + i) * l.screenWidth / l.worldScale;
                    r != o.getPosition().x && o.setPosition(r, o.getPosition().y)
                }
            if (null != this.rightAnkle) {
                var a = this.head._components.get("physicsBody", !1);
                0 == this.fallen && a.applyTorque(-4 * (a.getAngle() + .2));
                var h = a.getLinearVelocity();
                this.speedArray.push(h.x), this.speedArray.length > 30 && this.speedArray.shift();
                for (var c = 0, _ = 0, u = this.speedArray.length; u > _;) {
                    var d = _++;
                    c += this.speedArray[d]
                }
                window.qwopControl.leftKneeY = this.leftKnee.m_bodyA.m_xf.position.y;
                window.qwopControl.rightKneeY = this.rightKnee.m_bodyA.m_xf.position.y;
                var y = c / this.speedArray.length;
                if (m.audio.volume("music", Math.min(Math.max((y - 2) / 15, 0), 1)), 1 == this.mute && m.audio.volume("music", 0), 1 == this.QDown ? (this.rightHip.setMotorSpeed(2.5), this.leftHip.setMotorSpeed(-2.5), this.rightShoulder.setMotorSpeed(-2), this.rightElbow.setMotorSpeed(-10), this.leftShoulder.setMotorSpeed(2), this.leftElbow.setMotorSpeed(-10)) : 1 == this.WDown ? (this.rightHip.setMotorSpeed(-2.5), this.leftHip.setMotorSpeed(2.5), this.rightShoulder.setMotorSpeed(2), this.rightElbow.setMotorSpeed(10), this.leftShoulder.setMotorSpeed(-2), this.leftElbow.setMotorSpeed(10)) : (this.rightHip.setMotorSpeed(0), this.leftHip.setMotorSpeed(0), this.leftShoulder.setMotorSpeed(0), this.rightShoulder.setMotorSpeed(0)), 1 == this.ODown ? (this.rightKnee.setMotorSpeed(2.5), this.leftKnee.setMotorSpeed(-2.5), this.leftHip.setLimits(-1, 1), this.rightHip.setLimits(-1.3, .7)) : 1 == this.PDown ? (this.rightKnee.setMotorSpeed(-2.5), this.leftKnee.setMotorSpeed(2.5), this.leftHip.setLimits(-1.5, .5), this.rightHip.setLimits(-.8, 1.2)) : (this.rightKnee.setMotorSpeed(0), this.leftKnee.setMotorSpeed(0)), 1 == this.QDown) {
                    var f = this.uiData.frames[15];
                    this.QKeySprite.set_uv(f.uv), this.QKeySprite.set_size(new I.Vector(f.spriteSourceSize.w, f.spriteSourceSize.h))
                } else {
                    var g = this.uiData.frames[14];
                    this.QKeySprite.set_uv(g.uv), this.QKeySprite.set_size(new I.Vector(g.spriteSourceSize.w, g.spriteSourceSize.h))
                }
                if (1 == this.WDown) {
                    var v = this.uiData.frames[20];
                    this.WKeySprite.set_uv(v.uv), this.WKeySprite.set_size(new I.Vector(v.spriteSourceSize.w, v.spriteSourceSize.h))
                } else {
                    var x = this.uiData.frames[19];
                    this.WKeySprite.set_uv(x.uv), this.WKeySprite.set_size(new I.Vector(x.spriteSourceSize.w, x.spriteSourceSize.h))
                }
                if (1 == this.ODown) {
                    var w = this.uiData.frames[11];
                    this.OKeySprite.set_uv(w.uv), this.OKeySprite.set_size(new I.Vector(w.spriteSourceSize.w, w.spriteSourceSize.h))
                } else {
                    var b = this.uiData.frames[10];
                    this.OKeySprite.set_uv(b.uv), this.OKeySprite.set_size(new I.Vector(b.spriteSourceSize.w, b.spriteSourceSize.h))
                }
                if (1 == this.PDown) {
                    var B = this.uiData.frames[13];
                    this.PKeySprite.set_uv(B.uv), this.PKeySprite.set_size(new I.Vector(B.spriteSourceSize.w, B.spriteSourceSize.h))
                } else {
                    var S = this.uiData.frames[12];
                    this.PKeySprite.set_uv(S.uv), this.PKeySprite.set_size(new I.Vector(S.spriteSourceSize.w, S.spriteSourceSize.h))
                }
            }
            if (1 == this.firstClick && 0 == this.pause && this.m_world.step(.04, 5, 5), null != this.torso) {
                var A = this.torso._components.get("physicsBody", !1);
                1 == this.firstClick && (A.getWorldCenter().y < -5 ? (this.world_camera.get_pos().set_y(A.getWorldCenter().y * l.worldScale - 210), this.ui_camera.get_pos().set_y(A.getWorldCenter().y * l.worldScale - 210)) : 0 == this.fallen && this.world_camera.get_pos().set_x((A.getWorldCenter().x + this.world_camera_offset) * l.worldScale)), 0 == this.jumpLanded && (this.score = Math.round(A.getWorldCenter().x) / 10, this.scoreText.set_text("" + this.score + " metres"))
            }
            var C;
            null != this.bevelShaderBody && (C = this.torso._components.get("physicsBody", !1), this.bevelShaderBody.set_vector2("lightVec", new I.Vector(-Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderHead && (C = this.head._components.get("physicsBody", !1), this.bevelShaderHead.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderRightArm && (C = this.rightArm._components.get("physicsBody", !1), this.bevelShaderRightArm.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderLeftArm && (C = this.leftArm._components.get("physicsBody", !1), this.bevelShaderLeftArm.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderRightForearm && (C = this.rightForearm._components.get("physicsBody", !1), this.bevelShaderRightForearm.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderLeftForearm && (C = this.leftForearm._components.get("physicsBody", !1), this.bevelShaderLeftForearm.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderRightThigh && (C = this.rightThigh._components.get("physicsBody", !1), this.bevelShaderRightThigh.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderLeftThigh && (C = this.leftThigh._components.get("physicsBody", !1), this.bevelShaderLeftThigh.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderRightCalf && (C = this.rightCalf._components.get("physicsBody", !1), this.bevelShaderRightCalf.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), null != this.bevelShaderLeftCalf && (C = this.leftCalf._components.get("physicsBody", !1), this.bevelShaderLeftCalf.set_vector2("lightVec", new I.Vector(Math.cos(C.getAngle() - 1), Math.sin(C.getAngle() - 1)))), 1 == this.jumpLanded && 0 == this.gameEnded ? (this.pause = !0, this.endGame()) : 0 == this.jumpLanded && 0 == this.gameEnded && 1 == this.fallen && this.endGame()
        },
        beginContact: function(t) {
            var e = this,
                s = t.getFixtureB().getBody(),
                i = t.getFixtureA().getBody(),
                n = s.getUserData(),
                r = i.getUserData(),
                a = new p.collision.B2WorldManifold,
                h = -1e5,
                c = -1e3;
            t.getWorldManifold(a);
            for (var _ = a.m_points, u = 0; u < _.length;) {
                var d = _[u];
                ++u, d.x > h && (h = d.x)
            }
            if (c = _[0].y, "leftFoot" == n || "rightFoot" == r) "track" == r && 0 == this.gameOver && 0 == this.fallen && (0 == this.jumped && h * l.worldScale > l.sandPitAt - 220 && (this.jumped = !0), 1 == this.jumped && 0 == this.jumpLanded && (h * l.worldScale > l.sandPitAt && (this.jumpLanded = !0, this.burst.color.a = 1, this.burst.set_size(new I.Vector(20, 20)), this.burst.set_pos(new I.Vector(h * l.worldScale, c * l.worldScale)), o.tween.Actuate.tween(this.burst.size, .08, {
                x: 40,
                y: 40
            }).onComplete(function() {
                o.tween.Actuate.tween(e.burst.size, .8, {
                    x: 0,
                    y: 0
                }).ease(o.tween.easing.Quad.get_easeIn()), o.tween.Actuate.tween(e.burst.color, .8, {
                    a: 0
                }).ease(o.tween.easing.Quad.get_easeIn())
            }).ease(o.tween.easing.Quad.get_easeOut())), this.score = Math.round(h) / 10, this.score > this.highScore && (this.highScore = this.score)));
            else if (("rightForearm" == n || "leftForearm" == n || "rightArm" == n || "leftArm" == n || "head" == n) && "track" == r && 0 == this.fallen) {
                this.fallen = !0;
                var y = s.getLinearVelocity();
                y.subtract(i.getLinearVelocity());
                var f = y.length();
                m.audio.play(f > 5 ? "crunch" : "ehh"), this.burst.color.a = 1, this.burst.set_size(new I.Vector(20, 20)), this.burst.set_pos(new I.Vector(h * l.worldScale, c * l.worldScale)), o.tween.Actuate.tween(this.burst.size, .15, {
                    x: 80,
                    y: 80
                }).onComplete(function() {
                    o.tween.Actuate.tween(e.burst.size, .8, {
                        x: 0,
                        y: 0
                    }).ease(o.tween.easing.Quad.get_easeOut()), o.tween.Actuate.tween(e.burst.color, .8, {
                        a: 0
                    }).ease(o.tween.easing.Quad.get_easeOut())
                }).ease(o.tween.easing.Quad.get_easeIn()), 1 == this.jumped && 0 == this.jumpLanded && (this.jumpLanded = !0), this.score = Math.round(h) / 10, this.score > this.highScore && (this.highScore = this.score)
            }
        },
        endContact: function() {},
        connect_input: function() {
            m.input.bind_key("Q", C.system.input.Keycodes.key_q), m.input.bind_key("W", C.system.input.Keycodes.key_w), m.input.bind_key("O", C.system.input.Keycodes.key_o), m.input.bind_key("P", C.system.input.Keycodes.key_p), m.input.bind_key("reset", C.system.input.Keycodes.key_r), m.input.bind_key("space", C.system.input.Keycodes.space), m.input.bind_key("test", C.system.input.Keycodes.key_t)
        },
        oninputdown: function(t) {
            "Q" == t && (this.QDown = !0), "W" == t && (this.WDown = !0), "O" == t && (this.ODown = !0), "P" == t && (this.PDown = !0)
        },
        oninputup: function(t) {
            "Q" == t && (this.QDown = !1), "W" == t && (this.WDown = !1), "O" == t && (this.ODown = !1), "P" == t && (this.PDown = !1), "reset" == t && this.reset(), 1 == this.gameEnded && "space" == t && this.reset()
        },
        onkeyup: function(t) {
            t.keycode == C.system.input.Keycodes.escape
        },
        onevent: function(t) {
            if (6 == t.type && 4 == t.input.type) {
                var e = t.input.event;
                "motion" == e.type && (this.accelerometer = new I.Vector(e.accelerationIncludingGravity.x, e.accelerationIncludingGravity.y, e.accelerationIncludingGravity.z).get_normalized())
            }
        },
        ontouchmove: function() {},
        ontouchdown: function(t) {
            if (0 != this.doneLoading) {
                var e = new I.Vector(t.pos.x * l.screenWidth, t.pos.y * l.screenHeight);
                this.QButton.point_inside(e) && (this.QDown = !0, this.QID = t.touch_id), this.WButton.point_inside(e) && (this.WDown = !0, this.WID = t.touch_id), this.OButton.point_inside(e) && (this.ODown = !0, this.OID = t.touch_id), this.PButton.point_inside(e) && (this.PDown = !0, this.PID = t.touch_id), this.gameEnded && this.reset()
            }
        },
        ontouchup: function(t) {
            t.touch_id == this.QID && (this.QDown = !1, this.QID = 0), t.touch_id == this.WID && (this.WDown = !1, this.WID = 0), t.touch_id == this.OID && (this.ODown = !1, this.OID = 0), t.touch_id == this.PID && (this.PDown = !1, this.PID = 0)
        },
        onmousedown: function(t) {
            if (0 != this.doneLoading) {
                if (0 == this.firstClick && 1 == this.doneLoading && (this.firstClick = !0, this.intro.destroy(), this.blackSquare.set_pos(new I.Vector(-1e4, -1e4)), this.scoreTime = 0), 1 == this.helpUp && (this.helpUp = !1, this.pause = !1, this.blackSquare.set_pos(new I.Vector(-1e4, -1e4)), this.help.set_pos(new I.Vector(-1e4, -1e4))), this.muteButton.point_inside(t.pos)) {
                    this.mute = !this.mute;
                    var e;
                    0 == this.mute ? (e = this.uiData.frames[8], m.audio.volume("ehh", 1), m.audio.volume("crunch", 1)) : (e = this.uiData.frames[9], m.audio.volume("ehh", 0), m.audio.volume("crunch", 0)), this.muteButton.set_uv(e.uv), this.muteButton.set_size(new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h))
                }
                this.helpButton.point_inside(t.pos) && (this.pause = !0, this.helpUp = !0, this.blackSquare.set_pos(new I.Vector(this.world_camera.get_pos().x, this.world_camera.get_pos().y)), this.help.set_pos(new I.Vector(this.world_camera.get_pos().x + .5 * l.screenWidth, this.world_camera.get_pos().y + .5 * l.screenHeight)));
                var s = ["ios", "android"]; - 1 == h.indexOf(s, m.core.app.os, 0) && (this.QButton.point_inside(t.pos) && (this.QDown = !0, this.mouseClicked = "Q"), this.WButton.point_inside(t.pos) && (this.WDown = !0, this.mouseClicked = "W"), this.OButton.point_inside(t.pos) && (this.ODown = !0, this.mouseClicked = "O"), this.PButton.point_inside(t.pos) && (this.PDown = !0, this.mouseClicked = "P"))
            }
        },
        onmouseup: function() {
            var t = ["ios", "android"]; - 1 == h.indexOf(t, m.core.app.os, 0) && ("Q" == this.mouseClicked && (this.QDown = !1), "W" == this.mouseClicked && (this.WDown = !1), "O" == this.mouseClicked && (this.ODown = !1), "P" == this.mouseClicked && (this.PDown = !1))
        },
        create_hurdle: function() {
            var t = this.uiData.frames[22];
            this.hurdleBase = new o.Sprite({
                name: "hurdleBase",
                pos: new I.Vector(l.hurdleAt, 175.5),
                size: new I.Vector(67, 12),
                uv: t.uv,
                batcher: this.world_batcher,
                depth: 6,
                centered: !0,
                texture: this.uiAtlasImage
            });
            var e = new r({
                name: "physicsBody"
            });
            e.world = this.m_world, e.categoryBits = 4, e.maskBits = 65529, e.isAwake = !1, e.density = l.densityFactor, e.userData = "hurdleBase", this.hurdleBase.add(e);
            var s = this.uiData.frames[23];
            this.hurdleTop = new o.Sprite({
                name: "hurdleTop",
                pos: new I.Vector(l.hurdleAt + 17.3, 101.15),
                size: new I.Vector(21.5, 146),
                uv: s.uv,
                batcher: this.world_batcher,
                depth: 7,
                centered: !0,
                texture: this.uiAtlasImage
            }), e = new r({
                name: "physicsBody"
            }), e.world = this.m_world, e.categoryBits = 4, e.maskBits = 65531, e.isAwake = !1, e.density = l.densityFactor, e.userData = "hurdleTop", this.hurdleTop.add(e);
            var i = new p.dynamics.joints.B2RevoluteJointDef;
            i.bodyA = this.hurdleTop._components.get("physicsBody", !1).body, i.bodyB = this.hurdleBase._components.get("physicsBody", !1).body, i.localAnchorA.set(3.6 / l.worldScale, 74.6 / l.worldScale), i.localAnchorB.set(20.9 / l.worldScale, .25 / l.worldScale), i.enableLimit = !0, this.hurdleJoint = this.m_world.createJoint(i);
            // CHANGE: Seems to cause the game to hang on a local domain.
            // var n = new a("foddy", "i"),
            //     h = !1;
            // 0 == h && 0 == n.match(window.location.host) && m.shutdown()
        },
        create_player: function() {
            this.create_hurdle();
            var t = o.importers.texturepacker.TexturePackerJSON.parse(this.player_atlas_json),
                e = t.frames[0];
            this.torso = new o.Sprite({
                name: "torso",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 6,
                centered: !0,
                shader: this.bevelShaderBody,
                texture: this.atlasImage
            });
            var s = new r({
                name: "physicsBody"
            });
            s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "torso", this.torso.add(s);
            var i = this.torso._components.get("physicsBody", !1);
            i.setPosition(2.5111726226000157, -1.8709517533957938), i.setAngle(-1.2514497119301329), e = t.frames[1], this.head = new o.Sprite({
                name: "head",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 7,
                centered: !0,
                shader: this.bevelShaderHead,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "head", this.head.add(s), i = this.head._components.get("physicsBody", !1), i.setPosition(3.888130278719558, -5.621802929095265), i.setAngle(.06448415835225099), e = t.frames[2], this.leftForearm = new o.Sprite({
                name: "leftForearm",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 5,
                centered: !0,
                shader: this.bevelShaderLeftForearm,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "leftForearm", this.leftForearm.add(s), i = this.leftForearm._components.get("physicsBody", !1), i.setPosition(5.830008603424893, -2.8733539631159584), i.setAngle(-1.2049772618421237), e = t.frames[3], this.leftThigh = new o.Sprite({
                name: "leftThigh",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 3,
                centered: !0,
                shader: this.bevelShaderLeftThigh,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "leftThigh", this.leftThigh.add(s), i = this.leftThigh._components.get("physicsBody", !1), i.setPosition(2.5648987628203876, 1.648090668682522), i.setAngle(-2.0177234426823394), e = t.frames[4], this.leftArm = new o.Sprite({
                name: "leftArm",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 4,
                centered: !0,
                shader: this.bevelShaderLeftArm,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "leftArm", this.leftArm.add(s), i = this.leftArm._components.get("physicsBody", !1), i.setPosition(4.417861014480877, -2.806563606410589), i.setAngle(.9040095895272826), e = t.frames[5], this.leftCalf = new o.Sprite({
                name: "leftCalf",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 1,
                centered: !0,
                shader: this.bevelShaderLeftCalf,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "leftCalf", this.leftCalf.add(s), i = this.leftCalf._components.get("physicsBody", !1), i.setPosition(3.12585731974087, 5.525511655361298), i.setAngle(-1.5903971528225265), e = t.frames[6], this.leftFoot = new o.Sprite({
                name: "leftFoot",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 2,
                centered: !0,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = 1.5, s.restitution = 0, s.density = 3 * l.densityFactor, s.userData = "leftFoot", this.leftFoot.add(s), s.isBullet = !1, i = this.leftFoot._components.get("physicsBody", !1), i.setPosition(3.926921842806667, 8.08884032049622), i.setAngle(.12027524643408766), e = t.frames[7], this.rightForearm = new o.Sprite({
                name: "rightForearm",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 12,
                centered: !0,
                shader: this.bevelShaderRightForearm,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "rightForearm", this.rightForearm.add(s), i = this.rightForearm._components.get("physicsBody", !1), i.setPosition(.4078206420797428, -1.0599953233084172), i.setAngle(-1.7553358283857299), e = t.frames[8], this.rightArm = new o.Sprite({
                name: "rightArm",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 8,
                centered: !0,
                shader: this.bevelShaderRightArm,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "rightArm", this.rightArm.add(s), i = this.rightArm._components.get("physicsBody", !1), i.setPosition(1.1812303663272852, -3.5000256518601014), i.setAngle(-.5222217404634386), e = t.frames[9], this.rightCalf = new o.Sprite({
                name: "rightCalf",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 9,
                centered: !0,
                shader: this.bevelShaderRightCalf,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "rightCalf", this.rightCalf.add(s), i = this.rightCalf._components.get("physicsBody", !1), i.setPosition(-.07253905736790486, 5.347881871063159), i.setAngle(-.7588859967104447), e = t.frames[10], this.rightFoot = new o.Sprite({
                name: "rightFoot",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 11,
                centered: !0,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = 1.5, s.restitution = 0, s.density = 3 * l.densityFactor, s.isBullet = !1, s.userData = "rightFoot", this.rightFoot.add(s), i = this.rightFoot._components.get("physicsBody", !1), i.setPosition(-1.1254742643908706, 7.567193169625567), i.setAngle(.5897605418219602), e = t.frames[11], this.rightThigh = new o.Sprite({
                name: "rightThigh",
                size: new I.Vector(e.spriteSourceSize.w, e.spriteSourceSize.h),
                uv: e.uv,
                batcher: this.world_batcher,
                depth: 10,
                centered: !0,
                shader: this.bevelShaderRightThigh,
                texture: this.atlasImage
            }), s = new r({
                name: "physicsBody"
            }), s.world = this.m_world, s.categoryBits = 2, s.maskBits = 65533, s.friction = .2, s.restitution = 0, s.density = l.densityFactor, s.userData = "rightThigh", this.rightThigh.add(s), i = this.rightThigh._components.get("physicsBody", !1), i.setPosition(1.6120186135678773, 2.0615320561881516), i.setAngle(1.4849422964528027);
            var n = new p.dynamics.joints.B2RevoluteJointDef;
            n.bodyA = this.head._components.get("physicsBody", !1).body, n.bodyB = this.torso._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(3.5885141908253755, -4.526224223627244)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(3.588733341630704, -4.526434658500262)), n.enableLimit = !0, n.upperAngle = 0, n.enableMotor = !1, n.lowerAngle = -.5, n.maxMotorTorque = 0, n.referenceAngle = -1.308996406363529, this.neck = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.rightArm._components.get("physicsBody", !1).body, n.bodyB = this.torso._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(2.228476821818547, -4.086468732185028)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(2.228929993886102, -4.08707555939957)), n.enableLimit = !0, n.upperAngle = 1.5, n.lowerAngle = -.5, n.enableMotor = !0, n.maxMotorTorque = 1e3 * l.torqueFactor, n.referenceAngle = -.7853907065463961, this.rightShoulder = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.leftArm._components.get("physicsBody", !1).body, n.bodyB = this.torso._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(3.6241979856895377, -3.5334881618011442)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(3.6241778782207157, -3.533950434531982)), n.enableLimit = !0, n.upperAngle = 0, n.lowerAngle = -2, n.enableMotor = !0, n.maxMotorTorque = 1e3 * l.torqueFactor, n.referenceAngle = -2.09438311816829, this.leftShoulder = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.leftThigh._components.get("physicsBody", !1).body, n.bodyB = this.torso._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(2.0030339754142847, .23737160622781284)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(2.003367181376716, .23802590387419476)), n.enableLimit = !0, n.upperAngle = .5, n.lowerAngle = -1.5, n.enableMotor = !0, n.maxMotorTorque = 6e3 * l.torqueFactor, n.referenceAngle = .7258477508944043, this.leftHip = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.rightThigh._components.get("physicsBody", !1).body, n.bodyB = this.torso._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(1.2475900729227194, -.011046642863645761)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(1.2470052823973599, -.011635347168778898)), n.enableLimit = !0, n.upperAngle = .7, n.lowerAngle = -1.3, n.enableMotor = !0, n.maxMotorTorque = 6e3 * l.torqueFactor, n.referenceAngle = -2.719359381718199, this.rightHip = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.leftForearm._components.get("physicsBody", !1).body, n.bodyB = this.leftArm._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(5.525375332758792, -1.63856204930891)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(5.52537532948459, -1.6385620366077662)), n.enableLimit = !0, n.upperAngle = .5, n.lowerAngle = -.1, n.enableMotor = !1, n.maxMotorTorque = 0 * l.torqueFactor, n.referenceAngle = 2.09438311816829, this.leftElbow = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.rightForearm._components.get("physicsBody", !1).body, n.bodyB = this.rightArm._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(-.006090859076100963, -2.8004758838752157)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(-.0060908611708438976, -2.8004758929205846)), n.enableLimit = !0, n.upperAngle = .5, n.lowerAngle = -.1, n.enableMotor = !1, n.maxMotorTorque = 0 * l.torqueFactor, n.referenceAngle = 1.2968199012274688, this.rightElbow = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.leftCalf._components.get("physicsBody", !1).body, n.bodyB = this.leftThigh._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(3.384323411985692, 3.5168931240916876)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(3.3844684376952108, 3.5174122997898016)), n.enableLimit = !0, n.upperAngle = 0, n.lowerAngle = -1.6, n.enableMotor = !0, n.maxMotorTorque = 3e3 * l.torqueFactor, n.referenceAngle = -.3953113764119829, this.leftKnee = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.rightCalf._components.get("physicsBody", !1).body, n.bodyB = this.rightThigh._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(1.4982369235492752, 4.175600306005656)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(1.4982043532615996, 4.17493520671361)), n.enableLimit = !0, n.upperAngle = .3, n.lowerAngle = -1.3, n.enableMotor = !0, n.maxMotorTorque = 3e3 * l.torqueFactor, n.referenceAngle = 2.2893406247158676, this.rightKnee = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.leftFoot._components.get("physicsBody", !1).body, n.bodyB = this.leftCalf._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(3.312322507818897, 7.947704853895541)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(3.3123224825088817, 7.947704836256229)), n.enableLimit = !0, n.upperAngle = .5, n.lowerAngle = -.5, n.enableMotor = !1, n.maxMotorTorque = 2e3 * l.torqueFactor, n.referenceAngle = -1.7244327585010226, this.leftAnkle = this.m_world.createJoint(n), n = new p.dynamics.joints.B2RevoluteJointDef, n.bodyA = this.rightFoot._components.get("physicsBody", !1).body, n.bodyB = this.rightCalf._components.get("physicsBody", !1).body, n.localAnchorA = n.bodyA.getLocalPoint(new p.common.math.B2Vec2(-1.6562855402197227, 6.961551452557676)), n.localAnchorB = n.bodyB.getLocalPoint(new p.common.math.B2Vec2(-1.655726670462596, 6.961493826969391)), n.enableLimit = !0, n.upperAngle = .5, n.lowerAngle = -.5, n.enableMotor = !1, n.maxMotorTorque = 2e3 * l.torqueFactor, n.referenceAngle = -1.5708045825942758, this.rightAnkle = this.m_world.createJoint(n), this.rightHip.setMotorSpeed(0), this.rightHip.enableLimit(!0), this.rightHip.enableMotor(!0), this.leftHip.setMotorSpeed(0), this.leftHip.enableLimit(!0), this.leftHip.enableMotor(!0), this.rightKnee.setMotorSpeed(0), this.rightKnee.enableLimit(!0), this.rightKnee.enableMotor(!0), this.leftKnee.setMotorSpeed(0), this.leftKnee.enableLimit(!0), this.leftKnee.enableMotor(!0), this.rightShoulder.setMotorSpeed(0), this.rightShoulder.enableLimit(!0), this.rightShoulder.enableMotor(!0), this.leftShoulder.setMotorSpeed(0), this.leftShoulder.enableLimit(!0), this.leftShoulder.enableMotor(!0), this.started = !1
        },
        __class__: d
    });
    var p = {};
    p.dynamics = {}, p.dynamics.B2ContactListener = function() {}, i["box2D.dynamics.B2ContactListener"] = p.dynamics.B2ContactListener, p.dynamics.B2ContactListener.__name__ = !0, p.dynamics.B2ContactListener.prototype = {
        beginContact: function() {},
        endContact: function() {},
        preSolve: function() {},
        postSolve: function() {},
        __class__: p.dynamics.B2ContactListener
    };
    var y = function(t) {
        p.dynamics.B2ContactListener.call(this), this.main = t
    };
    i.ContactListener = y, y.__name__ = !0, y.__super__ = p.dynamics.B2ContactListener, y.prototype = t(p.dynamics.B2ContactListener.prototype, {
        beginContact: function(t) {
            this.main.beginContact(t)
        },
        endContact: function(t) {
            this.main.endContact(t)
        },
        __class__: y
    });
    var f = function() {};
    i.IMap = f, f.__name__ = !0, f.prototype = {
        __class__: f
    }, Math.__name__ = !0;
    var g = function(t, e) {
        null == e && (e = !1), this.id = t, this.silent = e
    };
    i.Pack = g, g.__name__ = !0, g.prototype = {
        preload: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                var i = m.resources.load_bytes(t.id);
                i.then(function(i) {
                    t.pack = v.uncompress_pack(C.api.buffers._Uint8Array.Uint8Array_Impl_.toBytes(i.asset.bytes)), t.doload().then(function() {
                        e(t.pack)
                    }).error(s)
                }).error(s)
            })
        },
        _log: function() {
            !this.silent
        },
        doload: function() {
            var t = this;
            return new C.api.Promise(function(e, i) {
                t._log("queuing packed parcel: " + t.pack.id), t.preprocess_sound_meta(t.pack.sounds), t.preprocess_texture_meta(t.pack.textures), t.load(t.pack.bytes, s(t, t.create_bytes)), t.load(t.pack.texts, s(t, t.create_text)), t.load(t.pack.jsons, s(t, t.create_json)), t.load(t.pack.sounds, s(t, t.create_sound)), t.load(t.pack.shaders, s(t, t.create_shader)), t.load(t.pack.textures, s(t, t.create_texture)).then(function() {
                    t.load(t.pack.fonts, s(t, t.create_font)), t.process_shader_meta(t.pack.shaders), e()
                }).error(i)
            })
        },
        preprocess_texture_meta: function() {},
        preprocess_sound_meta: function() {
            this.meta_sound = new S.ds.StringMap;
            for (var t = this.meta_content(this.pack.sounds, "sound"), e = 0; e < t.length;) {
                var s = t[e];
                ++e, this.meta_sound.set(s.id, s)
            }
        },
        process_shader_meta: function(t) {
            if (! function(e) {
                    var s, i = e.meta_id("shader");
                    return s = t.exists(i)
                }(this)) return void this._log("     shaders: no meta information, no shaders will be created if any were packed");
            var e = this.meta_content(t, "shader");
            this._log("process_shader_meta: " + e.length);
            for (var s = 0; s < e.length;) {
                var i = e[s];
                ++s;
                var n, o = new I.Shader({
                        id: i.id,
                        system: m.resources,
                        vert_id: i.vert_id,
                        frag_id: i.frag_id
                    }),
                    r = i.vert_id;
                switch (r) {
                    case "default":
                        n = m.renderer.shaders.plain.source.vert;
                        break;
                    default:
                        n = m.resources.cache.get(i.vert_id).asset.text
                }
                var a, l = i.frag_id;
                switch (l) {
                    case "default":
                        a = m.renderer.shaders.plain.source.frag;
                        break;
                    case "textured":
                        a = m.renderer.shaders.textured.source.frag;
                        break;
                    default:
                        a = m.resources.cache.get(i.frag_id).asset.text
                }
                o.from_string(n, a) ? (m.resources.add(o), this._log("      created shader " + i.id + " / " + i.vert_id + " / " + i.frag_id)) : this._log("      failed to load shader " + i.id)
            }
        },
        load: function(t, e) {
            for (var s = [], i = t.keys(); i.hasNext();) {
                var n = i.next();
                this._log("   load " + n);
                var o = t.get(n);
                s.push(e(n, o, o.bytes))
            }
            return 0 == s.length ? C.api.Promise.resolve() : C.api.Promise.all(s)
        },
        create_font: function(t, e, s) {
            for (var i = s.toString(), n = o.importers.bitmapfont.BitmapFontParser.parse(i), r = S.io.Path.directory(t), a = [], l = 0, h = n.pages; l < h.length;) {
                var c = h[l];
                ++l;
                var _ = S.io.Path.join([r, c.file]);
                this._log("      looking for font texture: " + _);
                var u = m.resources.cache.get(_);
                if (null == u) throw o.DebugError.null_assertion("tex was null (font texture not found)");
                a.push(u)
            }
            var d = {
                id: t,
                system: m.resources
            };
            d.font_data = i, d.pages = a;
            var p = new I.BitmapFont(d);
            return p.set_state(3), m.resources.add(p), this._log("     created font " + t), C.api.Promise.resolve()
        },
        create_bytes: function(t, e, s) {
            var i = {
                id: t,
                system: m.resources
            };
            i.asset = new C.system.assets.AssetBytes(m.core.app.assets, t, C.api.buffers._Uint8Array.Uint8Array_Impl_.fromBytes(s));
            var n = new o.resource.BytesResource(i);
            return n.set_state(3), m.resources.add(n), this._log("     created bytes " + t), C.api.Promise.resolve()
        },
        create_text: function(t, e, s) {
            var i = s.toString(),
                n = {
                    id: t,
                    system: m.resources
                };
            n.asset = new C.system.assets.AssetText(m.core.app.assets, t, i);
            var r = new o.resource.TextResource(n);
            return r.set_state(3), m.resources.add(r), this._log("     created text " + t), C.api.Promise.resolve()
        },
        create_json: function(t, e, s) {
            var i = s.toString(),
                n = JSON.parse(i),
                r = {
                    id: t,
                    system: m.resources
                };
            r.asset = new C.system.assets.AssetJSON(m.core.app.assets, t, n);
            var a = new o.resource.JSONResource(r);
            return a.set_state(3), m.resources.add(a), this._log("     created json " + t), C.api.Promise.resolve()
        },
        create_sound: function(t, e, s) {
            if (this.is_meta("sound", t)) return this._log("   -- skip sound meta " + t), C.api.Promise.resolve();
            var i = this.meta_sound.get(t),
                n = S.io.Path.withoutExtension(S.io.Path.withoutDirectory(t)),
                o = S.io.Path.extension(t);
            null != i && (n = i.name);
            var r = 0;
            switch (o) {
                case "ogg":
                    r = 1;
                    break;
                case "wav":
                    r = 2
            }
            var a = C.api.buffers._Uint8Array.Uint8Array_Impl_.fromBytes(s);
            return m.audio.create_from_bytes(n, a, r), this._log("     created sound " + t), C.api.Promise.resolve()
        },
        create_texture: function(t, e, s) {
            var i = this;
            return new C.api.Promise(function(e, n) {
                var o = new I.Texture({
                    id: t,
                    system: m.resources
                });
                o.set_state(2), m.resources.add(o);
                var r = C.api.buffers._Uint8Array.Uint8Array_Impl_.fromBytes(s),
                    a = C.system.assets.AssetImage.load_from_bytes(m.core.app.assets, t, r);
                a.then(function(s) {
                    o.from_asset(s), o.set_state(3), i._log("     created texture " + t), e()
                }).error(n)
            })
        },
        create_shader: function(t, e, s) {
            return this.is_meta("shader", t) ? (this._log("   -- skip shader meta " + t), C.api.Promise.resolve()) : this.create_text(t, e, s)
        },
        is_meta: function(t, e) {
            return -1 != e.indexOf(this.meta_id(t))
        },
        meta_id: function(t) {
            return "bytes" == t && (t = "byte"), "assets/" + t + "s.parcel-" + t + "s-meta"
        },
        meta_content: function(t, e) {
            var s = this.meta_id(e),
                i = t.get(s);
            return null == i ? [] : JSON.parse(i.bytes.toString())
        },
        __class__: g
    };
    var v = function() {};
    i.Packer = v, v.__name__ = !0, v.uncompress_pack = function(t) {
        var e = t,
            s = t.length;
        v.use_zip && (e = S.zip.Uncompress.run(e)); {
            var i = e.toString(),
                n = new S.Unserializer(i),
                o = n.unserialize(),
                r = e.length;
            m.utils.bytes_to_string(s, null), m.utils.bytes_to_string(r, null)
        }
        return o
    };
    var x = function() {};
    i.Reflect = x, x.__name__ = !0, x.field = function(t, e) {
        try {
            return t[e]
        } catch (s) {
            return null
        }
    }, x.setField = function(t, e, s) {
        t[e] = s
    }, x.getProperty = function(t, e) {
        var s;
        return null == t ? null : t.__properties__ && (s = t.__properties__["get_" + e]) ? t[s]() : t[e]
    }, x.setProperty = function(t, e, s) {
        var i;
        t.__properties__ && (i = t.__properties__["set_" + e]) ? t[i](s) : t[e] = s
    }, x.fields = function(t) {
        var e = [];
        if (null != t) {
            var s = Object.prototype.hasOwnProperty;
            for (var i in t) "__id__" != i && "hx__closures__" != i && s.call(t, i) && e.push(i)
        }
        return e
    }, x.isFunction = function(t) {
        return "function" == typeof t && !(t.__name__ || t.__ename__)
    };
    var w = function() {};
    i.Std = w, w.__name__ = !0, w.string = function(t) {
        return A.Boot.__string_rec(t, "")
    }, w["int"] = function(t) {
        return 0 | t
    }, w.parseInt = function(t) {
        var e = parseInt(t, 10);
        return 0 != e || 120 != h.cca(t, 1) && 88 != h.cca(t, 1) || (e = parseInt(t)), isNaN(e) ? null : e
    }, w.parseFloat = function(t) {
        return parseFloat(t)
    }, w.random = function(t) {
        return 0 >= t ? 0 : Math.floor(Math.random() * t)
    };
    var b = function() {};
    i.StringTools = b, b.__name__ = !0, b.isSpace = function(t, e) {
        var s = h.cca(t, e);
        return s > 8 && 14 > s || 32 == s
    }, b.ltrim = function(t) {
        for (var e = t.length, s = 0; e > s && b.isSpace(t, s);) s++;
        return s > 0 ? h.substr(t, s, e - s) : t
    }, b.rtrim = function(t) {
        for (var e = t.length, s = 0; e > s && b.isSpace(t, e - s - 1);) s++;
        return s > 0 ? h.substr(t, 0, e - s) : t
    }, b.trim = function(t) {
        return b.ltrim(b.rtrim(t))
    }, b.rpad = function(t, e, s) {
        if (e.length <= 0) return t;
        for (; t.length < s;) t += e;
        return t
    }, b.replace = function(t, e, s) {
        return t.split(e).join(s)
    }, b.fastCodeAt = function(t, e) {
        return t.charCodeAt(e)
    };
    var B = function() {};
    i.Type = B, B.__name__ = !0, B.resolveClass = function(t) {
        var e = i[t];
        return null != e && e.__name__ ? e : null
    }, B.resolveEnum = function(t) {
        var e = i[t];
        return null != e && e.__ename__ ? e : null
    }, B.createInstance = function(t, e) {
        var s = e.length;
        switch (s) {
            case 0:
                return new t;
            case 1:
                return new t(e[0]);
            case 2:
                return new t(e[0], e[1]);
            case 3:
                return new t(e[0], e[1], e[2]);
            case 4:
                return new t(e[0], e[1], e[2], e[3]);
            case 5:
                return new t(e[0], e[1], e[2], e[3], e[4]);
            case 6:
                return new t(e[0], e[1], e[2], e[3], e[4], e[5]);
            case 7:
                return new t(e[0], e[1], e[2], e[3], e[4], e[5], e[6]);
            case 8:
                return new t(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]);
            default:
                throw "Too many arguments"
        }
        return null
    }, B.createEmptyInstance = function(t) {
        function e() {}
        return e.prototype = t.prototype, new e
    }, B.createEnum = function(t, e, s) {
        var i = x.field(t, e);
        if (null == i) throw "No such constructor " + e;
        if (x.isFunction(i)) {
            if (null == s) throw "Constructor " + e + " need parameters";
            return i.apply(t, s)
        }
        if (null != s && 0 != s.length) throw "Constructor " + e + " does not need parameters";
        return i
    }, B.getEnumConstructs = function(t) {
        var e = t.__constructs__;
        return e.slice()
    }, p.collision = {}, p.collision.B2AABB = function() {
        this.lowerBound = new p.common.math.B2Vec2, this.upperBound = new p.common.math.B2Vec2
    }, i["box2D.collision.B2AABB"] = p.collision.B2AABB, p.collision.B2AABB.__name__ = !0, p.collision.B2AABB.prototype = {
        getCenter: function() {
            return new p.common.math.B2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
        },
        contains: function(t) {
            var e = !0;
            return e = e && this.lowerBound.x <= t.lowerBound.x, e = e && this.lowerBound.y <= t.lowerBound.y, e = e && t.upperBound.x <= this.upperBound.x, e = e && t.upperBound.y <= this.upperBound.y
        },
        testOverlap: function(t) {
            var e = t.lowerBound.x - this.upperBound.x,
                s = t.lowerBound.y - this.upperBound.y,
                i = this.lowerBound.x - t.upperBound.x,
                n = this.lowerBound.y - t.upperBound.y;
            return e > 0 || s > 0 ? !1 : i > 0 || n > 0 ? !1 : !0
        },
        combine: function(t, e) {
            this.lowerBound.x = Math.min(t.lowerBound.x, e.lowerBound.x), this.lowerBound.y = Math.min(t.lowerBound.y, e.lowerBound.y), this.upperBound.x = Math.max(t.upperBound.x, e.upperBound.x), this.upperBound.y = Math.max(t.upperBound.y, e.upperBound.y)
        },
        __class__: p.collision.B2AABB
    }, p.common = {}, p.common.math = {}, p.common.math.B2Vec2 = function(t, e) {
        null == e && (e = 0), null == t && (t = 0), this.x = t, this.y = e
    }, i["box2D.common.math.B2Vec2"] = p.common.math.B2Vec2, p.common.math.B2Vec2.__name__ = !0, p.common.math.B2Vec2.make = function(t, e) {
        return new p.common.math.B2Vec2(t, e)
    }, p.common.math.B2Vec2.prototype = {
        setZero: function() {
            this.x = 0, this.y = 0
        },
        set: function(t, e) {
            null == e && (e = 0), null == t && (t = 0), this.x = t, this.y = e
        },
        setV: function(t) {
            this.x = t.x, this.y = t.y
        },
        getNegative: function() {
            return new p.common.math.B2Vec2(-this.x, -this.y)
        },
        negativeSelf: function() {
            this.x = -this.x, this.y = -this.y
        },
        copy: function() {
            return new p.common.math.B2Vec2(this.x, this.y)
        },
        add: function(t) {
            this.x += t.x, this.y += t.y
        },
        subtract: function(t) {
            this.x -= t.x, this.y -= t.y
        },
        multiply: function(t) {
            this.x *= t, this.y *= t
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        },
        lengthSquared: function() {
            return this.x * this.x + this.y * this.y
        },
        normalize: function() {
            var t = Math.sqrt(this.x * this.x + this.y * this.y);
            if (t < Number.MIN_VALUE) return 0;
            var e = 1 / t;
            return this.x *= e, this.y *= e, t
        },
        __class__: p.common.math.B2Vec2
    }, p.collision.ClipVertex = function() {
        this.v = new p.common.math.B2Vec2, this.id = new p.collision.B2ContactID
    }, i["box2D.collision.ClipVertex"] = p.collision.ClipVertex, p.collision.ClipVertex.__name__ = !0, p.collision.ClipVertex.prototype = {
        set: function(t) {
            this.v.setV(t.v), this.id.set(t.id)
        },
        __class__: p.collision.ClipVertex
    }, p.collision.B2ContactID = function() {
        this._key = 0, this.features = new p.collision.Features, this.features._m_id = this
    }, i["box2D.collision.B2ContactID"] = p.collision.B2ContactID, p.collision.B2ContactID.__name__ = !0, p.collision.B2ContactID.prototype = {
        set: function(t) {
            this.set_key(t._key)
        },
        get_key: function() {
            return this._key
        },
        set_key: function(t) {
            return this._key = t, this.features._referenceEdge = 255 & this._key, this.features._incidentEdge = (65280 & this._key) >> 8 & 255, this.features._incidentVertex = (16711680 & this._key) >> 16 & 255, this.features._flip = (-16777216 & this._key) >> 24 & 255, this._key
        },
        __class__: p.collision.B2ContactID,
        __properties__: {
            set_key: "set_key",
            get_key: "get_key"
        }
    }, p.collision.Features = function() {
        this._flip = 0, this._incidentVertex = 0, this._incidentEdge = 0, this._referenceEdge = 0
    }, i["box2D.collision.Features"] = p.collision.Features, p.collision.Features.__name__ = !0, p.collision.Features.prototype = {
        set_referenceEdge: function(t) {
            return this._referenceEdge = t, this._m_id._key = -256 & this._m_id._key | 255 & this._referenceEdge, t
        },
        set_incidentEdge: function(t) {
            return this._incidentEdge = t, this._m_id._key = -65281 & this._m_id._key | this._incidentEdge << 8 & 65280, t
        },
        set_incidentVertex: function(t) {
            return this._incidentVertex = t, this._m_id._key = -16711681 & this._m_id._key | this._incidentVertex << 16 & 16711680, t
        },
        set_flip: function(t) {
            return this._flip = t, this._m_id._key = 16777215 & this._m_id._key | this._flip << 24 & -16777216, t
        },
        __class__: p.collision.Features,
        __properties__: {
            set_flip: "set_flip",
            set_incidentVertex: "set_incidentVertex",
            set_incidentEdge: "set_incidentEdge",
            set_referenceEdge: "set_referenceEdge"
        }
    }, p.collision.B2Collision = function() {}, i["box2D.collision.B2Collision"] = p.collision.B2Collision, p.collision.B2Collision.__name__ = !0, p.collision.B2Collision.clipSegmentToLine = function(t, e, s, i) {
        var n, o = 0;
        n = e[0];
        var r = n.v;
        n = e[1];
        var a = n.v,
            l = s.x * r.x + s.y * r.y - i,
            h = s.x * a.x + s.y * a.y - i;
        if (0 >= l && t[o++].set(e[0]), 0 >= h && t[o++].set(e[1]), 0 > l * h) {
            var c = l / (l - h);
            n = t[o];
            var _ = n.v;
            _.x = r.x + c * (a.x - r.x), _.y = r.y + c * (a.y - r.y), n = t[o];
            var m;
            l > 0 ? (m = e[0], n.id = m.id) : (m = e[1], n.id = m.id), ++o
        }
        return o
    }, p.collision.B2Collision.edgeSeparation = function(t, e, s, i, n) {
        var o, r, a = (t.m_vertexCount, t.m_vertices),
            l = t.m_normals,
            h = i.m_vertexCount,
            c = i.m_vertices;
        o = e.R, r = l[s];
        var _ = o.col1.x * r.x + o.col2.x * r.y,
            m = o.col1.y * r.x + o.col2.y * r.y;
        o = n.R;
        for (var u = o.col1.x * _ + o.col1.y * m, d = o.col2.x * _ + o.col2.y * m, p = 0, y = Number.MAX_VALUE, f = 0; h > f;) {
            var g = f++;
            r = c[g];
            var v = r.x * u + r.y * d;
            y > v && (y = v, p = g)
        }
        r = a[s], o = e.R;
        var x = e.position.x + (o.col1.x * r.x + o.col2.x * r.y),
            w = e.position.y + (o.col1.y * r.x + o.col2.y * r.y);
        r = c[p], o = n.R;
        var b = n.position.x + (o.col1.x * r.x + o.col2.x * r.y),
            B = n.position.y + (o.col1.y * r.x + o.col2.y * r.y);
        b -= x, B -= w;
        var S = b * _ + B * m;
        return S
    }, p.collision.B2Collision.findMaxSeparation = function(t, e, s, i, n) {
        var o, r, a = e.m_vertexCount,
            l = e.m_normals;
        r = n.R, o = i.m_centroid;
        var h = n.position.x + (r.col1.x * o.x + r.col2.x * o.y),
            c = n.position.y + (r.col1.y * o.x + r.col2.y * o.y);
        r = s.R, o = e.m_centroid, h -= s.position.x + (r.col1.x * o.x + r.col2.x * o.y), c -= s.position.y + (r.col1.y * o.x + r.col2.y * o.y);
        for (var _ = h * s.R.col1.x + c * s.R.col1.y, m = h * s.R.col2.x + c * s.R.col2.y, u = 0, d = -Number.MAX_VALUE, y = 0; a > y;) {
            var f = y++;
            o = l[f];
            var g = o.x * _ + o.y * m;
            g > d && (d = g, u = f)
        }
        var v, x = p.collision.B2Collision.edgeSeparation(e, s, u, i, n);
        v = u - 1 >= 0 ? u - 1 : a - 1;
        var w, b = p.collision.B2Collision.edgeSeparation(e, s, v, i, n);
        w = a > u + 1 ? u + 1 : 0;
        var B, S, A, C = p.collision.B2Collision.edgeSeparation(e, s, w, i, n);
        if (b > x && b > C) A = -1, B = v, S = b;
        else {
            if (!(C > x)) return t[0] = u, x;
            A = 1, B = w, S = C
        }
        for (;;) {
            if (u = -1 == A ? B - 1 >= 0 ? B - 1 : a - 1 : a > B + 1 ? B + 1 : 0, x = p.collision.B2Collision.edgeSeparation(e, s, u, i, n), !(x > S)) break;
            B = u, S = x
        }
        return t[0] = B, S
    }, p.collision.B2Collision.findIncidentEdge = function(t, e, s, i, n, o) {
        var r, a, l = (e.m_vertexCount, e.m_normals),
            h = n.m_vertexCount,
            c = n.m_vertices,
            _ = n.m_normals;
        r = s.R, a = l[i];
        var m = r.col1.x * a.x + r.col2.x * a.y,
            u = r.col1.y * a.x + r.col2.y * a.y;
        r = o.R;
        var d = r.col1.x * m + r.col1.y * u;
        u = r.col2.x * m + r.col2.y * u, m = d;
        for (var p = 0, y = Number.MAX_VALUE, f = 0; h > f;) {
            var g = f++;
            a = _[g];
            var v = m * a.x + u * a.y;
            y > v && (y = v, p = g)
        }
        var x, w, b = p;
        w = h > b + 1 ? b + 1 : 0, x = t[0], a = c[b], r = o.R, x.v.x = o.position.x + (r.col1.x * a.x + r.col2.x * a.y), x.v.y = o.position.y + (r.col1.y * a.x + r.col2.y * a.y), x.id.features.set_referenceEdge(i), x.id.features.set_incidentEdge(b), x.id.features.set_incidentVertex(0), x = t[1], a = c[w], r = o.R, x.v.x = o.position.x + (r.col1.x * a.x + r.col2.x * a.y), x.v.y = o.position.y + (r.col1.y * a.x + r.col2.y * a.y), x.id.features.set_referenceEdge(i), x.id.features.set_incidentEdge(w), x.id.features.set_incidentVertex(1)
    }, p.collision.B2Collision.makeClipPointVector = function() {
        var t = new Array;
        return t[0] = new p.collision.ClipVertex, t[1] = new p.collision.ClipVertex, t
    }, p.collision.B2Collision.collidePolygons = function(t, e, s, i, n) {
        var o;
        t.m_pointCount = 0;
        var r = e.m_radius + i.m_radius,
            a = 0;
        p.collision.B2Collision.s_edgeAO[0] = a;
        var l = p.collision.B2Collision.findMaxSeparation(p.collision.B2Collision.s_edgeAO, e, s, i, n);
        if (a = p.collision.B2Collision.s_edgeAO[0], !(l > r)) {
            var h = 0;
            p.collision.B2Collision.s_edgeBO[0] = h;
            var c = p.collision.B2Collision.findMaxSeparation(p.collision.B2Collision.s_edgeBO, i, n, e, s);
            if (h = p.collision.B2Collision.s_edgeBO[0], !(c > r)) {
                var _, m, u, d, y, f, g, v = .98,
                    x = .001;
                c > v * l + x ? (_ = i, m = e, u = n, d = s, y = h, t.m_type = p.collision.B2ManifoldType.FACE_B, f = 1) : (_ = e, m = i, u = s, d = n, y = a, t.m_type = p.collision.B2ManifoldType.FACE_A, f = 0);
                var w = p.collision.B2Collision.s_incidentEdge;
                p.collision.B2Collision.findIncidentEdge(w, _, u, y, m, d);
                var b, B = _.m_vertexCount,
                    S = _.m_vertices,
                    A = S[y];
                b = B > y + 1 ? S[y + 1 | 0] : S[0];
                var C = p.collision.B2Collision.s_localTangent;
                C.set(b.x - A.x, b.y - A.y), C.normalize();
                var I = p.collision.B2Collision.s_localNormal;
                I.x = C.y, I.y = -C.x;
                var k = p.collision.B2Collision.s_planePoint;
                k.set(.5 * (A.x + b.x), .5 * (A.y + b.y));
                var M = p.collision.B2Collision.s_tangent;
                g = u.R, M.x = g.col1.x * C.x + g.col2.x * C.y, M.y = g.col1.y * C.x + g.col2.y * C.y;
                var V = p.collision.B2Collision.s_tangent2;
                V.x = -M.x, V.y = -M.y;
                var z = p.collision.B2Collision.s_normal;
                z.x = M.y, z.y = -M.x;
                var T = p.collision.B2Collision.s_v11,
                    P = p.collision.B2Collision.s_v12;
                T.x = u.position.x + (g.col1.x * A.x + g.col2.x * A.y), T.y = u.position.y + (g.col1.y * A.x + g.col2.y * A.y), P.x = u.position.x + (g.col1.x * b.x + g.col2.x * b.y), P.y = u.position.y + (g.col1.y * b.x + g.col2.y * b.y);
                var D, L = z.x * T.x + z.y * T.y,
                    F = -M.x * T.x - M.y * T.y + r,
                    K = M.x * P.x + M.y * P.y + r,
                    E = p.collision.B2Collision.s_clipPoints1,
                    G = p.collision.B2Collision.s_clipPoints2;
                if (D = p.collision.B2Collision.clipSegmentToLine(E, w, V, F), !(2 > D || (D = p.collision.B2Collision.clipSegmentToLine(G, E, M, K), 2 > D))) {
                    t.m_localPlaneNormal.setV(I), t.m_localPoint.setV(k);
                    for (var j = 0, R = 0, O = p.common.B2Settings.b2_maxManifoldPoints; O > R;) {
                        var J = R++;
                        o = G[J];
                        var N = z.x * o.v.x + z.y * o.v.y - L;
                        if (r >= N) {
                            var W = t.m_points[j];
                            g = d.R;
                            var Z = o.v.x - d.position.x,
                                q = o.v.y - d.position.y;
                            W.m_localPoint.x = Z * g.col1.x + q * g.col1.y, W.m_localPoint.y = Z * g.col2.x + q * g.col2.y, W.m_id.set(o.id), W.m_id.features.set_flip(f), ++j
                        }
                    }
                    t.m_pointCount = j
                }
            }
        }
    }, p.collision.B2Collision.collideCircles = function(t, e, s, i, n) {
        t.m_pointCount = 0;
        var o, r;
        o = s.R, r = e.m_p;
        var a = s.position.x + (o.col1.x * r.x + o.col2.x * r.y),
            l = s.position.y + (o.col1.y * r.x + o.col2.y * r.y);
        o = n.R, r = i.m_p;
        var h = n.position.x + (o.col1.x * r.x + o.col2.x * r.y),
            c = n.position.y + (o.col1.y * r.x + o.col2.y * r.y),
            _ = h - a,
            m = c - l,
            u = _ * _ + m * m,
            d = e.m_radius + i.m_radius;
        u > d * d || (t.m_type = p.collision.B2ManifoldType.CIRCLES, t.m_localPoint.setV(e.m_p), t.m_localPlaneNormal.setZero(), t.m_pointCount = 1, t.m_points[0].m_localPoint.setV(i.m_p), t.m_points[0].m_id.set_key(0))
    }, p.collision.B2Collision.collidePolygonAndCircle = function(t, e, s, i, n) {
        t.m_pointCount = 0;
        var o, r, a, l;
        l = n.R, a = i.m_p;
        var h = n.position.x + (l.col1.x * a.x + l.col2.x * a.y),
            c = n.position.y + (l.col1.y * a.x + l.col2.y * a.y);
        o = h - s.position.x, r = c - s.position.y, l = s.R;
        for (var _ = o * l.col1.x + r * l.col1.y, m = o * l.col2.x + r * l.col2.y, u = 0, d = -Number.MAX_VALUE, y = e.m_radius + i.m_radius, f = e.m_vertexCount, g = e.m_vertices, v = e.m_normals, x = 0; f > x;) {
            var w = x++;
            a = g[w], o = _ - a.x, r = m - a.y, a = v[w];
            var b = a.x * o + a.y * r;
            if (b > y) return;
            b > d && (d = b, u = w)
        }
        var B, S = u;
        B = f > S + 1 ? S + 1 : 0;
        var A = g[S],
            C = g[B];
        if (d < Number.MIN_VALUE) return t.m_pointCount = 1, t.m_type = p.collision.B2ManifoldType.FACE_A, t.m_localPlaneNormal.setV(v[u]), t.m_localPoint.x = .5 * (A.x + C.x), t.m_localPoint.y = .5 * (A.y + C.y), t.m_points[0].m_localPoint.setV(i.m_p), void t.m_points[0].m_id.set_key(0);
        var I = (_ - A.x) * (C.x - A.x) + (m - A.y) * (C.y - A.y),
            k = (_ - C.x) * (A.x - C.x) + (m - C.y) * (A.y - C.y);
        if (0 >= I) {
            if ((_ - A.x) * (_ - A.x) + (m - A.y) * (m - A.y) > y * y) return;
            t.m_pointCount = 1, t.m_type = p.collision.B2ManifoldType.FACE_A, t.m_localPlaneNormal.x = _ - A.x, t.m_localPlaneNormal.y = m - A.y, t.m_localPlaneNormal.normalize(), t.m_localPoint.setV(A), t.m_points[0].m_localPoint.setV(i.m_p), t.m_points[0].m_id.set_key(0)
        } else if (0 >= k) {
            if ((_ - C.x) * (_ - C.x) + (m - C.y) * (m - C.y) > y * y) return;
            t.m_pointCount = 1, t.m_type = p.collision.B2ManifoldType.FACE_A, t.m_localPlaneNormal.x = _ - C.x, t.m_localPlaneNormal.y = m - C.y, t.m_localPlaneNormal.normalize(), t.m_localPoint.setV(C), t.m_points[0].m_localPoint.setV(i.m_p), t.m_points[0].m_id.set_key(0)
        } else {
            var M = .5 * (A.x + C.x),
                V = .5 * (A.y + C.y);
            if (d = (_ - M) * v[S].x + (m - V) * v[S].y, d > y) return;
            t.m_pointCount = 1, t.m_type = p.collision.B2ManifoldType.FACE_A, t.m_localPlaneNormal.x = v[S].x, t.m_localPlaneNormal.y = v[S].y, t.m_localPlaneNormal.normalize(), t.m_localPoint.set(M, V), t.m_points[0].m_localPoint.setV(i.m_p), t.m_points[0].m_id.set_key(0)
        }
    }, p.collision.B2Simplex = function() {
        this.m_count = 0, this.m_v1 = new p.collision.B2SimplexVertex, this.m_v2 = new p.collision.B2SimplexVertex, this.m_v3 = new p.collision.B2SimplexVertex, this.m_vertices = new Array, this.m_vertices[0] = this.m_v1, this.m_vertices[1] = this.m_v2, this.m_vertices[2] = this.m_v3
    }, i["box2D.collision.B2Simplex"] = p.collision.B2Simplex, p.collision.B2Simplex.__name__ = !0, p.collision.B2Simplex.prototype = {
        readCache: function(t, e, s, i, n) {
            p.common.B2Settings.b2Assert(0 <= t.count && t.count <= 3);
            var o, r;
            this.m_count = t.count;
            for (var a, l = this.m_vertices, h = 0, c = this.m_count; c > h;) {
                var _ = h++;
                a = l[_], a.indexA = t.indexA[_], a.indexB = t.indexB[_], o = e.getVertex(a.indexA), r = i.getVertex(a.indexB), a.wA = p.common.math.B2Math.mulX(s, o), a.wB = p.common.math.B2Math.mulX(n, r), a.w = p.common.math.B2Math.subtractVV(a.wB, a.wA), a.a = 0
            }
            if (this.m_count > 1) {
                var m = t.metric,
                    u = this.getMetric();
                (.5 * m > u || u > 2 * m || u < Number.MIN_VALUE) && (this.m_count = 0)
            }
            0 == this.m_count && (a = l[0], a.indexA = 0, a.indexB = 0, o = e.getVertex(0), r = i.getVertex(0), a.wA = p.common.math.B2Math.mulX(s, o), a.wB = p.common.math.B2Math.mulX(n, r), a.w = p.common.math.B2Math.subtractVV(a.wB, a.wA), this.m_count = 1)
        },
        writeCache: function(t) {
            t.metric = this.getMetric(), t.count = 0 | this.m_count;
            for (var e = this.m_vertices, s = 0, i = this.m_count; i > s;) {
                var n = s++;
                t.indexA[n] = 0 | e[n].indexA, t.indexB[n] = 0 | e[n].indexB
            }
        },
        getSearchDirection: function() {
            var t = this.m_count;
            switch (t) {
                case 1:
                    return this.m_v1.w.getNegative();
                case 2:
                    var e = p.common.math.B2Math.subtractVV(this.m_v2.w, this.m_v1.w),
                        s = p.common.math.B2Math.crossVV(e, this.m_v1.w.getNegative());
                    return s > 0 ? p.common.math.B2Math.crossFV(1, e) : p.common.math.B2Math.crossVF(e, 1);
                default:
                    return p.common.B2Settings.b2Assert(!1), new p.common.math.B2Vec2
            }
        },
        getClosestPoint: function() {
            var t = this.m_count;
            switch (t) {
                case 0:
                    return p.common.B2Settings.b2Assert(!1), new p.common.math.B2Vec2;
                case 1:
                    return this.m_v1.w;
                case 2:
                    return new p.common.math.B2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
                default:
                    return p.common.B2Settings.b2Assert(!1), new p.common.math.B2Vec2
            }
        },
        getWitnessPoints: function(t, e) {
            var s = this.m_count;
            switch (s) {
                case 0:
                    p.common.B2Settings.b2Assert(!1);
                    break;
                case 1:
                    t.setV(this.m_v1.wA), e.setV(this.m_v1.wB);
                    break;
                case 2:
                    t.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x, t.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y, e.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x, e.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
                    break;
                case 3:
                    e.x = t.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x, e.y = t.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
                    break;
                default:
                    p.common.B2Settings.b2Assert(!1)
            }
        },
        getMetric: function() {
            var t = this.m_count;
            switch (t) {
                case 0:
                    return p.common.B2Settings.b2Assert(!1), 0;
                case 1:
                    return 0;
                case 2:
                    return p.common.math.B2Math.subtractVV(this.m_v1.w, this.m_v2.w).length();
                case 3:
                    return p.common.math.B2Math.crossVV(p.common.math.B2Math.subtractVV(this.m_v2.w, this.m_v1.w), p.common.math.B2Math.subtractVV(this.m_v3.w, this.m_v1.w));
                default:
                    return p.common.B2Settings.b2Assert(!1), 0
            }
        },
        solve2: function() {
            var t = this.m_v1.w,
                e = this.m_v2.w,
                s = p.common.math.B2Math.subtractVV(e, t),
                i = -(t.x * s.x + t.y * s.y);
            if (0 >= i) return this.m_v1.a = 1, void(this.m_count = 1);
            var n = e.x * s.x + e.y * s.y;
            if (0 >= n) return this.m_v2.a = 1, this.m_count = 1, void this.m_v1.set(this.m_v2);
            var o = 1 / (n + i);
            this.m_v1.a = n * o, this.m_v2.a = i * o, this.m_count = 2
        },
        solve3: function() {
            var t = this.m_v1.w,
                e = this.m_v2.w,
                s = this.m_v3.w,
                i = p.common.math.B2Math.subtractVV(e, t),
                n = p.common.math.B2Math.dot(t, i),
                o = p.common.math.B2Math.dot(e, i),
                r = o,
                a = -n,
                l = p.common.math.B2Math.subtractVV(s, t),
                h = p.common.math.B2Math.dot(t, l),
                c = p.common.math.B2Math.dot(s, l),
                _ = c,
                m = -h,
                u = p.common.math.B2Math.subtractVV(s, e),
                d = p.common.math.B2Math.dot(e, u),
                y = p.common.math.B2Math.dot(s, u),
                f = y,
                g = -d,
                v = p.common.math.B2Math.crossVV(i, l),
                x = v * p.common.math.B2Math.crossVV(e, s),
                w = v * p.common.math.B2Math.crossVV(s, t),
                b = v * p.common.math.B2Math.crossVV(t, e);
            if (0 >= a && 0 >= m) return this.m_v1.a = 1, void(this.m_count = 1);
            if (r > 0 && a > 0 && 0 >= b) {
                var B = 1 / (r + a);
                return this.m_v1.a = r * B, this.m_v2.a = a * B, void(this.m_count = 2)
            }
            if (_ > 0 && m > 0 && 0 >= w) {
                var S = 1 / (_ + m);
                return this.m_v1.a = _ * S, this.m_v3.a = m * S, this.m_count = 2, void this.m_v2.set(this.m_v3)
            }
            if (0 >= r && 0 >= g) return this.m_v2.a = 1, this.m_count = 1, void this.m_v1.set(this.m_v2);
            if (0 >= _ && 0 >= f) return this.m_v3.a = 1, this.m_count = 1, void this.m_v1.set(this.m_v3);
            if (f > 0 && g > 0 && 0 >= x) {
                var A = 1 / (f + g);
                return this.m_v2.a = f * A, this.m_v3.a = g * A, this.m_count = 2, void this.m_v1.set(this.m_v3)
            }
            var C = 1 / (x + w + b);
            this.m_v1.a = x * C, this.m_v2.a = w * C, this.m_v3.a = b * C, this.m_count = 3
        },
        __class__: p.collision.B2Simplex
    }, p.collision.B2SimplexVertex = function() {
        this.indexB = 0, this.indexA = 0, this.a = 0
    }, i["box2D.collision.B2SimplexVertex"] = p.collision.B2SimplexVertex, p.collision.B2SimplexVertex.__name__ = !0, p.collision.B2SimplexVertex.prototype = {
        set: function(t) {
            this.wA.setV(t.wA), this.wB.setV(t.wB), this.w.setV(t.w), this.a = t.a, this.indexA = t.indexA, this.indexB = t.indexB
        },
        __class__: p.collision.B2SimplexVertex
    }, p.collision.B2Distance = function() {}, i["box2D.collision.B2Distance"] = p.collision.B2Distance, p.collision.B2Distance.__name__ = !0, p.collision.B2Distance.distance = function(t, e, s) {
        ++p.collision.B2Distance.b2_gjkCalls;
        var i = s.proxyA,
            n = s.proxyB,
            o = s.transformA,
            r = s.transformB,
            a = p.collision.B2Distance.s_simplex;
        a.readCache(e, i, o, n, r);
        for (var l, h = a.m_vertices, c = 20, _ = p.collision.B2Distance.s_saveA, m = p.collision.B2Distance.s_saveB, u = 0, d = a.getClosestPoint(), y = d.lengthSquared(), f = y, g = 0; c > g;) {
            u = a.m_count;
            for (var v = 0; u > v;) {
                var x = v++;
                _[x] = h[x].indexA, m[x] = h[x].indexB
            }
            var b = a.m_count;
            switch (b) {
                case 1:
                    break;
                case 2:
                    a.solve2();
                    break;
                case 3:
                    a.solve3();
                    break;
                default:
                    p.common.B2Settings.b2Assert(!1)
            }
            if (3 == a.m_count) break;
            l = a.getClosestPoint(), f = l.lengthSquared(), y = f;
            var B = a.getSearchDirection();
            if (B.lengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) break;
            var S = h[a.m_count];
            S.indexA = w["int"](i.getSupport(p.common.math.B2Math.mulTMV(o.R, B.getNegative()))), S.wA = p.common.math.B2Math.mulX(o, i.getVertex(S.indexA)), S.indexB = w["int"](n.getSupport(p.common.math.B2Math.mulTMV(r.R, B))), S.wB = p.common.math.B2Math.mulX(r, n.getVertex(S.indexB)), S.w = p.common.math.B2Math.subtractVV(S.wB, S.wA), ++g, ++p.collision.B2Distance.b2_gjkIters;
            for (var A = !1, C = 0; u > C;) {
                var I = C++;
                if (S.indexA == _[I] && S.indexB == m[I]) {
                    A = !0;
                    break
                }
            }
            if (A) break;
            ++a.m_count
        }
        if (p.collision.B2Distance.b2_gjkMaxIters = w["int"](p.common.math.B2Math.max(p.collision.B2Distance.b2_gjkMaxIters, g)), a.getWitnessPoints(t.pointA, t.pointB), t.distance = p.common.math.B2Math.subtractVV(t.pointA, t.pointB).length(), t.iterations = g, a.writeCache(e), s.useRadii) {
            var k = i.m_radius,
                M = n.m_radius;
            if (t.distance > k + M && t.distance > Number.MIN_VALUE) {
                t.distance -= k + M;
                var V = p.common.math.B2Math.subtractVV(t.pointB, t.pointA);
                V.normalize(), t.pointA.x += k * V.x, t.pointA.y += k * V.y, t.pointB.x -= M * V.x, t.pointB.y -= M * V.y
            } else l = new p.common.math.B2Vec2, l.x = .5 * (t.pointA.x + t.pointB.x), l.y = .5 * (t.pointA.y + t.pointB.y), t.pointA.x = t.pointB.x = l.x, t.pointA.y = t.pointB.y = l.y, t.distance = 0
        }
    }, p.collision.B2DistanceInput = function() {}, i["box2D.collision.B2DistanceInput"] = p.collision.B2DistanceInput, p.collision.B2DistanceInput.__name__ = !0, p.collision.B2DistanceInput.prototype = {
        __class__: p.collision.B2DistanceInput
    }, p.collision.B2DistanceOutput = function() {
        this.pointA = new p.common.math.B2Vec2, this.pointB = new p.common.math.B2Vec2
    }, i["box2D.collision.B2DistanceOutput"] = p.collision.B2DistanceOutput, p.collision.B2DistanceOutput.__name__ = !0, p.collision.B2DistanceOutput.prototype = {
        __class__: p.collision.B2DistanceOutput
    }, p.collision.B2DistanceProxy = function() {
        this.m_radius = 0, this.m_count = 0, this.m_vertices = new Array
    }, i["box2D.collision.B2DistanceProxy"] = p.collision.B2DistanceProxy, p.collision.B2DistanceProxy.__name__ = !0, p.collision.B2DistanceProxy.prototype = {
        set: function(t) {
            var e = t.getType();
            switch (e) {
                case 1:
                    var s;
                    s = A.Boot.__cast(t, p.collision.shapes.B2CircleShape), this.m_vertices = new Array, this.m_vertices[0] = s.m_p, this.m_count = 1, this.m_radius = s.m_radius;
                    break;
                case 2:
                    var i;
                    i = A.Boot.__cast(t, p.collision.shapes.B2PolygonShape), this.m_vertices = i.m_vertices, this.m_count = i.m_vertexCount, this.m_radius = i.m_radius;
                    break;
                default:
                    p.common.B2Settings.b2Assert(!1)
            }
        },
        getSupport: function(t) {
            for (var e = 0, s = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, i = 1, n = this.m_count; n > i;) {
                var o = i++,
                    r = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                r > s && (e = o, s = r)
            }
            return e
        },
        getSupportVertex: function(t) {
            for (var e = 0, s = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, i = 1, n = this.m_count; n > i;) {
                var o = i++,
                    r = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                r > s && (e = o, s = r)
            }
            return this.m_vertices[e]
        },
        getVertex: function(t) {
            return p.common.B2Settings.b2Assert(t >= 0 && t < this.m_count), this.m_vertices[t]
        },
        __class__: p.collision.B2DistanceProxy
    }, p.collision.B2DynamicTree = function() {
        this.m_root = null, this.m_freeList = null, this.m_path = 0, this.m_insertionCount = 0
    }, i["box2D.collision.B2DynamicTree"] = p.collision.B2DynamicTree, p.collision.B2DynamicTree.__name__ = !0, p.collision.B2DynamicTree.prototype = {
        createProxy: function(t, e) {
            var s = this.allocateNode(),
                i = p.common.B2Settings.b2_aabbExtension,
                n = p.common.B2Settings.b2_aabbExtension;
            return s.aabb.lowerBound.x = t.lowerBound.x - i, s.aabb.lowerBound.y = t.lowerBound.y - n, s.aabb.upperBound.x = t.upperBound.x + i, s.aabb.upperBound.y = t.upperBound.y + n, s.userData = e, this.insertLeaf(s), s
        },
        destroyProxy: function(t) {
            this.removeLeaf(t), this.freeNode(t)
        },
        moveProxy: function(t, e, s) {
            if (p.common.B2Settings.b2Assert(t.isLeaf()), t.aabb.contains(e)) return !1;
            this.removeLeaf(t);
            var i;
            i = p.common.B2Settings.b2_aabbExtension + p.common.B2Settings.b2_aabbMultiplier * (s.x > 0 ? s.x : -s.x);
            var n;
            return n = p.common.B2Settings.b2_aabbExtension + p.common.B2Settings.b2_aabbMultiplier * (s.y > 0 ? s.y : -s.y), t.aabb.lowerBound.x = e.lowerBound.x - i, t.aabb.lowerBound.y = e.lowerBound.y - n, t.aabb.upperBound.x = e.upperBound.x + i, t.aabb.upperBound.y = e.upperBound.y + n, this.insertLeaf(t), !0
        },
        getFatAABB: function(t) {
            return t.aabb
        },
        getUserData: function(t) {
            return t.userData
        },
        query: function(t, e) {
            if (null != this.m_root) {
                var s = new Array,
                    i = 0;
                for (s[i++] = this.m_root; i > 0;) {
                    var n = s[--i];
                    if (n.aabb.testOverlap(e))
                        if (n.isLeaf()) {
                            var o = t(n);
                            if (!o) return
                        } else s[i++] = n.child1, s[i++] = n.child2
                }
            }
        },
        allocateNode: function() {
            if (null != this.m_freeList) {
                var t = this.m_freeList;
                return this.m_freeList = t.parent, t.parent = null, t.child1 = null, t.child2 = null, t
            }
            return new p.collision.B2DynamicTreeNode
        },
        freeNode: function(t) {
            t.parent = this.m_freeList, this.m_freeList = t
        },
        insertLeaf: function(t) {
            if (++this.m_insertionCount, null == this.m_root) return this.m_root = t, void(this.m_root.parent = null);
            var e = t.aabb.getCenter(),
                s = this.m_root;
            if (0 == s.isLeaf())
                do {
                    var i = s.child1,
                        n = s.child2,
                        o = Math.abs((i.aabb.lowerBound.x + i.aabb.upperBound.x) / 2 - e.x) + Math.abs((i.aabb.lowerBound.y + i.aabb.upperBound.y) / 2 - e.y),
                        r = Math.abs((n.aabb.lowerBound.x + n.aabb.upperBound.x) / 2 - e.x) + Math.abs((n.aabb.lowerBound.y + n.aabb.upperBound.y) / 2 - e.y);
                    s = r > o ? i : n
                } while (0 == s.isLeaf());
            var a = s.parent,
                l = this.allocateNode();
            if (l.parent = a, l.userData = null, l.aabb.combine(t.aabb, s.aabb), null != a) {
                s.parent.child1 == s ? a.child1 = l : a.child2 = l, l.child1 = s, l.child2 = t, s.parent = l, t.parent = l;
                do {
                    if (a.aabb.contains(l.aabb)) break;
                    a.aabb.combine(a.child1.aabb, a.child2.aabb), l = a, a = a.parent
                } while (null != a)
            } else l.child1 = s, l.child2 = t, s.parent = l, t.parent = l, this.m_root = l
        },
        removeLeaf: function(t) {
            if (t == this.m_root) return void(this.m_root = null);
            var e, s = t.parent,
                i = s.parent;
            if (e = s.child1 == t ? s.child2 : s.child1, null != i)
                for (i.child1 == s ? i.child1 = e : i.child2 = e, e.parent = i, this.freeNode(s); null != i;) {
                    var n = i.aabb;
                    if (i.aabb = new p.collision.B2AABB, i.aabb.combine(i.child1.aabb, i.child2.aabb), n.contains(i.aabb)) break;
                    i = i.parent
                } else this.m_root = e, e.parent = null, this.freeNode(s)
        },
        __class__: p.collision.B2DynamicTree
    }, p.collision.IBroadPhase = function() {}, i["box2D.collision.IBroadPhase"] = p.collision.IBroadPhase, p.collision.IBroadPhase.__name__ = !0, p.collision.IBroadPhase.prototype = {
        __class__: p.collision.IBroadPhase
    }, p.collision.B2DynamicTreeBroadPhase = function() {
        this.m_tree = new p.collision.B2DynamicTree, this.m_moveBuffer = new Array, this.m_pairBuffer = new Array, this.m_pairCount = 0, this.m_proxyCount = 0
    }, i["box2D.collision.B2DynamicTreeBroadPhase"] = p.collision.B2DynamicTreeBroadPhase, p.collision.B2DynamicTreeBroadPhase.__name__ = !0, p.collision.B2DynamicTreeBroadPhase.__interfaces__ = [p.collision.IBroadPhase], p.collision.B2DynamicTreeBroadPhase.prototype = {
        createProxy: function(t, e) {
            var s = this.m_tree.createProxy(t, e);
            return ++this.m_proxyCount, this.bufferMove(s), s
        },
        destroyProxy: function(t) {
            this.unBufferMove(t), --this.m_proxyCount, this.m_tree.destroyProxy(t)
        },
        moveProxy: function(t, e, s) {
            var i = this.m_tree.moveProxy(t, e, s);
            i && this.bufferMove(t)
        },
        testOverlap: function(t, e) {
            var s = this.m_tree.getFatAABB(t),
                i = this.m_tree.getFatAABB(e);
            return s.testOverlap(i)
        },
        updatePairs: function(t) {
            var e = this;
            this.m_pairCount = 0;
            for (var s = 0, i = this.m_moveBuffer; s < i.length;) {
                var n = [i[s]];
                ++s;
                var o = function(t) {
                        return function(s) {
                            if (s == t[0]) return !0;
                            e.m_pairCount == e.m_pairBuffer.length && (e.m_pairBuffer[e.m_pairCount] = new p.collision.B2DynamicTreePair);
                            var i = e.m_pairBuffer[e.m_pairCount];
                            return s.id < t[0].id ? (i.proxyA = s, i.proxyB = t[0]) : (i.proxyA = t[0], i.proxyB = s), ++e.m_pairCount, !0
                        }
                    }(n),
                    r = this.m_tree.getFatAABB(n[0]);
                this.m_tree.query(o, r)
            }
            this.m_moveBuffer = new Array;
            for (var a = !0, l = 0; a;)
                if (l >= this.m_pairCount) a = !1;
                else {
                    var h = this.m_pairBuffer[l],
                        c = this.m_tree.getUserData(h.proxyA),
                        _ = this.m_tree.getUserData(h.proxyB);
                    for (t(c, _), ++l; l < this.m_pairCount;) {
                        var m = this.m_pairBuffer[l];
                        if (m.proxyA != h.proxyA || m.proxyB != h.proxyB) break;
                        ++l
                    }
                }
        },
        bufferMove: function(t) {
            this.m_moveBuffer[this.m_moveBuffer.length] = t
        },
        unBufferMove: function(t) {
            h.remove(this.m_moveBuffer, t)
        },
        __class__: p.collision.B2DynamicTreeBroadPhase
    }, p.collision.B2DynamicTreeNode = function() {
        this.aabb = new p.collision.B2AABB, this.id = p.collision.B2DynamicTreeNode.currentID++
    }, i["box2D.collision.B2DynamicTreeNode"] = p.collision.B2DynamicTreeNode, p.collision.B2DynamicTreeNode.__name__ = !0, p.collision.B2DynamicTreeNode.prototype = {
        isLeaf: function() {
            return null == this.child1
        },
        __class__: p.collision.B2DynamicTreeNode
    }, p.collision.B2DynamicTreePair = function() {}, i["box2D.collision.B2DynamicTreePair"] = p.collision.B2DynamicTreePair, p.collision.B2DynamicTreePair.__name__ = !0, p.collision.B2DynamicTreePair.prototype = {
        __class__: p.collision.B2DynamicTreePair
    }, p.collision.B2Manifold = function() {
        this.m_pointCount = 0, this.m_points = new Array;
        for (var t = 0, e = p.common.B2Settings.b2_maxManifoldPoints; e > t;) {
            var s = t++;
            this.m_points[s] = new p.collision.B2ManifoldPoint
        }
        this.m_localPlaneNormal = new p.common.math.B2Vec2, this.m_localPoint = new p.common.math.B2Vec2
    }, i["box2D.collision.B2Manifold"] = p.collision.B2Manifold, p.collision.B2Manifold.__name__ = !0, p.collision.B2Manifold.prototype = {
        __class__: p.collision.B2Manifold
    }, p.collision.B2ManifoldPoint = function() {
        this.m_localPoint = new p.common.math.B2Vec2, this.m_id = new p.collision.B2ContactID, this.reset()
    }, i["box2D.collision.B2ManifoldPoint"] = p.collision.B2ManifoldPoint, p.collision.B2ManifoldPoint.__name__ = !0, p.collision.B2ManifoldPoint.prototype = {
        reset: function() {
            this.m_localPoint.setZero(), this.m_normalImpulse = 0, this.m_tangentImpulse = 0, this.m_id.set_key(0)
        },
        __class__: p.collision.B2ManifoldPoint
    }, p.collision.B2ManifoldType = i["box2D.collision.B2ManifoldType"] = {
        __ename__: !0,
        __constructs__: ["CIRCLES", "FACE_A", "FACE_B"]
    }, p.collision.B2ManifoldType.CIRCLES = ["CIRCLES", 0], p.collision.B2ManifoldType.CIRCLES.toString = n, p.collision.B2ManifoldType.CIRCLES.__enum__ = p.collision.B2ManifoldType, p.collision.B2ManifoldType.FACE_A = ["FACE_A", 1], p.collision.B2ManifoldType.FACE_A.toString = n, p.collision.B2ManifoldType.FACE_A.__enum__ = p.collision.B2ManifoldType, p.collision.B2ManifoldType.FACE_B = ["FACE_B", 2], p.collision.B2ManifoldType.FACE_B.toString = n, p.collision.B2ManifoldType.FACE_B.__enum__ = p.collision.B2ManifoldType, p.collision.B2SeparationFunction = function() {
        this.m_localPoint = new p.common.math.B2Vec2, this.m_axis = new p.common.math.B2Vec2
    }, i["box2D.collision.B2SeparationFunction"] = p.collision.B2SeparationFunction, p.collision.B2SeparationFunction.__name__ = !0, p.collision.B2SeparationFunction.prototype = {
        initialize: function(t, e, s, i, n) {
            this.m_proxyA = e, this.m_proxyB = i;
            var o = t.count;
            p.common.B2Settings.b2Assert(o > 0 && 3 > o);
            var r, a, l, h, c, _, m, u, d, y, f, g, v, x, w = new p.common.math.B2Vec2,
                b = new p.common.math.B2Vec2;
            if (1 == o) this.m_type = p.collision.B2SeparationFunctionType.POINTS, w = this.m_proxyA.getVertex(t.indexA[0]), b = this.m_proxyB.getVertex(t.indexB[0]), g = w, f = s.R, c = s.position.x + (f.col1.x * g.x + f.col2.x * g.y), _ = s.position.y + (f.col1.y * g.x + f.col2.y * g.y), g = b, f = n.R, m = n.position.x + (f.col1.x * g.x + f.col2.x * g.y), u = n.position.y + (f.col1.y * g.x + f.col2.y * g.y), this.m_axis.x = m - c, this.m_axis.y = u - _, this.m_axis.normalize();
            else if (t.indexB[0] == t.indexB[1]) this.m_type = p.collision.B2SeparationFunctionType.FACE_A, r = this.m_proxyA.getVertex(t.indexA[0]), a = this.m_proxyA.getVertex(t.indexA[1]), b = this.m_proxyB.getVertex(t.indexB[0]), this.m_localPoint.x = .5 * (r.x + a.x), this.m_localPoint.y = .5 * (r.y + a.y), this.m_axis = p.common.math.B2Math.crossVF(p.common.math.B2Math.subtractVV(a, r), 1), this.m_axis.normalize(), g = this.m_axis, f = s.R, d = f.col1.x * g.x + f.col2.x * g.y, y = f.col1.y * g.x + f.col2.y * g.y, g = this.m_localPoint, f = s.R, c = s.position.x + (f.col1.x * g.x + f.col2.x * g.y), _ = s.position.y + (f.col1.y * g.x + f.col2.y * g.y), g = b, f = n.R, m = n.position.x + (f.col1.x * g.x + f.col2.x * g.y), u = n.position.y + (f.col1.y * g.x + f.col2.y * g.y), v = (m - c) * d + (u - _) * y, 0 > v && this.m_axis.negativeSelf();
            else if (t.indexA[0] == t.indexA[0]) this.m_type = p.collision.B2SeparationFunctionType.FACE_B, l = this.m_proxyB.getVertex(t.indexB[0]), h = this.m_proxyB.getVertex(t.indexB[1]), w = this.m_proxyA.getVertex(t.indexA[0]), this.m_localPoint.x = .5 * (l.x + h.x), this.m_localPoint.y = .5 * (l.y + h.y), this.m_axis = p.common.math.B2Math.crossVF(p.common.math.B2Math.subtractVV(h, l), 1), this.m_axis.normalize(), g = this.m_axis, f = n.R, d = f.col1.x * g.x + f.col2.x * g.y, y = f.col1.y * g.x + f.col2.y * g.y, g = this.m_localPoint, f = n.R, m = n.position.x + (f.col1.x * g.x + f.col2.x * g.y), u = n.position.y + (f.col1.y * g.x + f.col2.y * g.y), g = w, f = s.R, c = s.position.x + (f.col1.x * g.x + f.col2.x * g.y), _ = s.position.y + (f.col1.y * g.x + f.col2.y * g.y), v = (c - m) * d + (_ - u) * y, 0 > v && this.m_axis.negativeSelf();
            else {
                r = this.m_proxyA.getVertex(t.indexA[0]), a = this.m_proxyA.getVertex(t.indexA[1]), l = this.m_proxyB.getVertex(t.indexB[0]), h = this.m_proxyB.getVertex(t.indexB[1]);
                var B = (p.common.math.B2Math.mulX(s, w), p.common.math.B2Math.mulMV(s.R, p.common.math.B2Math.subtractVV(a, r))),
                    S = (p.common.math.B2Math.mulX(n, b), p.common.math.B2Math.mulMV(n.R, p.common.math.B2Math.subtractVV(h, l))),
                    A = B.x * B.x + B.y * B.y,
                    C = S.x * S.x + S.y * S.y,
                    I = p.common.math.B2Math.subtractVV(S, B),
                    k = B.x * I.x + B.y * I.y,
                    M = S.x * I.x + S.y * I.y,
                    V = B.x * S.x + B.y * S.y,
                    z = A * C - V * V;
                v = 0, 0 != z && (v = p.common.math.B2Math.clamp((V * M - k * C) / z, 0, 1));
                var T = (V * v + M) / C;
                0 > T && (T = 0, v = p.common.math.B2Math.clamp((V - k) / A, 0, 1)), w = new p.common.math.B2Vec2, w.x = r.x + v * (a.x - r.x), w.y = r.y + v * (a.y - r.y), b = new p.common.math.B2Vec2, b.x = l.x + v * (h.x - l.x), b.y = l.y + v * (h.y - l.y), 0 == v || 1 == v ? (this.m_type = p.collision.B2SeparationFunctionType.FACE_B, this.m_axis = p.common.math.B2Math.crossVF(p.common.math.B2Math.subtractVV(h, l), 1), this.m_axis.normalize(), this.m_localPoint = b, g = this.m_axis, f = n.R, d = f.col1.x * g.x + f.col2.x * g.y, y = f.col1.y * g.x + f.col2.y * g.y, g = this.m_localPoint, f = n.R, m = n.position.x + (f.col1.x * g.x + f.col2.x * g.y), u = n.position.y + (f.col1.y * g.x + f.col2.y * g.y), g = w, f = s.R, c = s.position.x + (f.col1.x * g.x + f.col2.x * g.y), _ = s.position.y + (f.col1.y * g.x + f.col2.y * g.y), x = (c - m) * d + (_ - u) * y, 0 > v && this.m_axis.negativeSelf()) : (this.m_type = p.collision.B2SeparationFunctionType.FACE_A, this.m_axis = p.common.math.B2Math.crossVF(p.common.math.B2Math.subtractVV(a, r), 1), this.m_localPoint = w, g = this.m_axis, f = s.R, d = f.col1.x * g.x + f.col2.x * g.y, y = f.col1.y * g.x + f.col2.y * g.y, g = this.m_localPoint, f = s.R, c = s.position.x + (f.col1.x * g.x + f.col2.x * g.y), _ = s.position.y + (f.col1.y * g.x + f.col2.y * g.y), g = b, f = n.R, m = n.position.x + (f.col1.x * g.x + f.col2.x * g.y), u = n.position.y + (f.col1.y * g.x + f.col2.y * g.y), x = (m - c) * d + (u - _) * y, 0 > v && this.m_axis.negativeSelf())
            }
        },
        evaluate: function(t, e) {
            var s, i, n, o, r, a, l, h, c = this.m_type;
            switch (c[1]) {
                case 0:
                    return s = p.common.math.B2Math.mulTMV(t.R, this.m_axis), i = p.common.math.B2Math.mulTMV(e.R, this.m_axis.getNegative()), n = this.m_proxyA.getSupportVertex(s), o = this.m_proxyB.getSupportVertex(i), r = p.common.math.B2Math.mulX(t, n), a = p.common.math.B2Math.mulX(e, o), l = (a.x - r.x) * this.m_axis.x + (a.y - r.y) * this.m_axis.y;
                case 1:
                    return h = p.common.math.B2Math.mulMV(t.R, this.m_axis), r = p.common.math.B2Math.mulX(t, this.m_localPoint), i = p.common.math.B2Math.mulTMV(e.R, h.getNegative()), o = this.m_proxyB.getSupportVertex(i), a = p.common.math.B2Math.mulX(e, o), l = (a.x - r.x) * h.x + (a.y - r.y) * h.y;
                case 2:
                    return h = p.common.math.B2Math.mulMV(e.R, this.m_axis), a = p.common.math.B2Math.mulX(e, this.m_localPoint), s = p.common.math.B2Math.mulTMV(t.R, h.getNegative()), n = this.m_proxyA.getSupportVertex(s), r = p.common.math.B2Math.mulX(t, n), l = (r.x - a.x) * h.x + (r.y - a.y) * h.y
            }
        },
        __class__: p.collision.B2SeparationFunction
    }, p.collision.B2SeparationFunctionType = i["box2D.collision.B2SeparationFunctionType"] = {
        __ename__: !0,
        __constructs__: ["POINTS", "FACE_A", "FACE_B"]
    }, p.collision.B2SeparationFunctionType.POINTS = ["POINTS", 0], p.collision.B2SeparationFunctionType.POINTS.toString = n, p.collision.B2SeparationFunctionType.POINTS.__enum__ = p.collision.B2SeparationFunctionType, p.collision.B2SeparationFunctionType.FACE_A = ["FACE_A", 1], p.collision.B2SeparationFunctionType.FACE_A.toString = n, p.collision.B2SeparationFunctionType.FACE_A.__enum__ = p.collision.B2SeparationFunctionType, p.collision.B2SeparationFunctionType.FACE_B = ["FACE_B", 2], p.collision.B2SeparationFunctionType.FACE_B.toString = n, p.collision.B2SeparationFunctionType.FACE_B.__enum__ = p.collision.B2SeparationFunctionType, p.collision.B2SimplexCache = function() {
        this.count = 0, this.metric = 0, this.indexA = new Array, this.indexB = new Array
    }, i["box2D.collision.B2SimplexCache"] = p.collision.B2SimplexCache, p.collision.B2SimplexCache.__name__ = !0, p.collision.B2SimplexCache.prototype = {
        __class__: p.collision.B2SimplexCache
    }, p.collision.B2TOIInput = function() {
        this.proxyA = new p.collision.B2DistanceProxy, this.proxyB = new p.collision.B2DistanceProxy, this.sweepA = new p.common.math.B2Sweep, this.sweepB = new p.common.math.B2Sweep
    }, i["box2D.collision.B2TOIInput"] = p.collision.B2TOIInput, p.collision.B2TOIInput.__name__ = !0, p.collision.B2TOIInput.prototype = {
        __class__: p.collision.B2TOIInput
    }, p.common.math.B2Transform = function(t, e) {
        this.position = new p.common.math.B2Vec2, this.R = new p.common.math.B2Mat22, null != t && (this.position.setV(t), this.R.setM(e))
    }, i["box2D.common.math.B2Transform"] = p.common.math.B2Transform, p.common.math.B2Transform.__name__ = !0, p.common.math.B2Transform.prototype = {
        __class__: p.common.math.B2Transform
    }, p.common.math.B2Mat22 = function() {
        this.col1 = new p.common.math.B2Vec2(0, 1), this.col2 = new p.common.math.B2Vec2(0, 1)
    }, i["box2D.common.math.B2Mat22"] = p.common.math.B2Mat22, p.common.math.B2Mat22.__name__ = !0, p.common.math.B2Mat22.fromAngle = function(t) {
        var e = new p.common.math.B2Mat22;
        return e.set(t), e
    }, p.common.math.B2Mat22.prototype = {
        set: function(t) {
            var e = Math.cos(t),
                s = Math.sin(t);
            this.col1.x = e, this.col2.x = -s, this.col1.y = s, this.col2.y = e
        },
        setM: function(t) {
            this.col1.setV(t.col1), this.col2.setV(t.col2)
        },
        addM: function(t) {
            this.col1.x += t.col1.x, this.col1.y += t.col1.y, this.col2.x += t.col2.x, this.col2.y += t.col2.y
        },
        setZero: function() {
            this.col1.x = 0, this.col2.x = 0, this.col1.y = 0, this.col2.y = 0
        },
        getInverse: function(t) {
            var e = this.col1.x,
                s = this.col2.x,
                i = this.col1.y,
                n = this.col2.y,
                o = e * n - s * i;
            return 0 != o && (o = 1 / o), t.col1.x = o * n, t.col2.x = -o * s, t.col1.y = -o * i, t.col2.y = o * e, t
        },
        solve: function(t, e, s) {
            var i = this.col1.x,
                n = this.col2.x,
                o = this.col1.y,
                r = this.col2.y,
                a = i * r - n * o;
            return 0 != a && (a = 1 / a), t.x = a * (r * e - n * s), t.y = a * (i * s - o * e), t
        },
        __class__: p.common.math.B2Mat22
    }, p.collision.B2TimeOfImpact = function() {}, i["box2D.collision.B2TimeOfImpact"] = p.collision.B2TimeOfImpact, p.collision.B2TimeOfImpact.__name__ = !0, p.collision.B2TimeOfImpact.timeOfImpact = function(t) {
        ++p.collision.B2TimeOfImpact.b2_toiCalls;
        var e = t.proxyA,
            s = t.proxyB,
            i = t.sweepA,
            n = t.sweepB;
        p.common.B2Settings.b2Assert(i.t0 == n.t0), p.common.B2Settings.b2Assert(1 - i.t0 > Number.MIN_VALUE);
        var o = e.m_radius + s.m_radius,
            r = t.tolerance,
            a = 0,
            l = 1e3,
            h = 0,
            c = 0;
        for (p.collision.B2TimeOfImpact.s_cache.count = 0, p.collision.B2TimeOfImpact.s_distanceInput.useRadii = !1;;) {
            if (i.getTransform(p.collision.B2TimeOfImpact.s_xfA, a), n.getTransform(p.collision.B2TimeOfImpact.s_xfB, a), p.collision.B2TimeOfImpact.s_distanceInput.proxyA = e, p.collision.B2TimeOfImpact.s_distanceInput.proxyB = s, p.collision.B2TimeOfImpact.s_distanceInput.transformA = p.collision.B2TimeOfImpact.s_xfA, p.collision.B2TimeOfImpact.s_distanceInput.transformB = p.collision.B2TimeOfImpact.s_xfB, p.collision.B2Distance.distance(p.collision.B2TimeOfImpact.s_distanceOutput, p.collision.B2TimeOfImpact.s_cache, p.collision.B2TimeOfImpact.s_distanceInput), p.collision.B2TimeOfImpact.s_distanceOutput.distance <= 0) {
                a = 1;
                break
            }
            p.collision.B2TimeOfImpact.s_fcn.initialize(p.collision.B2TimeOfImpact.s_cache, e, p.collision.B2TimeOfImpact.s_xfA, s, p.collision.B2TimeOfImpact.s_xfB);
            var _ = p.collision.B2TimeOfImpact.s_fcn.evaluate(p.collision.B2TimeOfImpact.s_xfA, p.collision.B2TimeOfImpact.s_xfB);
            if (0 >= _) {
                a = 1;
                break
            }
            if (0 == h && (c = _ > o ? p.common.math.B2Math.max(o - r, .75 * o) : p.common.math.B2Math.max(_ - r, .02 * o)), .5 * r > _ - c) {
                if (0 == h) {
                    a = 1;
                    break
                }
                break
            }
            var m = a,
                u = a,
                d = 1,
                y = _;
            i.getTransform(p.collision.B2TimeOfImpact.s_xfA, d), n.getTransform(p.collision.B2TimeOfImpact.s_xfB, d);
            var f = p.collision.B2TimeOfImpact.s_fcn.evaluate(p.collision.B2TimeOfImpact.s_xfA, p.collision.B2TimeOfImpact.s_xfB);
            if (f >= c) {
                a = 1;
                break
            }
            for (var g = 0;;) {
                var v;
                v = 0 != (1 & g) ? u + (c - y) * (d - u) / (f - y) : .5 * (u + d), i.getTransform(p.collision.B2TimeOfImpact.s_xfA, v), n.getTransform(p.collision.B2TimeOfImpact.s_xfB, v);
                var x = p.collision.B2TimeOfImpact.s_fcn.evaluate(p.collision.B2TimeOfImpact.s_xfA, p.collision.B2TimeOfImpact.s_xfB);
                if (p.common.math.B2Math.abs(x - c) < .025 * r) {
                    m = v;
                    break
                }
                if (x > c ? (u = v, y = x) : (d = v, f = x), ++g, ++p.collision.B2TimeOfImpact.b2_toiRootIters, 50 == g) break
            }
            if (p.collision.B2TimeOfImpact.b2_toiMaxRootIters = w["int"](p.common.math.B2Math.max(p.collision.B2TimeOfImpact.b2_toiMaxRootIters, g)), m < (1 + 100 * Number.MIN_VALUE) * a) break;
            if (a = m, h++, ++p.collision.B2TimeOfImpact.b2_toiIters, h == l) break
        }
        return p.collision.B2TimeOfImpact.b2_toiMaxIters = w["int"](p.common.math.B2Math.max(p.collision.B2TimeOfImpact.b2_toiMaxIters, h)), a
    }, p.collision.B2WorldManifold = function() {
        this.m_normal = new p.common.math.B2Vec2, this.m_points = new Array;
        for (var t = 0, e = p.common.B2Settings.b2_maxManifoldPoints; e > t;) {
            var s = t++;
            this.m_points[s] = new p.common.math.B2Vec2
        }
    }, i["box2D.collision.B2WorldManifold"] = p.collision.B2WorldManifold, p.collision.B2WorldManifold.__name__ = !0, p.collision.B2WorldManifold.prototype = {
        initialize: function(t, e, s, i, n) {
            if (0 != t.m_pointCount) {
                var o, r, a, l, h, c, _, m, u = t.m_type;
                switch (u[1]) {
                    case 0:
                        r = e.R, o = t.m_localPoint;
                        var d = e.position.x + r.col1.x * o.x + r.col2.x * o.y,
                            p = e.position.y + r.col1.y * o.x + r.col2.y * o.y;
                        r = i.R, o = t.m_points[0].m_localPoint;
                        var y = i.position.x + r.col1.x * o.x + r.col2.x * o.y,
                            f = i.position.y + r.col1.y * o.x + r.col2.y * o.y,
                            g = y - d,
                            v = f - p,
                            x = g * g + v * v;
                        if (x > Number.MIN_VALUE * Number.MIN_VALUE) {
                            var w = Math.sqrt(x);
                            this.m_normal.x = g / w, this.m_normal.y = v / w
                        } else this.m_normal.x = 1, this.m_normal.y = 0;
                        var b = d + s * this.m_normal.x,
                            B = p + s * this.m_normal.y,
                            S = y - n * this.m_normal.x,
                            A = f - n * this.m_normal.y;
                        this.m_points[0].x = .5 * (b + S), this.m_points[0].y = .5 * (B + A);
                        break;
                    case 1:
                        r = e.R, o = t.m_localPlaneNormal, a = r.col1.x * o.x + r.col2.x * o.y, l = r.col1.y * o.x + r.col2.y * o.y, r = e.R, o = t.m_localPoint, h = e.position.x + r.col1.x * o.x + r.col2.x * o.y, c = e.position.y + r.col1.y * o.x + r.col2.y * o.y, this.m_normal.x = a, this.m_normal.y = l;
                        for (var C = 0, I = t.m_pointCount; I > C;) {
                            var k = C++;
                            r = i.R, o = t.m_points[k].m_localPoint, _ = i.position.x + r.col1.x * o.x + r.col2.x * o.y, m = i.position.y + r.col1.y * o.x + r.col2.y * o.y, this.m_points[k].x = _ + .5 * (s - (_ - h) * a - (m - c) * l - n) * a, this.m_points[k].y = m + .5 * (s - (_ - h) * a - (m - c) * l - n) * l
                        }
                        break;
                    case 2:
                        r = i.R, o = t.m_localPlaneNormal, a = r.col1.x * o.x + r.col2.x * o.y, l = r.col1.y * o.x + r.col2.y * o.y, r = i.R, o = t.m_localPoint, h = i.position.x + r.col1.x * o.x + r.col2.x * o.y, c = i.position.y + r.col1.y * o.x + r.col2.y * o.y, this.m_normal.x = -a, this.m_normal.y = -l;
                        for (var M = 0, V = t.m_pointCount; V > M;) {
                            var z = M++;
                            r = e.R, o = t.m_points[z].m_localPoint, _ = e.position.x + r.col1.x * o.x + r.col2.x * o.y, m = e.position.y + r.col1.y * o.x + r.col2.y * o.y, this.m_points[z].x = _ + .5 * (n - (_ - h) * a - (m - c) * l - s) * a, this.m_points[z].y = m + .5 * (n - (_ - h) * a - (m - c) * l - s) * l
                        }
                }
            }
        },
        __class__: p.collision.B2WorldManifold
    }, p.collision.shapes = {}, p.collision.shapes.B2Shape = function() {
        this.m_type = 0, this.m_radius = p.common.B2Settings.b2_linearSlop
    }, i["box2D.collision.shapes.B2Shape"] = p.collision.shapes.B2Shape, p.collision.shapes.B2Shape.__name__ = !0, p.collision.shapes.B2Shape.testOverlap = function(t, e, s, i) {
        var n = new p.collision.B2DistanceInput;
        n.proxyA = new p.collision.B2DistanceProxy, n.proxyA.set(t), n.proxyB = new p.collision.B2DistanceProxy, n.proxyB.set(s), n.transformA = e, n.transformB = i, n.useRadii = !0;
        var o = new p.collision.B2SimplexCache;
        o.count = 0;
        var r = new p.collision.B2DistanceOutput;
        return p.collision.B2Distance.distance(r, o, n), r.distance < 10 * Number.MIN_VALUE
    }, p.collision.shapes.B2Shape.prototype = {
        copy: function() {
            return null
        },
        set: function(t) {
            this.m_radius = t.m_radius
        },
        getType: function() {
            return this.m_type
        },
        computeAABB: function() {},
        computeMass: function() {},
        __class__: p.collision.shapes.B2Shape
    }, p.collision.shapes.B2CircleShape = function(t) {
        null == t && (t = 0), p.collision.shapes.B2Shape.call(this), this.m_p = new p.common.math.B2Vec2, this.m_type = 1, this.m_radius = t
    }, i["box2D.collision.shapes.B2CircleShape"] = p.collision.shapes.B2CircleShape, p.collision.shapes.B2CircleShape.__name__ = !0, p.collision.shapes.B2CircleShape.__super__ = p.collision.shapes.B2Shape, p.collision.shapes.B2CircleShape.prototype = t(p.collision.shapes.B2Shape.prototype, {
        copy: function() {
            var t = new p.collision.shapes.B2CircleShape;
            return t.set(this), t
        },
        set: function(t) {
            if (p.collision.shapes.B2Shape.prototype.set.call(this, t), A.Boot.__instanceof(t, p.collision.shapes.B2CircleShape)) {
                var e;
                e = A.Boot.__cast(t, p.collision.shapes.B2CircleShape), this.m_p.setV(e.m_p)
            }
        },
        computeAABB: function(t, e) {
            var s = e.R,
                i = e.position.x + (s.col1.x * this.m_p.x + s.col2.x * this.m_p.y),
                n = e.position.y + (s.col1.y * this.m_p.x + s.col2.y * this.m_p.y);
            t.lowerBound.set(i - this.m_radius, n - this.m_radius), t.upperBound.set(i + this.m_radius, n + this.m_radius)
        },
        computeMass: function(t, e) {
            t.mass = e * p.common.B2Settings.b2_pi * this.m_radius * this.m_radius, t.center.setV(this.m_p), t.I = t.mass * (.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
        },
        __class__: p.collision.shapes.B2CircleShape
    }), p.collision.shapes.B2EdgeShape = function() {}, i["box2D.collision.shapes.B2EdgeShape"] = p.collision.shapes.B2EdgeShape, p.collision.shapes.B2EdgeShape.__name__ = !0, p.collision.shapes.B2EdgeShape.__super__ = p.collision.shapes.B2Shape, p.collision.shapes.B2EdgeShape.prototype = t(p.collision.shapes.B2Shape.prototype, {
        computeAABB: function(t, e) {
            var s = e.R,
                i = e.position.x + (s.col1.x * this.m_v1.x + s.col2.x * this.m_v1.y),
                n = e.position.y + (s.col1.y * this.m_v1.x + s.col2.y * this.m_v1.y),
                o = e.position.x + (s.col1.x * this.m_v2.x + s.col2.x * this.m_v2.y),
                r = e.position.y + (s.col1.y * this.m_v2.x + s.col2.y * this.m_v2.y);
            o > i ? (t.lowerBound.x = i, t.upperBound.x = o) : (t.lowerBound.x = o, t.upperBound.x = i), r > n ? (t.lowerBound.y = n, t.upperBound.y = r) : (t.lowerBound.y = r, t.upperBound.y = n)
        },
        computeMass: function(t) {
            t.mass = 0, t.center.setV(this.m_v1), t.I = 0
        },
        __class__: p.collision.shapes.B2EdgeShape
    }), p.collision.shapes.B2MassData = function() {
        this.mass = 0, this.center = new p.common.math.B2Vec2(0, 0), this.I = 0
    }, i["box2D.collision.shapes.B2MassData"] = p.collision.shapes.B2MassData, p.collision.shapes.B2MassData.__name__ = !0, p.collision.shapes.B2MassData.prototype = {
        __class__: p.collision.shapes.B2MassData
    }, p.collision.shapes.B2PolygonShape = function() {
        this.m_vertexCount = 0, p.collision.shapes.B2Shape.call(this), this.m_type = 2, this.m_centroid = new p.common.math.B2Vec2, this.m_vertices = new Array, this.m_normals = new Array
    }, i["box2D.collision.shapes.B2PolygonShape"] = p.collision.shapes.B2PolygonShape, p.collision.shapes.B2PolygonShape.__name__ = !0, p.collision.shapes.B2PolygonShape.__super__ = p.collision.shapes.B2Shape, p.collision.shapes.B2PolygonShape.prototype = t(p.collision.shapes.B2Shape.prototype, {
        copy: function() {
            var t = new p.collision.shapes.B2PolygonShape;
            return t.set(this), t
        },
        set: function(t) {
            if (p.collision.shapes.B2Shape.prototype.set.call(this, t), A.Boot.__instanceof(t, p.collision.shapes.B2PolygonShape)) {
                var e;
                e = A.Boot.__cast(t, p.collision.shapes.B2PolygonShape), this.m_centroid.setV(e.m_centroid), this.m_vertexCount = e.m_vertexCount, this.reserve(this.m_vertexCount);
                for (var s = 0, i = this.m_vertexCount; i > s;) {
                    var n = s++;
                    this.m_vertices[n].setV(e.m_vertices[n]), this.m_normals[n].setV(e.m_normals[n])
                }
            }
        },
        setAsBox: function(t, e) {
            this.m_vertexCount = 4, this.reserve(4), this.m_vertices[0].set(-t, -e), this.m_vertices[1].set(t, -e), this.m_vertices[2].set(t, e), this.m_vertices[3].set(-t, e), this.m_normals[0].set(0, -1), this.m_normals[1].set(1, 0), this.m_normals[2].set(0, 1), this.m_normals[3].set(-1, 0), this.m_centroid.setZero()
        },
        computeAABB: function(t, e) {
            for (var s = e.R, i = this.m_vertices[0], n = e.position.x + (s.col1.x * i.x + s.col2.x * i.y), o = e.position.y + (s.col1.y * i.x + s.col2.y * i.y), r = n, a = o, l = 1, h = this.m_vertexCount; h > l;) {
                var c = l++;
                i = this.m_vertices[c];
                var _ = e.position.x + (s.col1.x * i.x + s.col2.x * i.y),
                    m = e.position.y + (s.col1.y * i.x + s.col2.y * i.y);
                n = _ > n ? n : _, o = m > o ? o : m, r = r > _ ? r : _, a = a > m ? a : m
            }
            t.lowerBound.x = n - this.m_radius, t.lowerBound.y = o - this.m_radius, t.upperBound.x = r + this.m_radius, t.upperBound.y = a + this.m_radius
        },
        computeMass: function(t, e) {
            if (2 == this.m_vertexCount) return t.center.x = .5 * (this.m_vertices[0].x + this.m_vertices[1].x), t.center.y = .5 * (this.m_vertices[0].y + this.m_vertices[1].y), t.mass = 0, void(t.I = 0);
            for (var s = 0, i = 0, n = 0, o = 0, r = 0, a = 0, l = .3333333333333333, h = 0, c = this.m_vertexCount; c > h;) {
                var _, m = h++,
                    u = this.m_vertices[m];
                _ = m + 1 < this.m_vertexCount ? this.m_vertices[m + 1 | 0] : this.m_vertices[0];
                var d = u.x - r,
                    p = u.y - a,
                    y = _.x - r,
                    f = _.y - a,
                    g = d * f - p * y,
                    v = .5 * g;
                n += v, s += v * l * (r + u.x + _.x), i += v * l * (a + u.y + _.y);
                var x = r,
                    w = a,
                    b = d,
                    B = p,
                    S = y,
                    A = f,
                    C = l * (.25 * (b * b + S * b + S * S) + (x * b + x * S)) + .5 * x * x,
                    I = l * (.25 * (B * B + A * B + A * A) + (w * B + w * A)) + .5 * w * w;
                o += g * (C + I)
            }
            t.mass = e * n, s *= 1 / n, i *= 1 / n, t.center.set(s, i), t.I = e * o
        },
        reserve: function(t) {
            for (var e = this.m_vertices.length; t > e;) {
                var s = e++;
                this.m_vertices[s] = new p.common.math.B2Vec2, this.m_normals[s] = new p.common.math.B2Vec2
            }
        },
        __class__: p.collision.shapes.B2PolygonShape
    }), p.common.B2Settings = function() {}, i["box2D.common.B2Settings"] = p.common.B2Settings, p.common.B2Settings.__name__ = !0, p.common.B2Settings.b2MixFriction = function(t, e) {
        return Math.sqrt(t * e)
    }, p.common.B2Settings.b2MixRestitution = function(t, e) {
        return t > e ? t : e
    }, p.common.B2Settings.b2Assert = function(t) {
        if (!t) throw "Assertion Failed"
    }, p.common.math.B2Mat33 = function(t, e, s) {
        this.col1 = new p.common.math.B2Vec3, this.col2 = new p.common.math.B2Vec3, this.col3 = new p.common.math.B2Vec3, null == t && null == e && null == s ? (this.col1.setZero(), this.col2.setZero(), this.col3.setZero()) : (this.col1.setV(t), this.col2.setV(e), this.col3.setV(s))
    }, i["box2D.common.math.B2Mat33"] = p.common.math.B2Mat33, p.common.math.B2Mat33.__name__ = !0, p.common.math.B2Mat33.prototype = {
        solve22: function(t, e, s) {
            var i = this.col1.x,
                n = this.col2.x,
                o = this.col1.y,
                r = this.col2.y,
                a = i * r - n * o;
            return 0 != a && (a = 1 / a), t.x = a * (r * e - n * s), t.y = a * (i * s - o * e), t
        },
        solve33: function(t, e, s, i) {
            var n = this.col1.x,
                o = this.col1.y,
                r = this.col1.z,
                a = this.col2.x,
                l = this.col2.y,
                h = this.col2.z,
                c = this.col3.x,
                _ = this.col3.y,
                m = this.col3.z,
                u = n * (l * m - h * _) + o * (h * c - a * m) + r * (a * _ - l * c);
            return 0 != u && (u = 1 / u), t.x = u * (e * (l * m - h * _) + s * (h * c - a * m) + i * (a * _ - l * c)), t.y = u * (n * (s * m - i * _) + o * (i * c - e * m) + r * (e * _ - s * c)), t.z = u * (n * (l * i - h * s) + o * (h * e - a * i) + r * (a * s - l * e)), t
        },
        __class__: p.common.math.B2Mat33
    }, p.common.math.B2Math = function() {}, i["box2D.common.math.B2Math"] = p.common.math.B2Math, p.common.math.B2Math.__name__ = !0, p.common.math.B2Math.dot = function(t, e) {
        return t.x * e.x + t.y * e.y
    }, p.common.math.B2Math.crossVV = function(t, e) {
        return t.x * e.y - t.y * e.x
    }, p.common.math.B2Math.crossVF = function(t, e) {
        var s = new p.common.math.B2Vec2(e * t.y, -e * t.x);
        return s
    }, p.common.math.B2Math.crossFV = function(t, e) {
        var s = new p.common.math.B2Vec2(-t * e.y, t * e.x);
        return s
    }, p.common.math.B2Math.mulMV = function(t, e) {
        var s = new p.common.math.B2Vec2(t.col1.x * e.x + t.col2.x * e.y, t.col1.y * e.x + t.col2.y * e.y);
        return s
    }, p.common.math.B2Math.mulTMV = function(t, e) {
        var s = new p.common.math.B2Vec2(p.common.math.B2Math.dot(e, t.col1), p.common.math.B2Math.dot(e, t.col2));
        return s
    }, p.common.math.B2Math.mulX = function(t, e) {
        var s = p.common.math.B2Math.mulMV(t.R, e);
        return s.x += t.position.x, s.y += t.position.y, s
    }, p.common.math.B2Math.mulXT = function(t, e) {
        var s = p.common.math.B2Math.subtractVV(e, t.position),
            i = s.x * t.R.col1.x + s.y * t.R.col1.y;
        return s.y = s.x * t.R.col2.x + s.y * t.R.col2.y, s.x = i, s
    }, p.common.math.B2Math.subtractVV = function(t, e) {
        var s = new p.common.math.B2Vec2(t.x - e.x, t.y - e.y);
        return s
    }, p.common.math.B2Math.abs = function(t) {
        return t > 0 ? t : -t
    }, p.common.math.B2Math.min = function(t, e) {
        return e > t ? t : e
    }, p.common.math.B2Math.max = function(t, e) {
        return t > e ? t : e
    }, p.common.math.B2Math.clamp = function(t, e, s) {
        return e > t ? e : t > s ? s : t
    }, p.common.math.B2Sweep = function() {
        this.localCenter = new p.common.math.B2Vec2, this.c0 = new p.common.math.B2Vec2, this.c = new p.common.math.B2Vec2
    }, i["box2D.common.math.B2Sweep"] = p.common.math.B2Sweep, p.common.math.B2Sweep.__name__ = !0, p.common.math.B2Sweep.prototype = {
        set: function(t) {
            this.localCenter.setV(t.localCenter), this.c0.setV(t.c0), this.c.setV(t.c), this.a0 = t.a0, this.a = t.a, this.t0 = t.t0
        },
        getTransform: function(t, e) {
            t.position.x = (1 - e) * this.c0.x + e * this.c.x, t.position.y = (1 - e) * this.c0.y + e * this.c.y;
            var s = (1 - e) * this.a0 + e * this.a;
            t.R.set(s);
            var i = t.R;
            t.position.x -= i.col1.x * this.localCenter.x + i.col2.x * this.localCenter.y, t.position.y -= i.col1.y * this.localCenter.x + i.col2.y * this.localCenter.y
        },
        advance: function(t) {
            if (this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
                var e = (t - this.t0) / (1 - this.t0);
                this.c0.x = (1 - e) * this.c0.x + e * this.c.x, this.c0.y = (1 - e) * this.c0.y + e * this.c.y, this.a0 = (1 - e) * this.a0 + e * this.a, this.t0 = t
            }
        },
        __class__: p.common.math.B2Sweep
    }, p.common.math.B2Vec3 = function(t, e, s) {
        null == s && (s = 0), null == e && (e = 0), null == t && (t = 0), this.x = t, this.y = e, this.z = s
    }, i["box2D.common.math.B2Vec3"] = p.common.math.B2Vec3, p.common.math.B2Vec3.__name__ = !0, p.common.math.B2Vec3.prototype = {
        setZero: function() {
            this.x = this.y = this.z = 0
        },
        set: function(t, e, s) {
            this.x = t, this.y = e, this.z = s
        },
        setV: function(t) {
            this.x = t.x, this.y = t.y, this.z = t.z
        },
        copy: function() {
            return new p.common.math.B2Vec3(this.x, this.y, this.z)
        },
        add: function(t) {
            this.x += t.x, this.y += t.y, this.z += t.z
        },
        __class__: p.common.math.B2Vec3
    }, p.dynamics.B2Body = function(t, e) {
        this.m_xf = new p.common.math.B2Transform, this.m_sweep = new p.common.math.B2Sweep, this.m_linearVelocity = new p.common.math.B2Vec2, this.m_force = new p.common.math.B2Vec2, this.m_flags = 0, t.bullet && (this.m_flags |= p.dynamics.B2Body.e_bulletFlag), t.fixedRotation && (this.m_flags |= p.dynamics.B2Body.e_fixedRotationFlag), t.allowSleep && (this.m_flags |= p.dynamics.B2Body.e_allowSleepFlag), t.awake && (this.m_flags |= p.dynamics.B2Body.e_awakeFlag), t.active && (this.m_flags |= p.dynamics.B2Body.e_activeFlag), this.m_world = e, this.m_xf.position.setV(t.position), this.m_xf.R.set(t.angle), this.m_sweep.localCenter.setZero(), this.m_sweep.t0 = 1, this.m_sweep.a0 = this.m_sweep.a = t.angle;
        var s = this.m_xf.R,
            i = this.m_sweep.localCenter;
        this.m_sweep.c.x = s.col1.x * i.x + s.col2.x * i.y, this.m_sweep.c.y = s.col1.y * i.x + s.col2.y * i.y, this.m_sweep.c.x += this.m_xf.position.x, this.m_sweep.c.y += this.m_xf.position.y, this.m_sweep.c0.setV(this.m_sweep.c), this.m_jointList = null, this.m_controllerList = null, this.m_contactList = null, this.m_controllerCount = 0, this.m_prev = null, this.m_next = null, this.m_linearVelocity.setV(t.linearVelocity), this.m_angularVelocity = t.angularVelocity, this.m_linearDamping = t.linearDamping, this.m_angularDamping = t.angularDamping, this.m_force.set(0, 0), this.m_torque = 0, this.m_sleepTime = 0, this.m_type = t.type, 2 == this.m_type ? (this.m_mass = 1, this.m_invMass = 1) : (this.m_mass = 0, this.m_invMass = 0), this.m_I = 0, this.m_invI = 0, this.m_inertiaScale = t.inertiaScale, this.m_userData = t.userData, this.m_fixtureList = null, this.m_fixtureCount = 0
    }, i["box2D.dynamics.B2Body"] = p.dynamics.B2Body, p.dynamics.B2Body.__name__ = !0, p.dynamics.B2Body.prototype = {
        createFixture: function(t) {
            if (1 == this.m_world.isLocked()) return null;
            var e = new p.dynamics.B2Fixture;
            if (e.create(this, this.m_xf, t), 0 != (this.m_flags & p.dynamics.B2Body.e_activeFlag)) {
                var s = this.m_world.m_contactManager.m_broadPhase;
                e.createProxy(s, this.m_xf)
            }
            return e.m_next = this.m_fixtureList, this.m_fixtureList = e, ++this.m_fixtureCount, e.m_body = this, e.m_density > 0 && this.resetMassData(), this.m_world.m_flags |= p.dynamics.B2World.e_newFixture, e
        },
        setPositionAndAngle: function(t, e) {
            var s;
            if (1 != this.m_world.isLocked()) {
                this.m_xf.R.set(e), this.m_xf.position.setV(t);
                var i = this.m_xf.R,
                    n = this.m_sweep.localCenter;
                this.m_sweep.c.x = i.col1.x * n.x + i.col2.x * n.y, this.m_sweep.c.y = i.col1.y * n.x + i.col2.y * n.y, this.m_sweep.c.x += this.m_xf.position.x, this.m_sweep.c.y += this.m_xf.position.y, this.m_sweep.c0.setV(this.m_sweep.c), this.m_sweep.a0 = this.m_sweep.a = e;
                var o = this.m_world.m_contactManager.m_broadPhase;
                for (s = this.m_fixtureList; null != s;) s.synchronize(o, this.m_xf, this.m_xf), s = s.m_next;
                this.m_world.m_contactManager.findNewContacts()
            }
        },
        getTransform: function() {
            return this.m_xf
        },
        getPosition: function() {
            return this.m_xf.position
        },
        setPosition: function(t) {
            this.setPositionAndAngle(t, this.getAngle())
        },
        getAngle: function() {
            return this.m_sweep.a
        },
        setAngle: function(t) {
            this.setPositionAndAngle(this.getPosition(), t)
        },
        getWorldCenter: function() {
            return this.m_sweep.c
        },
        getLocalCenter: function() {
            return this.m_sweep.localCenter
        },
        getLinearVelocity: function() {
            return this.m_linearVelocity
        },
        applyTorque: function(t) {
            2 == this.m_type && (0 == this.isAwake() && this.setAwake(!0), this.m_torque += t)
        },
        getMass: function() {
            return this.m_mass
        },
        resetMassData: function() {
            if (this.m_mass = 0, this.m_invMass = 0, this.m_I = 0, this.m_invI = 0, this.m_sweep.localCenter.setZero(), 0 != this.m_type && 1 != this.m_type) {
                for (var t = p.common.math.B2Vec2.make(0, 0), e = this.m_fixtureList; null != e;)
                    if (0 != e.m_density) {
                        var s = e.getMassData();
                        this.m_mass += s.mass, t.x += s.center.x * s.mass, t.y += s.center.y * s.mass, this.m_I += s.I, e = e.m_next
                    } else e = e.m_next;
                this.m_mass > 0 ? (this.m_invMass = 1 / this.m_mass, t.x *= this.m_invMass, t.y *= this.m_invMass) : (this.m_mass = 1, this.m_invMass = 1), this.m_I > 0 && 0 == (this.m_flags & p.dynamics.B2Body.e_fixedRotationFlag) ? (this.m_I -= this.m_mass * (t.x * t.x + t.y * t.y), this.m_I *= this.m_inertiaScale, p.common.B2Settings.b2Assert(this.m_I > 0), this.m_invI = 1 / this.m_I) : (this.m_I = 0, this.m_invI = 0);
                var i = this.m_sweep.c.copy();
                this.m_sweep.localCenter.setV(t), this.m_sweep.c0.setV(p.common.math.B2Math.mulX(this.m_xf, this.m_sweep.localCenter)), this.m_sweep.c.setV(this.m_sweep.c0), this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - i.y), this.m_linearVelocity.y += this.m_angularVelocity * (this.m_sweep.c.x - i.x)
            }
        },
        getWorldPoint: function(t) {
            var e = this.m_xf.R,
                s = new p.common.math.B2Vec2(e.col1.x * t.x + e.col2.x * t.y, e.col1.y * t.x + e.col2.y * t.y);
            return s.x += this.m_xf.position.x, s.y += this.m_xf.position.y, s
        },
        getWorldVector: function(t) {
            return p.common.math.B2Math.mulMV(this.m_xf.R, t)
        },
        getLocalPoint: function(t) {
            return p.common.math.B2Math.mulXT(this.m_xf, t)
        },
        getType: function() {
            return this.m_type
        },
        setBullet: function(t) {
            t ? this.m_flags |= p.dynamics.B2Body.e_bulletFlag : this.m_flags &= ~p.dynamics.B2Body.e_bulletFlag
        },
        isBullet: function() {
            return (this.m_flags & p.dynamics.B2Body.e_bulletFlag) == p.dynamics.B2Body.e_bulletFlag
        },
        setAwake: function(t) {
            t ? (this.m_flags |= p.dynamics.B2Body.e_awakeFlag, this.m_sleepTime = 0) : (this.m_flags &= ~p.dynamics.B2Body.e_awakeFlag, this.m_sleepTime = 0, this.m_linearVelocity.setZero(), this.m_angularVelocity = 0, this.m_force.setZero(), this.m_torque = 0)
        },
        isAwake: function() {
            return (this.m_flags & p.dynamics.B2Body.e_awakeFlag) == p.dynamics.B2Body.e_awakeFlag
        },
        isActive: function() {
            return (this.m_flags & p.dynamics.B2Body.e_activeFlag) == p.dynamics.B2Body.e_activeFlag
        },
        getContactList: function() {
            return this.m_contactList
        },
        getUserData: function() {
            return this.m_userData
        },
        setUserData: function(t) {
            this.m_userData = t
        },
        synchronizeFixtures: function() {
            var t = p.dynamics.B2Body.s_xf1;
            t.R.set(this.m_sweep.a0);
            var e = t.R,
                s = this.m_sweep.localCenter;
            t.position.x = this.m_sweep.c0.x - (e.col1.x * s.x + e.col2.x * s.y), t.position.y = this.m_sweep.c0.y - (e.col1.y * s.x + e.col2.y * s.y);
            var i, n = this.m_world.m_contactManager.m_broadPhase;
            for (i = this.m_fixtureList; null != i;) i.synchronize(n, t, this.m_xf), i = i.m_next
        },
        synchronizeTransform: function() {
            this.m_xf.R.set(this.m_sweep.a);
            var t = this.m_xf.R,
                e = this.m_sweep.localCenter;
            this.m_xf.position.x = this.m_sweep.c.x - (t.col1.x * e.x + t.col2.x * e.y), this.m_xf.position.y = this.m_sweep.c.y - (t.col1.y * e.x + t.col2.y * e.y)
        },
        shouldCollide: function(t) {
            if (2 != this.m_type && 2 != t.m_type) return !1;
            for (var e = this.m_jointList; null != e;) {
                if (e.other == t && 0 == e.joint.m_collideConnected) return !1;
                e = e.next
            }
            return !0
        },
        advance: function(t) {
            this.m_sweep.advance(t), this.m_sweep.c.setV(this.m_sweep.c0), this.m_sweep.a = this.m_sweep.a0, this.synchronizeTransform()
        },
        __class__: p.dynamics.B2Body
    }, p.dynamics.B2BodyDef = function() {
        this.position = new p.common.math.B2Vec2, this.linearVelocity = new p.common.math.B2Vec2, this.userData = null, this.angle = 0, this.angularVelocity = 0, this.linearDamping = 0, this.angularDamping = 0, this.allowSleep = !0, this.awake = !0, this.fixedRotation = !1, this.bullet = !1, this.type = 0, this.active = !0, this.inertiaScale = 1
    }, i["box2D.dynamics.B2BodyDef"] = p.dynamics.B2BodyDef, p.dynamics.B2BodyDef.__name__ = !0, p.dynamics.B2BodyDef.prototype = {
        __class__: p.dynamics.B2BodyDef
    }, p.dynamics.B2ContactFilter = function() {}, i["box2D.dynamics.B2ContactFilter"] = p.dynamics.B2ContactFilter, p.dynamics.B2ContactFilter.__name__ = !0, p.dynamics.B2ContactFilter.prototype = {
        shouldCollide: function(t, e) {
            var s = t.getFilterData(),
                i = e.getFilterData();
            if (s.groupIndex == i.groupIndex && 0 != s.groupIndex) return s.groupIndex > 0;
            var n = 0 != (s.maskBits & i.categoryBits) && 0 != (s.categoryBits & i.maskBits);
            return n
        },
        __class__: p.dynamics.B2ContactFilter
    }, p.dynamics.B2ContactImpulse = function() {
        this.normalImpulses = new Array, this.tangentImpulses = new Array
    }, i["box2D.dynamics.B2ContactImpulse"] = p.dynamics.B2ContactImpulse, p.dynamics.B2ContactImpulse.__name__ = !0, p.dynamics.B2ContactImpulse.prototype = {
        __class__: p.dynamics.B2ContactImpulse
    }, p.dynamics.B2ContactManager = function() {
        this.m_world = null, this.m_contactCount = 0, this.m_contactFilter = p.dynamics.B2ContactFilter.b2_defaultFilter, this.m_contactListener = p.dynamics.B2ContactListener.b2_defaultListener, this.m_contactFactory = new p.dynamics.contacts.B2ContactFactory(this.m_allocator), this.m_broadPhase = new p.collision.B2DynamicTreeBroadPhase
    }, i["box2D.dynamics.B2ContactManager"] = p.dynamics.B2ContactManager, p.dynamics.B2ContactManager.__name__ = !0, p.dynamics.B2ContactManager.prototype = {
        addPair: function(t, e) {
            var s;
            s = A.Boot.__cast(t, p.dynamics.B2Fixture);
            var i;
            i = A.Boot.__cast(e, p.dynamics.B2Fixture);
            var n = s.getBody(),
                o = i.getBody();
            if (n != o) {
                for (var r = o.getContactList(); null != r;) {
                    if (r.other == n) {
                        var a = r.contact.getFixtureA(),
                            l = r.contact.getFixtureB();
                        if (a == s && l == i) return;
                        if (a == i && l == s) return
                    }
                    r = r.next
                }
                if (0 != o.shouldCollide(n) && 0 != this.m_contactFilter.shouldCollide(s, i)) {
                    var h = this.m_contactFactory.create(s, i);
                    s = h.getFixtureA(), i = h.getFixtureB(), n = s.m_body, o = i.m_body, h.m_prev = null, h.m_next = this.m_world.m_contactList, null != this.m_world.m_contactList && (this.m_world.m_contactList.m_prev = h), this.m_world.m_contactList = h, h.m_nodeA.contact = h, h.m_nodeA.other = o, h.m_nodeA.prev = null, h.m_nodeA.next = n.m_contactList, null != n.m_contactList && (n.m_contactList.prev = h.m_nodeA), n.m_contactList = h.m_nodeA, h.m_nodeB.contact = h, h.m_nodeB.other = n, h.m_nodeB.prev = null, h.m_nodeB.next = o.m_contactList, null != o.m_contactList && (o.m_contactList.prev = h.m_nodeB), o.m_contactList = h.m_nodeB, ++this.m_world.m_contactCount
                }
            }
        },
        findNewContacts: function() {
            this.m_broadPhase.updatePairs(s(this, this.addPair))
        },
        destroy: function(t) {
            var e = t.getFixtureA(),
                s = t.getFixtureB(),
                i = e.getBody(),
                n = s.getBody();
            t.isTouching() && this.m_contactListener.endContact(t), null != t.m_prev && (t.m_prev.m_next = t.m_next), null != t.m_next && (t.m_next.m_prev = t.m_prev), t == this.m_world.m_contactList && (this.m_world.m_contactList = t.m_next), null != t.m_nodeA.prev && (t.m_nodeA.prev.next = t.m_nodeA.next), null != t.m_nodeA.next && (t.m_nodeA.next.prev = t.m_nodeA.prev), t.m_nodeA == i.m_contactList && (i.m_contactList = t.m_nodeA.next), null != t.m_nodeB.prev && (t.m_nodeB.prev.next = t.m_nodeB.next), null != t.m_nodeB.next && (t.m_nodeB.next.prev = t.m_nodeB.prev), t.m_nodeB == n.m_contactList && (n.m_contactList = t.m_nodeB.next), this.m_contactFactory.destroy(t), --this.m_contactCount
        },
        collide: function() {
            for (var t = this.m_world.m_contactList; null != t;) {
                var e = t.getFixtureA(),
                    s = t.getFixtureB(),
                    i = e.getBody(),
                    n = s.getBody();
                if (0 != i.isAwake() || 0 != n.isAwake()) {
                    if (0 != (t.m_flags & p.dynamics.contacts.B2Contact.e_filterFlag)) {
                        if (0 == n.shouldCollide(i)) {
                            var o = t;
                            t = o.getNext(), this.destroy(o);
                            continue
                        }
                        if (0 == this.m_contactFilter.shouldCollide(e, s)) {
                            var r = t;
                            t = r.getNext(), this.destroy(r);
                            continue
                        }
                        t.m_flags &= ~p.dynamics.contacts.B2Contact.e_filterFlag
                    }
                    var a = e.m_proxy,
                        l = s.m_proxy,
                        h = this.m_broadPhase.testOverlap(a, l);
                    if (0 != h) t.update(this.m_contactListener), t = t.getNext();
                    else {
                        var c = t;
                        t = c.getNext(), this.destroy(c)
                    }
                } else t = t.getNext()
            }
        },
        __class__: p.dynamics.B2ContactManager
    }, p.dynamics.B2DebugDraw = function() {}, i["box2D.dynamics.B2DebugDraw"] = p.dynamics.B2DebugDraw, p.dynamics.B2DebugDraw.__name__ = !0, p.dynamics.B2DestructionListener = function() {}, i["box2D.dynamics.B2DestructionListener"] = p.dynamics.B2DestructionListener, p.dynamics.B2DestructionListener.__name__ = !0, p.dynamics.B2DestructionListener.prototype = {
        sayGoodbyeJoint: function() {},
        sayGoodbyeFixture: function() {},
        __class__: p.dynamics.B2DestructionListener
    }, p.dynamics.B2FilterData = function() {
        this.categoryBits = 1, this.maskBits = 65535, this.groupIndex = 0
    }, i["box2D.dynamics.B2FilterData"] = p.dynamics.B2FilterData, p.dynamics.B2FilterData.__name__ = !0, p.dynamics.B2FilterData.prototype = {
        copy: function() {
            var t = new p.dynamics.B2FilterData;
            return t.categoryBits = this.categoryBits, t.maskBits = this.maskBits, t.groupIndex = this.groupIndex, t
        },
        __class__: p.dynamics.B2FilterData
    }, p.dynamics.B2Fixture = function() {
        this.m_filter = new p.dynamics.B2FilterData, this.m_aabb = new p.collision.B2AABB, this.m_userData = null, this.m_body = null, this.m_next = null, this.m_shape = null, this.m_density = 0, this.m_friction = 0, this.m_restitution = 0
    }, i["box2D.dynamics.B2Fixture"] = p.dynamics.B2Fixture, p.dynamics.B2Fixture.__name__ = !0, p.dynamics.B2Fixture.prototype = {
        getType: function() {
            return this.m_shape.getType()
        },
        getShape: function() {
            return this.m_shape
        },
        isSensor: function() {
            return this.m_isSensor
        },
        getFilterData: function() {
            return this.m_filter.copy()
        },
        getBody: function() {
            return this.m_body
        },
        getMassData: function(t) {
            return null == t && (t = new p.collision.shapes.B2MassData), this.m_shape.computeMass(t, this.m_density), t
        },
        getFriction: function() {
            return this.m_friction
        },
        getRestitution: function() {
            return this.m_restitution
        },
        create: function(t, e, s) {
            this.m_userData = s.userData, this.m_friction = s.friction, this.m_restitution = s.restitution, this.m_body = t, this.m_next = null, this.m_filter = s.filter.copy(), this.m_isSensor = s.isSensor, this.m_shape = s.shape.copy(), this.m_density = s.density
        },
        destroy: function() {
            this.m_shape = null
        },
        createProxy: function(t, e) {
            this.m_shape.computeAABB(this.m_aabb, e), this.m_proxy = t.createProxy(this.m_aabb, this)
        },
        destroyProxy: function(t) {
            null != this.m_proxy && (t.destroyProxy(this.m_proxy), this.m_proxy = null)
        },
        synchronize: function(t, e, s) {
            if (null != this.m_proxy) {
                var i = new p.collision.B2AABB,
                    n = new p.collision.B2AABB;
                this.m_shape.computeAABB(i, e), this.m_shape.computeAABB(n, s), this.m_aabb.combine(i, n);
                var o = p.common.math.B2Math.subtractVV(s.position, e.position);
                t.moveProxy(this.m_proxy, this.m_aabb, o)
            }
        },
        __class__: p.dynamics.B2Fixture
    }, p.dynamics.B2FixtureDef = function() {
        this.filter = new p.dynamics.B2FilterData, this.shape = null, this.userData = null, this.friction = .2, this.restitution = 0, this.density = 0, this.filter.categoryBits = 1, this.filter.maskBits = 65535, this.filter.groupIndex = 0, this.isSensor = !1
    }, i["box2D.dynamics.B2FixtureDef"] = p.dynamics.B2FixtureDef, p.dynamics.B2FixtureDef.__name__ = !0, p.dynamics.B2FixtureDef.prototype = {
        __class__: p.dynamics.B2FixtureDef
    }, p.dynamics.B2Island = function() {
        this.m_jointCapacity = 0, this.m_contactCapacity = 0, this.m_bodyCapacity = 0, this.m_contactCount = 0, this.m_jointCount = 0, this.m_bodyCount = 0, this.m_bodies = new Array, this.m_contacts = new Array, this.m_joints = new Array
    }, i["box2D.dynamics.B2Island"] = p.dynamics.B2Island, p.dynamics.B2Island.__name__ = !0, p.dynamics.B2Island.prototype = {
        initialize: function(t, e, s, i, n, o) {
            this.m_bodyCapacity = t, this.m_contactCapacity = e, this.m_jointCapacity = s, this.m_bodyCount = 0, this.m_contactCount = 0, this.m_jointCount = 0, this.m_allocator = i, this.m_listener = n, this.m_contactSolver = o;
            for (var r = this.m_bodies.length; t > r;) {
                var a = r++;
                this.m_bodies[a] = null
            }
            for (var l = this.m_contacts.length; e > l;) {
                var h = l++;
                this.m_contacts[h] = null
            }
            for (var c = this.m_joints.length; s > c;) {
                var _ = c++;
                this.m_joints[_] = null
            }
        },
        clear: function() {
            this.m_bodyCount = 0, this.m_contactCount = 0, this.m_jointCount = 0
        },
        solve: function(t, e, s) {
            for (var i, n, o = 0, r = this.m_bodyCount; r > o;) {
                var a = o++;
                i = this.m_bodies[a], 2 == i.getType() && (i.m_linearVelocity.x += t.dt * (e.x + i.m_invMass * i.m_force.x), i.m_linearVelocity.y += t.dt * (e.y + i.m_invMass * i.m_force.y), i.m_angularVelocity += t.dt * i.m_invI * i.m_torque, i.m_linearVelocity.multiply(p.common.math.B2Math.clamp(1 - t.dt * i.m_linearDamping, 0, 1)), i.m_angularVelocity *= p.common.math.B2Math.clamp(1 - t.dt * i.m_angularDamping, 0, 1))
            }
            this.m_contactSolver.initialize(t, this.m_contacts, this.m_contactCount, this.m_allocator);
            var l = this.m_contactSolver;
            l.initVelocityConstraints(t);
            for (var h = 0, c = this.m_jointCount; c > h;) {
                var _ = h++;
                n = this.m_joints[_], n.initVelocityConstraints(t)
            }
            for (var m = 0, u = t.velocityIterations; u > m;) {
                for (var d = (m++, 0), y = this.m_jointCount; y > d;) {
                    var f = d++;
                    n = this.m_joints[f], n.solveVelocityConstraints(t)
                }
                l.solveVelocityConstraints()
            }
            for (var g = 0, v = this.m_jointCount; v > g;) {
                var x = g++;
                n = this.m_joints[x], n.finalizeVelocityConstraints()
            }
            l.finalizeVelocityConstraints();
            for (var w = 0, b = this.m_bodyCount; b > w;) {
                var B = w++;
                if (i = this.m_bodies[B], 0 != i.getType()) {
                    var S = t.dt * i.m_linearVelocity.x,
                        A = t.dt * i.m_linearVelocity.y;
                    S * S + A * A > p.common.B2Settings.b2_maxTranslationSquared && (i.m_linearVelocity.normalize(), i.m_linearVelocity.x *= p.common.B2Settings.b2_maxTranslation * t.inv_dt, i.m_linearVelocity.y *= p.common.B2Settings.b2_maxTranslation * t.inv_dt);
                    var C = t.dt * i.m_angularVelocity;
                    C * C > p.common.B2Settings.b2_maxRotationSquared && (i.m_angularVelocity = i.m_angularVelocity < 0 ? -p.common.B2Settings.b2_maxRotation * t.inv_dt : p.common.B2Settings.b2_maxRotation * t.inv_dt), i.m_sweep.c0.setV(i.m_sweep.c), i.m_sweep.a0 = i.m_sweep.a, i.m_sweep.c.x += t.dt * i.m_linearVelocity.x, i.m_sweep.c.y += t.dt * i.m_linearVelocity.y, i.m_sweep.a += t.dt * i.m_angularVelocity, i.synchronizeTransform()
                }
            }
            for (var I = 0, k = t.positionIterations; k > I;) {
                for (var M = (I++, l.solvePositionConstraints(p.common.B2Settings.b2_contactBaumgarte)), V = !0, z = 0, T = this.m_jointCount; T > z;) {
                    var P = z++;
                    n = this.m_joints[P];
                    var D = n.solvePositionConstraints(p.common.B2Settings.b2_contactBaumgarte);
                    V = V && D
                }
                if (M && V) break
            }
            if (this.report(l.m_constraints), s) {
                for (var L = Number.MAX_VALUE, F = p.common.B2Settings.b2_linearSleepTolerance * p.common.B2Settings.b2_linearSleepTolerance, K = p.common.B2Settings.b2_angularSleepTolerance * p.common.B2Settings.b2_angularSleepTolerance, E = 0, G = this.m_bodyCount; G > E;) {
                    var j = E++;
                    i = this.m_bodies[j], 0 != i.getType() && (0 == (i.m_flags & p.dynamics.B2Body.e_allowSleepFlag) && (i.m_sleepTime = 0, L = 0), 0 == (i.m_flags & p.dynamics.B2Body.e_allowSleepFlag) || i.m_angularVelocity * i.m_angularVelocity > K || p.common.math.B2Math.dot(i.m_linearVelocity, i.m_linearVelocity) > F ? (i.m_sleepTime = 0, L = 0) : (i.m_sleepTime += t.dt, L = p.common.math.B2Math.min(L, i.m_sleepTime)))
                }
                if (L >= p.common.B2Settings.b2_timeToSleep)
                    for (var R = 0, O = this.m_bodyCount; O > R;) {
                        var J = R++;
                        i = this.m_bodies[J], i.setAwake(!1)
                    }
            }
        },
        solveTOI: function(t) {
            this.m_contactSolver.initialize(t, this.m_contacts, this.m_contactCount, this.m_allocator);
            for (var e = this.m_contactSolver, s = 0, i = this.m_jointCount; i > s;) {
                var n = s++;
                this.m_joints[n].initVelocityConstraints(t)
            }
            for (var o = 0, r = t.velocityIterations; r > o;) {
                {
                    o++
                }
                e.solveVelocityConstraints();
                for (var a = 0, l = this.m_jointCount; l > a;) {
                    var h = a++;
                    this.m_joints[h].solveVelocityConstraints(t)
                }
            }
            for (var c = 0, _ = this.m_bodyCount; _ > c;) {
                var m = c++,
                    u = this.m_bodies[m];
                if (0 != u.getType()) {
                    var d = t.dt * u.m_linearVelocity.x,
                        y = t.dt * u.m_linearVelocity.y;
                    d * d + y * y > p.common.B2Settings.b2_maxTranslationSquared && (u.m_linearVelocity.normalize(), u.m_linearVelocity.x *= p.common.B2Settings.b2_maxTranslation * t.inv_dt, u.m_linearVelocity.y *= p.common.B2Settings.b2_maxTranslation * t.inv_dt);
                    var f = t.dt * u.m_angularVelocity;
                    f * f > p.common.B2Settings.b2_maxRotationSquared && (u.m_angularVelocity = u.m_angularVelocity < 0 ? -p.common.B2Settings.b2_maxRotation * t.inv_dt : p.common.B2Settings.b2_maxRotation * t.inv_dt), u.m_sweep.c0.setV(u.m_sweep.c), u.m_sweep.a0 = u.m_sweep.a, u.m_sweep.c.x += t.dt * u.m_linearVelocity.x, u.m_sweep.c.y += t.dt * u.m_linearVelocity.y, u.m_sweep.a += t.dt * u.m_angularVelocity, u.synchronizeTransform()
                }
            }
            for (var g = .75, v = 0, x = t.positionIterations; x > v;) {
                for (var w = (v++, e.solvePositionConstraints(g)), b = !0, B = 0, S = this.m_jointCount; S > B;) {
                    var A = B++,
                        C = this.m_joints[A].solvePositionConstraints(p.common.B2Settings.b2_contactBaumgarte);
                    b = b && C
                }
                if (w && b) break
            }
            this.report(e.m_constraints)
        },
        report: function(t) {
            if (null != this.m_listener)
                for (var e = 0, s = this.m_contactCount; s > e;) {
                    for (var i = e++, n = this.m_contacts[i], o = t[i], r = 0, a = o.pointCount; a > r;) {
                        var l = r++;
                        p.dynamics.B2Island.s_impulse.normalImpulses[l] = o.points[l].normalImpulse, p.dynamics.B2Island.s_impulse.tangentImpulses[l] = o.points[l].tangentImpulse
                    }
                    this.m_listener.postSolve(n, p.dynamics.B2Island.s_impulse)
                }
        },
        addBody: function(t) {
            t.m_islandIndex = this.m_bodyCount, this.m_bodies[this.m_bodyCount++] = t
        },
        addContact: function(t) {
            this.m_contacts[this.m_contactCount++] = t
        },
        addJoint: function(t) {
            this.m_joints[this.m_jointCount++] = t
        },
        __class__: p.dynamics.B2Island
    }, p.dynamics.B2TimeStep = function() {
        this.positionIterations = 0, this.velocityIterations = 0, this.dtRatio = 0, this.inv_dt = 0, this.dt = 0
    }, i["box2D.dynamics.B2TimeStep"] = p.dynamics.B2TimeStep, p.dynamics.B2TimeStep.__name__ = !0, p.dynamics.B2TimeStep.prototype = {
        set: function(t) {
            this.dt = t.dt, this.inv_dt = t.inv_dt, this.positionIterations = t.positionIterations, this.velocityIterations = t.velocityIterations, this.warmStarting = t.warmStarting
        },
        __class__: p.dynamics.B2TimeStep
    }, p.dynamics.B2World = function(t, e) {
        this.s_stack = new Array, this.m_contactManager = new p.dynamics.B2ContactManager, this.m_contactSolver = new p.dynamics.contacts.B2ContactSolver, this.m_island = new p.dynamics.B2Island, this.m_destructionListener = null, this.m_debugDraw = null, this.m_bodyList = null, this.m_contactList = null, this.m_jointList = null, this.m_controllerList = null, this.m_bodyCount = 0, this.m_contactCount = 0, this.m_jointCount = 0, this.m_controllerCount = 0, p.dynamics.B2World.m_warmStarting = !0, p.dynamics.B2World.m_continuousPhysics = !1, this.m_allowSleep = e, this.m_gravity = t, this.m_inv_dt0 = 0, this.m_flags = 0, this.m_contactManager.m_world = this;
        var s = new p.dynamics.B2BodyDef;
        this.m_groundBody = this.createBody(s)
    }, i["box2D.dynamics.B2World"] = p.dynamics.B2World, p.dynamics.B2World.__name__ = !0, p.dynamics.B2World.prototype = {
        setContactListener: function(t) {
            this.m_contactManager.m_contactListener = t
        },
        createBody: function(t) {
            if (1 == this.isLocked()) return null;
            var e = new p.dynamics.B2Body(t, this);
            return e.m_prev = null, e.m_next = this.m_bodyList, null != this.m_bodyList && (this.m_bodyList.m_prev = e), this.m_bodyList = e, ++this.m_bodyCount, e
        },
        destroyBody: function(t) {
            if (1 != this.isLocked()) {
                for (var e = t.m_jointList; null != e;) {
                    var s = e;
                    e = e.next, null != this.m_destructionListener && this.m_destructionListener.sayGoodbyeJoint(s.joint), this.destroyJoint(s.joint)
                }
                for (var i = t.m_controllerList; null != i;) {
                    var n = i;
                    i = i.nextController, n.controller.removeBody(t)
                }
                for (var o = t.m_contactList; null != o;) {
                    var r = o;
                    o = o.next, this.m_contactManager.destroy(r.contact)
                }
                t.m_contactList = null;
                for (var a = t.m_fixtureList; null != a;) {
                    var l = a;
                    a = a.m_next, null != this.m_destructionListener && this.m_destructionListener.sayGoodbyeFixture(l), l.destroyProxy(this.m_contactManager.m_broadPhase), l.destroy()
                }
                t.m_fixtureList = null, t.m_fixtureCount = 0, null != t.m_prev && (t.m_prev.m_next = t.m_next), null != t.m_next && (t.m_next.m_prev = t.m_prev), t == this.m_bodyList && (this.m_bodyList = t.m_next), --this.m_bodyCount
            }
        },
        createJoint: function(t) {
            var e = p.dynamics.joints.B2Joint.create(t, null);
            e.m_prev = null, e.m_next = this.m_jointList, null != this.m_jointList && (this.m_jointList.m_prev = e), this.m_jointList = e, ++this.m_jointCount, e.m_edgeA.joint = e, e.m_edgeA.other = e.m_bodyB, e.m_edgeA.prev = null, e.m_edgeA.next = e.m_bodyA.m_jointList, null != e.m_bodyA.m_jointList && (e.m_bodyA.m_jointList.prev = e.m_edgeA), e.m_bodyA.m_jointList = e.m_edgeA, e.m_edgeB.joint = e, e.m_edgeB.other = e.m_bodyA, e.m_edgeB.prev = null, e.m_edgeB.next = e.m_bodyB.m_jointList, null != e.m_bodyB.m_jointList && (e.m_bodyB.m_jointList.prev = e.m_edgeB), e.m_bodyB.m_jointList = e.m_edgeB;
            var s = t.bodyA,
                i = t.bodyB;
            if (0 == t.collideConnected)
                for (var n = i.getContactList(); null != n;) n.other == s && n.contact.flagForFiltering(), n = n.next;
            return e
        },
        destroyJoint: function(t) {
            var e = t.m_collideConnected;
            null != t.m_prev && (t.m_prev.m_next = t.m_next), null != t.m_next && (t.m_next.m_prev = t.m_prev), t == this.m_jointList && (this.m_jointList = t.m_next);
            var s = t.m_bodyA,
                i = t.m_bodyB;
            if (s.setAwake(!0), i.setAwake(!0), null != t.m_edgeA.prev && (t.m_edgeA.prev.next = t.m_edgeA.next), null != t.m_edgeA.next && (t.m_edgeA.next.prev = t.m_edgeA.prev), t.m_edgeA == s.m_jointList && (s.m_jointList = t.m_edgeA.next), t.m_edgeA.prev = null, t.m_edgeA.next = null, null != t.m_edgeB.prev && (t.m_edgeB.prev.next = t.m_edgeB.next), null != t.m_edgeB.next && (t.m_edgeB.next.prev = t.m_edgeB.prev), t.m_edgeB == i.m_jointList && (i.m_jointList = t.m_edgeB.next), t.m_edgeB.prev = null, t.m_edgeB.next = null, p.dynamics.joints.B2Joint.destroy(t, null), --this.m_jointCount, 0 == e)
                for (var n = i.getContactList(); null != n;) n.other == s && n.contact.flagForFiltering(), n = n.next
        },
        setGravity: function(t) {
            this.m_gravity = t
        },
        step: function(t, e, s) {
            0 != (this.m_flags & p.dynamics.B2World.e_newFixture) && (this.m_contactManager.findNewContacts(), this.m_flags &= ~p.dynamics.B2World.e_newFixture), this.m_flags |= p.dynamics.B2World.e_locked;
            var i = p.dynamics.B2World.s_timestep2;
            i.dt = t, i.velocityIterations = e, i.positionIterations = s, i.inv_dt = t > 0 ? 1 / t : 0, i.dtRatio = this.m_inv_dt0 * t, i.warmStarting = p.dynamics.B2World.m_warmStarting, this.m_contactManager.collide(), i.dt > 0 && this.solve(i), p.dynamics.B2World.m_continuousPhysics && i.dt > 0 && this.solveTOI(i), i.dt > 0 && (this.m_inv_dt0 = i.inv_dt), this.m_flags &= ~p.dynamics.B2World.e_locked
        },
        isLocked: function() {
            return (this.m_flags & p.dynamics.B2World.e_locked) > 0
        },
        solve: function(t) {
            for (var e, s = this.m_controllerList; null != s;) s.step(t), s = s.m_next;
            var i = this.m_island;
            for (i.initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver), e = this.m_bodyList; null != e;) e.m_flags &= ~p.dynamics.B2Body.e_islandFlag, e = e.m_next;
            for (var n = this.m_contactList; null != n;) n.m_flags &= ~p.dynamics.contacts.B2Contact.e_islandFlag, n = n.m_next;
            for (var o = this.m_jointList; null != o;) o.m_islandFlag = !1, o = o.m_next;
            for (var r = (this.m_bodyCount, this.s_stack), a = this.m_bodyList; null != a;)
                if (0 == (a.m_flags & p.dynamics.B2Body.e_islandFlag))
                    if (0 != a.isAwake() && 0 != a.isActive())
                        if (0 != a.getType()) {
                            i.clear();
                            var l = 0;
                            for (r[l++] = a, a.m_flags |= p.dynamics.B2Body.e_islandFlag; l > 0;)
                                if (e = r[--l], i.addBody(e), 0 == e.isAwake() && e.setAwake(!0), 0 != e.getType()) {
                                    for (var h, c = e.m_contactList; null != c;) 0 == (c.contact.m_flags & p.dynamics.contacts.B2Contact.e_islandFlag) && 1 != c.contact.isSensor() && 0 != c.contact.isEnabled() && 0 != c.contact.isTouching() ? (i.addContact(c.contact), c.contact.m_flags |= p.dynamics.contacts.B2Contact.e_islandFlag, h = c.other, 0 == (h.m_flags & p.dynamics.B2Body.e_islandFlag) ? (r[l++] = h, h.m_flags |= p.dynamics.B2Body.e_islandFlag, c = c.next) : c = c.next) : c = c.next;
                                    for (var _ = e.m_jointList; null != _;) 1 != _.joint.m_islandFlag ? (h = _.other, 0 != h.isActive() ? (i.addJoint(_.joint), _.joint.m_islandFlag = !0, 0 == (h.m_flags & p.dynamics.B2Body.e_islandFlag) ? (r[l++] = h, h.m_flags |= p.dynamics.B2Body.e_islandFlag, _ = _.next) : _ = _.next) : _ = _.next) : _ = _.next
                                }
                            i.solve(t, this.m_gravity, this.m_allowSleep);
                            for (var m = 0, u = i.m_bodyCount; u > m;) {
                                var d = m++;
                                e = i.m_bodies[d], 0 == e.getType() && (e.m_flags &= ~p.dynamics.B2Body.e_islandFlag)
                            }
                            a = a.m_next
                        } else a = a.m_next;
            else a = a.m_next;
            else a = a.m_next;
            for (var y = 0, f = r.length; f > y;) {
                var g = y++;
                if (null == r[g]) break;
                r[g] = null
            }
            for (e = this.m_bodyList; null != e;) 0 != e.isAwake() && 0 != e.isActive() && 0 != e.getType() ? (e.synchronizeFixtures(), e = e.m_next) : e = e.m_next;
            this.m_contactManager.findNewContacts()
        },
        solveTOI: function(t) {
            var e, s, i, n, o, r, a, l = this.m_island;
            l.initialize(this.m_bodyCount, p.common.B2Settings.b2_maxTOIContactsPerIsland, p.common.B2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
            var h = p.dynamics.B2World.s_queue;
            for (e = this.m_bodyList; null != e;) e.m_flags &= ~p.dynamics.B2Body.e_islandFlag, e.m_sweep.t0 = 0, e = e.m_next;
            for (var c = this.m_contactList; null != c;) c.m_flags &= ~(p.dynamics.contacts.B2Contact.e_toiFlag | p.dynamics.contacts.B2Contact.e_islandFlag), c = c.m_next;
            for (a = this.m_jointList; null != a;) a.m_islandFlag = !1, a = a.m_next;
            for (;;) {
                var _ = null,
                    m = 1;
                for (c = this.m_contactList; null != c;)
                    if (1 != c.isSensor() && 0 != c.isEnabled() && 0 != c.isContinuous()) {
                        var u = 1;
                        if (0 != (c.m_flags & p.dynamics.contacts.B2Contact.e_toiFlag)) u = c.m_toi;
                        else {
                            if (s = c.m_fixtureA, i = c.m_fixtureB, n = s.m_body, o = i.m_body, !(2 == n.getType() && 0 != n.isAwake() || 2 == o.getType() && 0 != o.isAwake())) {
                                c = c.m_next;
                                continue
                            }
                            var d = n.m_sweep.t0;
                            n.m_sweep.t0 < o.m_sweep.t0 ? (d = o.m_sweep.t0, n.m_sweep.advance(d)) : o.m_sweep.t0 < n.m_sweep.t0 && (d = n.m_sweep.t0, o.m_sweep.advance(d)), u = c.computeTOI(n.m_sweep, o.m_sweep), p.common.B2Settings.b2Assert(u >= 0 && 1 >= u), u > 0 && 1 > u && (u = (1 - u) * d + u, u > 1 && (u = 1)), c.m_toi = u, c.m_flags |= p.dynamics.contacts.B2Contact.e_toiFlag
                        }
                        Number.MIN_VALUE < u && m > u && (_ = c, m = u), c = c.m_next
                    } else c = c.m_next;
                if (null == _ || 1 - 100 * Number.MIN_VALUE < m) break;
                if (s = _.m_fixtureA, i = _.m_fixtureB, n = s.m_body, o = i.m_body, p.dynamics.B2World.s_backupA.set(n.m_sweep), p.dynamics.B2World.s_backupB.set(o.m_sweep), n.advance(m), o.advance(m), _.update(this.m_contactManager.m_contactListener), _.m_flags &= ~p.dynamics.contacts.B2Contact.e_toiFlag, 1 != _.isSensor() && 0 != _.isEnabled()) {
                    if (0 != _.isTouching()) {
                        var y = n;
                        2 != y.getType() && (y = o), l.clear();
                        var f = 0,
                            g = 0;
                        for (h[f + g++] = y, y.m_flags |= p.dynamics.B2Body.e_islandFlag; g > 0;)
                            if (e = h[f++], --g, l.addBody(e), 0 == e.isAwake() && e.setAwake(!0), 2 == e.getType()) {
                                r = e.m_contactList;
                                for (var v; null != r;) {
                                    if (l.m_contactCount == l.m_contactCapacity) {
                                        r = r.next;
                                        break
                                    }
                                    0 == (r.contact.m_flags & p.dynamics.contacts.B2Contact.e_islandFlag) && 1 != r.contact.isSensor() && 0 != r.contact.isEnabled() && 0 != r.contact.isTouching() ? (l.addContact(r.contact), r.contact.m_flags |= p.dynamics.contacts.B2Contact.e_islandFlag, v = r.other, 0 == (v.m_flags & p.dynamics.B2Body.e_islandFlag) ? (0 != v.getType() && (v.advance(m), v.setAwake(!0)), h[f + g] = v, ++g, v.m_flags |= p.dynamics.B2Body.e_islandFlag, r = r.next) : r = r.next) : r = r.next
                                }
                                for (var x = e.m_jointList; null != x;) l.m_jointCount != l.m_jointCapacity && 1 != x.joint.m_islandFlag ? (v = x.other, 0 != v.isActive() ? (l.addJoint(x.joint), x.joint.m_islandFlag = !0, 0 == (v.m_flags & p.dynamics.B2Body.e_islandFlag) ? (0 != v.getType() && (v.advance(m), v.setAwake(!0)), h[f + g] = v, ++g, v.m_flags |= p.dynamics.B2Body.e_islandFlag, x = x.next) : x = x.next) : x = x.next) : x = x.next
                            }
                        var w = p.dynamics.B2World.s_timestep;
                        w.warmStarting = !1, w.dt = (1 - m) * t.dt, w.inv_dt = 1 / w.dt, w.dtRatio = 0, w.velocityIterations = t.velocityIterations, w.positionIterations = t.positionIterations, l.solveTOI(w);
                        for (var b = 0, B = l.m_bodyCount; B > b;) {
                            var S = b++;
                            if (e = l.m_bodies[S], e.m_flags &= ~p.dynamics.B2Body.e_islandFlag, 0 != e.isAwake() && 2 == e.getType())
                                for (e.synchronizeFixtures(), r = e.m_contactList; null != r;) r.contact.m_flags &= ~p.dynamics.contacts.B2Contact.e_toiFlag, r = r.next
                        }
                        for (var A = 0, C = l.m_contactCount; C > A;) {
                            var I = A++;
                            c = l.m_contacts[I], c.m_flags &= ~(p.dynamics.contacts.B2Contact.e_toiFlag | p.dynamics.contacts.B2Contact.e_islandFlag)
                        }
                        for (var k = 0, M = l.m_jointCount; M > k;) {
                            var V = k++;
                            a = l.m_joints[V], a.m_islandFlag = !1
                        }
                        this.m_contactManager.findNewContacts()
                    }
                } else n.m_sweep.set(p.dynamics.B2World.s_backupA), o.m_sweep.set(p.dynamics.B2World.s_backupB), n.synchronizeTransform(), o.synchronizeTransform()
            }
        },
        __class__: p.dynamics.B2World
    }, p.dynamics.contacts = {}, p.dynamics.contacts.B2Contact = function() {
        this.m_toi = 0, this.m_flags = 0, this.m_nodeA = new p.dynamics.contacts.B2ContactEdge, this.m_nodeB = new p.dynamics.contacts.B2ContactEdge, this.m_manifold = new p.collision.B2Manifold, this.m_oldManifold = new p.collision.B2Manifold
    }, i["box2D.dynamics.contacts.B2Contact"] = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2Contact.__name__ = !0, p.dynamics.contacts.B2Contact.prototype = {
        getManifold: function() {
            return this.m_manifold
        },
        getWorldManifold: function(t) {
            var e = this.m_fixtureA.getBody(),
                s = this.m_fixtureB.getBody(),
                i = this.m_fixtureA.getShape(),
                n = this.m_fixtureB.getShape();
            t.initialize(this.m_manifold, e.getTransform(), i.m_radius, s.getTransform(), n.m_radius)
        },
        isTouching: function() {
            return (this.m_flags & p.dynamics.contacts.B2Contact.e_touchingFlag) == p.dynamics.contacts.B2Contact.e_touchingFlag
        },
        isContinuous: function() {
            return (this.m_flags & p.dynamics.contacts.B2Contact.e_continuousFlag) == p.dynamics.contacts.B2Contact.e_continuousFlag
        },
        isSensor: function() {
            return (this.m_flags & p.dynamics.contacts.B2Contact.e_sensorFlag) == p.dynamics.contacts.B2Contact.e_sensorFlag
        },
        isEnabled: function() {
            return (this.m_flags & p.dynamics.contacts.B2Contact.e_enabledFlag) == p.dynamics.contacts.B2Contact.e_enabledFlag
        },
        getNext: function() {
            return this.m_next
        },
        getFixtureA: function() {
            return this.m_fixtureA
        },
        getFixtureB: function() {
            return this.m_fixtureB
        },
        flagForFiltering: function() {
            this.m_flags |= p.dynamics.contacts.B2Contact.e_filterFlag
        },
        reset: function(t, e) {
            if (this.m_flags = p.dynamics.contacts.B2Contact.e_enabledFlag, null == t || null == e) return this.m_fixtureA = null, void(this.m_fixtureB = null);
            (t.isSensor() || e.isSensor()) && (this.m_flags |= p.dynamics.contacts.B2Contact.e_sensorFlag);
            var s = t.getBody(),
                i = e.getBody();
            (2 != s.getType() || s.isBullet() || 2 != i.getType() || i.isBullet()) && (this.m_flags |= p.dynamics.contacts.B2Contact.e_continuousFlag), this.m_fixtureA = t, this.m_fixtureB = e, this.m_manifold.m_pointCount = 0, this.m_prev = null, this.m_next = null, this.m_nodeA.contact = null, this.m_nodeA.prev = null, this.m_nodeA.next = null, this.m_nodeA.other = null, this.m_nodeB.contact = null, this.m_nodeB.prev = null, this.m_nodeB.next = null, this.m_nodeB.other = null
        },
        update: function(t) {
            var e = this.m_oldManifold;
            this.m_oldManifold = this.m_manifold, this.m_manifold = e, this.m_flags |= p.dynamics.contacts.B2Contact.e_enabledFlag;
            var s = !1,
                i = (this.m_flags & p.dynamics.contacts.B2Contact.e_touchingFlag) == p.dynamics.contacts.B2Contact.e_touchingFlag,
                n = this.m_fixtureA.m_body,
                o = this.m_fixtureB.m_body,
                r = this.m_fixtureA.m_aabb.testOverlap(this.m_fixtureB.m_aabb);
            if (0 != (this.m_flags & p.dynamics.contacts.B2Contact.e_sensorFlag)) {
                if (r) {
                    var a = this.m_fixtureA.getShape(),
                        l = this.m_fixtureB.getShape(),
                        h = n.getTransform(),
                        c = o.getTransform();
                    s = p.collision.shapes.B2Shape.testOverlap(a, h, l, c)
                }
                this.m_manifold.m_pointCount = 0
            } else {
                if (n.getType() != p.dynamics.B2Body.b2_dynamicBody || n.isBullet() || o.getType() != p.dynamics.B2Body.b2_dynamicBody || o.isBullet() ? this.m_flags |= p.dynamics.contacts.B2Contact.e_continuousFlag : this.m_flags &= ~p.dynamics.contacts.B2Contact.e_continuousFlag, r) {
                    this.evaluate(), s = this.m_manifold.m_pointCount > 0;
                    for (var _ = 0, m = this.m_manifold.m_pointCount; m > _;) {
                        var u = _++,
                            d = this.m_manifold.m_points[u];
                        d.m_normalImpulse = 0, d.m_tangentImpulse = 0;
                        for (var y = d.m_id, f = 0, g = this.m_oldManifold.m_pointCount; g > f;) {
                            var v = f++,
                                x = this.m_oldManifold.m_points[v];
                            if (x.m_id.get_key() == y.get_key()) {
                                d.m_normalImpulse = x.m_normalImpulse, d.m_tangentImpulse = x.m_tangentImpulse;
                                break
                            }
                        }
                    }
                } else this.m_manifold.m_pointCount = 0;
                s != i && (n.setAwake(!0), o.setAwake(!0))
            }
            s ? this.m_flags |= p.dynamics.contacts.B2Contact.e_touchingFlag : this.m_flags &= ~p.dynamics.contacts.B2Contact.e_touchingFlag, 0 == i && 1 == s && t.beginContact(this), 1 == i && 0 == s && t.endContact(this), 0 == (this.m_flags & p.dynamics.contacts.B2Contact.e_sensorFlag) && t.preSolve(this, this.m_oldManifold)
        },
        evaluate: function() {},
        computeTOI: function(t, e) {
            return p.dynamics.contacts.B2Contact.s_input.proxyA.set(this.m_fixtureA.getShape()), p.dynamics.contacts.B2Contact.s_input.proxyB.set(this.m_fixtureB.getShape()), p.dynamics.contacts.B2Contact.s_input.sweepA = t, p.dynamics.contacts.B2Contact.s_input.sweepB = e, p.dynamics.contacts.B2Contact.s_input.tolerance = p.common.B2Settings.b2_linearSlop, p.collision.B2TimeOfImpact.timeOfImpact(p.dynamics.contacts.B2Contact.s_input)
        },
        __class__: p.dynamics.contacts.B2Contact
    }, p.dynamics.contacts.B2CircleContact = function() {
        p.dynamics.contacts.B2Contact.call(this)
    }, i["box2D.dynamics.contacts.B2CircleContact"] = p.dynamics.contacts.B2CircleContact, p.dynamics.contacts.B2CircleContact.__name__ = !0, p.dynamics.contacts.B2CircleContact.create = function() {
        return new p.dynamics.contacts.B2CircleContact
    }, p.dynamics.contacts.B2CircleContact.destroy = function() {}, p.dynamics.contacts.B2CircleContact.__super__ = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2CircleContact.prototype = t(p.dynamics.contacts.B2Contact.prototype, {
        reset: function(t, e) {
            p.dynamics.contacts.B2Contact.prototype.reset.call(this, t, e)
        },
        evaluate: function() {
            var t = this.m_fixtureA.getBody(),
                e = this.m_fixtureB.getBody();
            p.collision.B2Collision.collideCircles(this.m_manifold, A.Boot.__cast(this.m_fixtureA.getShape(), p.collision.shapes.B2CircleShape), t.m_xf, A.Boot.__cast(this.m_fixtureB.getShape(), p.collision.shapes.B2CircleShape), e.m_xf)
        },
        __class__: p.dynamics.contacts.B2CircleContact
    }), p.dynamics.contacts.B2ContactConstraint = function() {
        this.pointCount = 0, this.restitution = 0, this.friction = 0, this.radius = 0, this.localPlaneNormal = new p.common.math.B2Vec2, this.localPoint = new p.common.math.B2Vec2, this.normal = new p.common.math.B2Vec2, this.normalMass = new p.common.math.B2Mat22, this.K = new p.common.math.B2Mat22, this.points = new Array;
        for (var t = 0, e = p.common.B2Settings.b2_maxManifoldPoints; e > t;) {
            var s = t++;
            this.points[s] = new p.dynamics.contacts.B2ContactConstraintPoint
        }
    }, i["box2D.dynamics.contacts.B2ContactConstraint"] = p.dynamics.contacts.B2ContactConstraint, p.dynamics.contacts.B2ContactConstraint.__name__ = !0, p.dynamics.contacts.B2ContactConstraint.prototype = {
        __class__: p.dynamics.contacts.B2ContactConstraint
    }, p.dynamics.contacts.B2ContactConstraintPoint = function() {
        this.localPoint = new p.common.math.B2Vec2, this.rA = new p.common.math.B2Vec2, this.rB = new p.common.math.B2Vec2
    }, i["box2D.dynamics.contacts.B2ContactConstraintPoint"] = p.dynamics.contacts.B2ContactConstraintPoint, p.dynamics.contacts.B2ContactConstraintPoint.__name__ = !0, p.dynamics.contacts.B2ContactConstraintPoint.prototype = {
        __class__: p.dynamics.contacts.B2ContactConstraintPoint
    }, p.dynamics.contacts.B2ContactEdge = function() {}, i["box2D.dynamics.contacts.B2ContactEdge"] = p.dynamics.contacts.B2ContactEdge, p.dynamics.contacts.B2ContactEdge.__name__ = !0, p.dynamics.contacts.B2ContactEdge.prototype = {
        __class__: p.dynamics.contacts.B2ContactEdge
    }, p.dynamics.contacts.B2ContactFactory = function(t) {
        this.m_allocator = t, this.initializeRegisters()
    }, i["box2D.dynamics.contacts.B2ContactFactory"] = p.dynamics.contacts.B2ContactFactory, p.dynamics.contacts.B2ContactFactory.__name__ = !0, p.dynamics.contacts.B2ContactFactory.prototype = {
        addType: function(t, e, s, i) {
            this.m_registers[s][i].createFcn = t, this.m_registers[s][i].destroyFcn = e, this.m_registers[s][i].primary = !0, s != i && (this.m_registers[i][s].createFcn = t, this.m_registers[i][s].destroyFcn = e, this.m_registers[i][s].primary = !1)
        },
        initializeRegisters: function() {
            this.m_registers = new Array;
            for (var t = 0; 4 > t;) {
                var e = t++;
                this.m_registers[e] = new Array;
                for (var s = 0; 4 > s;) {
                    var i = s++;
                    this.m_registers[e][i] = new p.dynamics.contacts.B2ContactRegister
                }
            }
            this.addType(p.dynamics.contacts.B2CircleContact.create, p.dynamics.contacts.B2CircleContact.destroy, 1, 1), this.addType(p.dynamics.contacts.B2PolyAndCircleContact.create, p.dynamics.contacts.B2PolyAndCircleContact.destroy, 2, 1), this.addType(p.dynamics.contacts.B2PolygonContact.create, p.dynamics.contacts.B2PolygonContact.destroy, 2, 2), this.addType(p.dynamics.contacts.B2EdgeAndCircleContact.create, p.dynamics.contacts.B2EdgeAndCircleContact.destroy, 3, 1), this.addType(p.dynamics.contacts.B2PolyAndEdgeContact.create, p.dynamics.contacts.B2PolyAndEdgeContact.destroy, 2, 3)
        },
        create: function(t, e) {
            var s, i = t.getType(),
                n = e.getType(),
                o = this.m_registers[i][n];
            if (null != o.pool) return s = o.pool, o.pool = s.m_next, o.poolCount--, s.reset(t, e), s;
            var r = o.createFcn;
            return null != r ? o.primary ? (s = r(this.m_allocator), s.reset(t, e), s) : (s = r(this.m_allocator), s.reset(e, t), s) : null
        },
        destroy: function(t) {
            t.m_manifold.m_pointCount > 0 && (t.m_fixtureA.m_body.setAwake(!0), t.m_fixtureB.m_body.setAwake(!0));
            var e = t.m_fixtureA.getType(),
                s = t.m_fixtureB.getType(),
                i = this.m_registers[e][s];
            i.poolCount++, t.m_next = i.pool, i.pool = t;
            var n = i.destroyFcn;
            n(t, this.m_allocator)
        },
        __class__: p.dynamics.contacts.B2ContactFactory
    }, p.dynamics.contacts.B2ContactRegister = function() {
        this.poolCount = 0
    }, i["box2D.dynamics.contacts.B2ContactRegister"] = p.dynamics.contacts.B2ContactRegister, p.dynamics.contacts.B2ContactRegister.__name__ = !0, p.dynamics.contacts.B2ContactRegister.prototype = {
        __class__: p.dynamics.contacts.B2ContactRegister
    }, p.dynamics.contacts.B2PositionSolverManifold = function() {
        this.m_normal = new p.common.math.B2Vec2, this.m_separations = new Array, this.m_points = new Array;
        for (var t = 0, e = p.common.B2Settings.b2_maxManifoldPoints; e > t;) {
            var s = t++;
            this.m_points[s] = new p.common.math.B2Vec2
        }
    }, i["box2D.dynamics.contacts.B2PositionSolverManifold"] = p.dynamics.contacts.B2PositionSolverManifold, p.dynamics.contacts.B2PositionSolverManifold.__name__ = !0, p.dynamics.contacts.B2PositionSolverManifold.prototype = {
        initialize: function(t) {
            p.common.B2Settings.b2Assert(t.pointCount > 0);
            var e, s, i, n, o, r, a = t.type;
            switch (a[1]) {
                case 0:
                    i = t.bodyA.m_xf.R, n = t.localPoint;
                    var l = t.bodyA.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y),
                        h = t.bodyA.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y);
                    i = t.bodyB.m_xf.R, n = t.points[0].localPoint;
                    var c = t.bodyB.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y),
                        _ = t.bodyB.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y),
                        m = c - l,
                        u = _ - h,
                        d = m * m + u * u;
                    if (d > Number.MIN_VALUE * Number.MIN_VALUE) {
                        var y = Math.sqrt(d);
                        this.m_normal.x = m / y, this.m_normal.y = u / y
                    } else this.m_normal.x = 1, this.m_normal.y = 0;
                    this.m_points[0].x = .5 * (l + c), this.m_points[0].y = .5 * (h + _), this.m_separations[0] = m * this.m_normal.x + u * this.m_normal.y - t.radius;
                    break;
                case 1:
                    i = t.bodyA.m_xf.R, n = t.localPlaneNormal, this.m_normal.x = i.col1.x * n.x + i.col2.x * n.y, this.m_normal.y = i.col1.y * n.x + i.col2.y * n.y, i = t.bodyA.m_xf.R, n = t.localPoint, o = t.bodyA.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y), r = t.bodyA.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y), i = t.bodyB.m_xf.R;
                    for (var f = 0, g = t.pointCount; g > f;) {
                        var v = f++;
                        n = t.points[v].localPoint, e = t.bodyB.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y), s = t.bodyB.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y), this.m_separations[v] = (e - o) * this.m_normal.x + (s - r) * this.m_normal.y - t.radius, this.m_points[v].x = e, this.m_points[v].y = s
                    }
                    break;
                case 2:
                    i = t.bodyB.m_xf.R, n = t.localPlaneNormal, this.m_normal.x = i.col1.x * n.x + i.col2.x * n.y, this.m_normal.y = i.col1.y * n.x + i.col2.y * n.y, i = t.bodyB.m_xf.R, n = t.localPoint, o = t.bodyB.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y), r = t.bodyB.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y), i = t.bodyA.m_xf.R;
                    for (var x = 0, w = t.pointCount; w > x;) {
                        var b = x++;
                        n = t.points[b].localPoint, e = t.bodyA.m_xf.position.x + (i.col1.x * n.x + i.col2.x * n.y), s = t.bodyA.m_xf.position.y + (i.col1.y * n.x + i.col2.y * n.y), this.m_separations[b] = (e - o) * this.m_normal.x + (s - r) * this.m_normal.y - t.radius, this.m_points[b].set(e, s)
                    }
                    this.m_normal.x *= -1, this.m_normal.y *= -1
            }
        },
        __class__: p.dynamics.contacts.B2PositionSolverManifold
    }, p.dynamics.contacts.B2ContactSolver = function() {
        this.m_constraintCount = 0, this.m_step = new p.dynamics.B2TimeStep, this.m_constraints = new Array
    }, i["box2D.dynamics.contacts.B2ContactSolver"] = p.dynamics.contacts.B2ContactSolver, p.dynamics.contacts.B2ContactSolver.__name__ = !0, p.dynamics.contacts.B2ContactSolver.prototype = {
        initialize: function(t, e, s, i) {
            var n;
            this.m_step.set(t), this.m_allocator = i;
            for (this.m_constraintCount = s; this.m_constraints.length < this.m_constraintCount;) this.m_constraints[this.m_constraints.length] = new p.dynamics.contacts.B2ContactConstraint;
            for (var o = 0; s > o;) {
                var r = o++;
                n = e[r];
                var a = n.m_fixtureA,
                    l = n.m_fixtureB,
                    h = a.m_shape,
                    c = l.m_shape,
                    _ = h.m_radius,
                    m = c.m_radius,
                    u = a.m_body,
                    d = l.m_body,
                    y = n.getManifold(),
                    f = p.common.B2Settings.b2MixFriction(a.getFriction(), l.getFriction()),
                    g = p.common.B2Settings.b2MixRestitution(a.getRestitution(), l.getRestitution()),
                    v = u.m_linearVelocity.x,
                    x = u.m_linearVelocity.y,
                    w = d.m_linearVelocity.x,
                    b = d.m_linearVelocity.y,
                    B = u.m_angularVelocity,
                    S = d.m_angularVelocity;
                p.common.B2Settings.b2Assert(y.m_pointCount > 0), p.dynamics.contacts.B2ContactSolver.s_worldManifold.initialize(y, u.m_xf, _, d.m_xf, m);
                var A = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_normal.x,
                    C = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_normal.y,
                    I = this.m_constraints[r];
                I.bodyA = u, I.bodyB = d, I.manifold = y, I.normal.x = A, I.normal.y = C, I.pointCount = y.m_pointCount, I.friction = f, I.restitution = g, I.localPlaneNormal.x = y.m_localPlaneNormal.x, I.localPlaneNormal.y = y.m_localPlaneNormal.y, I.localPoint.x = y.m_localPoint.x, I.localPoint.y = y.m_localPoint.y, I.radius = _ + m, I.type = y.m_type;
                for (var k = 0, M = I.pointCount; M > k;) {
                    var V = k++,
                        z = y.m_points[V],
                        T = I.points[V];
                    T.normalImpulse = z.m_normalImpulse, T.tangentImpulse = z.m_tangentImpulse, T.localPoint.setV(z.m_localPoint);
                    var P = T.rA.x = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_points[V].x - u.m_sweep.c.x,
                        D = T.rA.y = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_points[V].y - u.m_sweep.c.y,
                        L = T.rB.x = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_points[V].x - d.m_sweep.c.x,
                        F = T.rB.y = p.dynamics.contacts.B2ContactSolver.s_worldManifold.m_points[V].y - d.m_sweep.c.y,
                        K = P * C - D * A,
                        E = L * C - F * A;
                    K *= K, E *= E;
                    var G = u.m_invMass + d.m_invMass + u.m_invI * K + d.m_invI * E;
                    T.normalMass = 1 / G;
                    var j = u.m_mass * u.m_invMass + d.m_mass * d.m_invMass;
                    j += u.m_mass * u.m_invI * K + d.m_mass * d.m_invI * E, T.equalizedMass = 1 / j;
                    var R = C,
                        O = -A,
                        J = P * O - D * R,
                        N = L * O - F * R;
                    J *= J, N *= N;
                    var W = u.m_invMass + d.m_invMass + u.m_invI * J + d.m_invI * N;
                    T.tangentMass = 1 / W, T.velocityBias = 0;
                    var Z = w + -S * F - v - -B * D,
                        q = b + S * L - x - B * P,
                        U = I.normal.x * Z + I.normal.y * q;
                    U < -p.common.B2Settings.b2_velocityThreshold && (T.velocityBias += -I.restitution * U)
                }
                if (2 == I.pointCount) {
                    var H = I.points[0],
                        Q = I.points[1],
                        X = u.m_invMass,
                        Y = u.m_invI,
                        $ = d.m_invMass,
                        te = d.m_invI,
                        ee = H.rA.x * C - H.rA.y * A,
                        se = H.rB.x * C - H.rB.y * A,
                        ie = Q.rA.x * C - Q.rA.y * A,
                        ne = Q.rB.x * C - Q.rB.y * A,
                        oe = X + $ + Y * ee * ee + te * se * se,
                        re = X + $ + Y * ie * ie + te * ne * ne,
                        ae = X + $ + Y * ee * ie + te * se * ne,
                        le = 100;
                    le * (oe * re - ae * ae) > oe * oe ? (I.K.col1.set(oe, ae), I.K.col2.set(ae, re), I.K.getInverse(I.normalMass)) : I.pointCount = 1
                }
            }
        },
        initVelocityConstraints: function(t) {
            for (var e = 0, s = this.m_constraintCount; s > e;) {
                var i, n = e++,
                    o = this.m_constraints[n],
                    r = o.bodyA,
                    a = o.bodyB,
                    l = r.m_invMass,
                    h = r.m_invI,
                    c = a.m_invMass,
                    _ = a.m_invI,
                    m = o.normal.x,
                    u = o.normal.y,
                    d = u,
                    p = -m;
                if (t.warmStarting) {
                    i = o.pointCount;
                    for (var y = 0; i > y;) {
                        var f = y++,
                            g = o.points[f];
                        g.normalImpulse *= t.dtRatio, g.tangentImpulse *= t.dtRatio;
                        var v = g.normalImpulse * m + g.tangentImpulse * d,
                            x = g.normalImpulse * u + g.tangentImpulse * p;
                        r.m_angularVelocity -= h * (g.rA.x * x - g.rA.y * v), r.m_linearVelocity.x -= l * v, r.m_linearVelocity.y -= l * x, a.m_angularVelocity += _ * (g.rB.x * x - g.rB.y * v), a.m_linearVelocity.x += c * v, a.m_linearVelocity.y += c * x
                    }
                } else {
                    i = o.pointCount;
                    for (var w = 0; i > w;) {
                        var b = w++,
                            B = o.points[b];
                        B.normalImpulse = 0, B.tangentImpulse = 0
                    }
                }
            }
        },
        solveVelocityConstraints: function() {
            for (var t, e, s, i, n, o, r, a, l, h, c, _, m, u, d, y, f, g = 0, v = this.m_constraintCount; v > g;) {
                for (var x = g++, w = this.m_constraints[x], b = w.bodyA, B = w.bodyB, S = b.m_angularVelocity, A = B.m_angularVelocity, C = b.m_linearVelocity, I = B.m_linearVelocity, k = b.m_invMass, M = b.m_invI, V = B.m_invMass, z = B.m_invI, T = w.normal.x, P = w.normal.y, D = P, L = -T, F = w.friction, K = 0, E = w.pointCount; E > K;) {
                    var G = K++;
                    t = w.points[G], e = I.x - A * t.rB.y - C.x + S * t.rA.y, s = I.y + A * t.rB.x - C.y - S * t.rA.x, n = e * D + s * L, o = t.tangentMass * -n, r = F * t.normalImpulse, a = p.common.math.B2Math.clamp(t.tangentImpulse + o, -r, r), o = a - t.tangentImpulse, l = o * D, h = o * L, C.x -= k * l, C.y -= k * h, S -= M * (t.rA.x * h - t.rA.y * l), I.x += V * l, I.y += V * h, A += z * (t.rB.x * h - t.rB.y * l), t.tangentImpulse = a
                } {
                    w.pointCount
                }
                if (1 == w.pointCount) t = w.points[0], e = I.x + -A * t.rB.y - C.x - -S * t.rA.y, s = I.y + A * t.rB.x - C.y - S * t.rA.x, i = e * T + s * P, o = -t.normalMass * (i - t.velocityBias), a = t.normalImpulse + o, a = a > 0 ? a : 0, o = a - t.normalImpulse, l = o * T, h = o * P, C.x -= k * l, C.y -= k * h, S -= M * (t.rA.x * h - t.rA.y * l), I.x += V * l, I.y += V * h, A += z * (t.rB.x * h - t.rB.y * l), t.normalImpulse = a;
                else {
                    var j = w.points[0],
                        R = w.points[1],
                        O = j.normalImpulse,
                        J = R.normalImpulse,
                        N = I.x - A * j.rB.y - C.x + S * j.rA.y,
                        W = I.y + A * j.rB.x - C.y - S * j.rA.x,
                        Z = I.x - A * R.rB.y - C.x + S * R.rA.y,
                        q = I.y + A * R.rB.x - C.y - S * R.rA.x,
                        U = N * T + W * P,
                        H = Z * T + q * P,
                        Q = U - j.velocityBias,
                        X = H - R.velocityBias;
                    f = w.K, Q -= f.col1.x * O + f.col2.x * J, X -= f.col1.y * O + f.col2.y * J;
                    for (var Y = 0; 1 > Y;) {
                        {
                            Y++
                        }
                        f = w.normalMass;
                        var $ = -(f.col1.x * Q + f.col2.x * X),
                            te = -(f.col1.y * Q + f.col2.y * X);
                        if ($ >= 0 && te >= 0) {
                            c = $ - O, _ = te - J, m = c * T, u = c * P, d = _ * T, y = _ * P, C.x -= k * (m + d), C.y -= k * (u + y), S -= M * (j.rA.x * u - j.rA.y * m + R.rA.x * y - R.rA.y * d), I.x += V * (m + d), I.y += V * (u + y), A += z * (j.rB.x * u - j.rB.y * m + R.rB.x * y - R.rB.y * d), j.normalImpulse = $, R.normalImpulse = te;
                            break
                        }
                        if ($ = -j.normalMass * Q, te = 0, U = 0, H = w.K.col1.y * $ + X, $ >= 0 && H >= 0) {
                            c = $ - O, _ = te - J, m = c * T, u = c * P, d = _ * T, y = _ * P, C.x -= k * (m + d), C.y -= k * (u + y), S -= M * (j.rA.x * u - j.rA.y * m + R.rA.x * y - R.rA.y * d), I.x += V * (m + d), I.y += V * (u + y), A += z * (j.rB.x * u - j.rB.y * m + R.rB.x * y - R.rB.y * d), j.normalImpulse = $, R.normalImpulse = te;
                            break
                        }
                        if ($ = 0, te = -R.normalMass * X, U = w.K.col2.x * te + Q, H = 0, te >= 0 && U >= 0) {
                            c = $ - O, _ = te - J, m = c * T, u = c * P, d = _ * T, y = _ * P, C.x -= k * (m + d), C.y -= k * (u + y), S -= M * (j.rA.x * u - j.rA.y * m + R.rA.x * y - R.rA.y * d), I.x += V * (m + d), I.y += V * (u + y), A += z * (j.rB.x * u - j.rB.y * m + R.rB.x * y - R.rB.y * d), j.normalImpulse = $, R.normalImpulse = te;
                            break
                        }
                        if ($ = 0, te = 0, U = Q, H = X, U >= 0 && H >= 0) {
                            c = $ - O, _ = te - J, m = c * T, u = c * P, d = _ * T, y = _ * P, C.x -= k * (m + d), C.y -= k * (u + y), S -= M * (j.rA.x * u - j.rA.y * m + R.rA.x * y - R.rA.y * d), I.x += V * (m + d), I.y += V * (u + y), A += z * (j.rB.x * u - j.rB.y * m + R.rB.x * y - R.rB.y * d), j.normalImpulse = $, R.normalImpulse = te;
                            break
                        }
                        break
                    }
                }
                b.m_angularVelocity = S, B.m_angularVelocity = A
            }
        },
        finalizeVelocityConstraints: function() {
            for (var t = 0, e = this.m_constraintCount; e > t;)
                for (var s = t++, i = this.m_constraints[s], n = i.manifold, o = 0, r = i.pointCount; r > o;) {
                    var a = o++,
                        l = n.m_points[a],
                        h = i.points[a];
                    l.m_normalImpulse = h.normalImpulse, l.m_tangentImpulse = h.tangentImpulse
                }
        },
        solvePositionConstraints: function(t) {
            for (var e = 0, s = 0, i = this.m_constraintCount; i > s;) {
                var n = s++,
                    o = this.m_constraints[n],
                    r = o.bodyA,
                    a = o.bodyB,
                    l = r.m_mass * r.m_invMass,
                    h = r.m_mass * r.m_invI,
                    c = a.m_mass * a.m_invMass,
                    _ = a.m_mass * a.m_invI;
                p.dynamics.contacts.B2ContactSolver.s_psm.initialize(o);
                for (var m = p.dynamics.contacts.B2ContactSolver.s_psm.m_normal, u = 0, d = o.pointCount; d > u;) {
                    var y = u++,
                        f = o.points[y],
                        g = p.dynamics.contacts.B2ContactSolver.s_psm.m_points[y],
                        v = p.dynamics.contacts.B2ContactSolver.s_psm.m_separations[y],
                        x = g.x - r.m_sweep.c.x,
                        w = g.y - r.m_sweep.c.y,
                        b = g.x - a.m_sweep.c.x,
                        B = g.y - a.m_sweep.c.y;
                    e = v > e ? e : v;
                    var S = p.common.math.B2Math.clamp(t * (v + p.common.B2Settings.b2_linearSlop), -p.common.B2Settings.b2_maxLinearCorrection, 0),
                        A = -f.equalizedMass * S,
                        C = A * m.x,
                        I = A * m.y;
                    r.m_sweep.c.x -= l * C, r.m_sweep.c.y -= l * I, r.m_sweep.a -= h * (x * I - w * C), r.synchronizeTransform(), a.m_sweep.c.x += c * C, a.m_sweep.c.y += c * I, a.m_sweep.a += _ * (b * I - B * C), a.synchronizeTransform()
                }
            }
            return e > -1.5 * p.common.B2Settings.b2_linearSlop
        },
        __class__: p.dynamics.contacts.B2ContactSolver
    }, p.dynamics.contacts.B2EdgeAndCircleContact = function() {
        p.dynamics.contacts.B2Contact.call(this)
    }, i["box2D.dynamics.contacts.B2EdgeAndCircleContact"] = p.dynamics.contacts.B2EdgeAndCircleContact, p.dynamics.contacts.B2EdgeAndCircleContact.__name__ = !0, p.dynamics.contacts.B2EdgeAndCircleContact.create = function() {
        return new p.dynamics.contacts.B2EdgeAndCircleContact
    }, p.dynamics.contacts.B2EdgeAndCircleContact.destroy = function() {}, p.dynamics.contacts.B2EdgeAndCircleContact.__super__ = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2EdgeAndCircleContact.prototype = t(p.dynamics.contacts.B2Contact.prototype, {
        reset: function(t, e) {
            p.dynamics.contacts.B2Contact.prototype.reset.call(this, t, e)
        },
        evaluate: function() {
            var t = this.m_fixtureA.getBody(),
                e = this.m_fixtureB.getBody();
            this.b2CollideEdgeAndCircle(this.m_manifold, A.Boot.__cast(this.m_fixtureA.getShape(), p.collision.shapes.B2EdgeShape), t.m_xf, A.Boot.__cast(this.m_fixtureB.getShape(), p.collision.shapes.B2CircleShape), e.m_xf)
        },
        b2CollideEdgeAndCircle: function() {},
        __class__: p.dynamics.contacts.B2EdgeAndCircleContact
    }), p.dynamics.contacts.B2PolyAndCircleContact = function() {
        p.dynamics.contacts.B2Contact.call(this)
    }, i["box2D.dynamics.contacts.B2PolyAndCircleContact"] = p.dynamics.contacts.B2PolyAndCircleContact, p.dynamics.contacts.B2PolyAndCircleContact.__name__ = !0, p.dynamics.contacts.B2PolyAndCircleContact.create = function() {
        return new p.dynamics.contacts.B2PolyAndCircleContact
    }, p.dynamics.contacts.B2PolyAndCircleContact.destroy = function() {}, p.dynamics.contacts.B2PolyAndCircleContact.__super__ = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2PolyAndCircleContact.prototype = t(p.dynamics.contacts.B2Contact.prototype, {
        reset: function(t, e) {
            p.dynamics.contacts.B2Contact.prototype.reset.call(this, t, e), p.common.B2Settings.b2Assert(2 == t.getType()), p.common.B2Settings.b2Assert(1 == e.getType())
        },
        evaluate: function() {
            var t = this.m_fixtureA.m_body,
                e = this.m_fixtureB.m_body;
            p.collision.B2Collision.collidePolygonAndCircle(this.m_manifold, A.Boot.__cast(this.m_fixtureA.getShape(), p.collision.shapes.B2PolygonShape), t.m_xf, A.Boot.__cast(this.m_fixtureB.getShape(), p.collision.shapes.B2CircleShape), e.m_xf)
        },
        __class__: p.dynamics.contacts.B2PolyAndCircleContact
    }), p.dynamics.contacts.B2PolyAndEdgeContact = function() {
        p.dynamics.contacts.B2Contact.call(this)
    }, i["box2D.dynamics.contacts.B2PolyAndEdgeContact"] = p.dynamics.contacts.B2PolyAndEdgeContact, p.dynamics.contacts.B2PolyAndEdgeContact.__name__ = !0, p.dynamics.contacts.B2PolyAndEdgeContact.create = function() {
        return new p.dynamics.contacts.B2PolyAndEdgeContact
    }, p.dynamics.contacts.B2PolyAndEdgeContact.destroy = function() {}, p.dynamics.contacts.B2PolyAndEdgeContact.__super__ = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2PolyAndEdgeContact.prototype = t(p.dynamics.contacts.B2Contact.prototype, {
        reset: function(t, e) {
            p.dynamics.contacts.B2Contact.prototype.reset.call(this, t, e), p.common.B2Settings.b2Assert(2 == t.getType()), p.common.B2Settings.b2Assert(3 == e.getType())
        },
        evaluate: function() {
            var t = this.m_fixtureA.getBody(),
                e = this.m_fixtureB.getBody();
            this.b2CollidePolyAndEdge(this.m_manifold, A.Boot.__cast(this.m_fixtureA.getShape(), p.collision.shapes.B2PolygonShape), t.m_xf, A.Boot.__cast(this.m_fixtureB.getShape(), p.collision.shapes.B2EdgeShape), e.m_xf)
        },
        b2CollidePolyAndEdge: function() {},
        __class__: p.dynamics.contacts.B2PolyAndEdgeContact
    }), p.dynamics.contacts.B2PolygonContact = function() {
        p.dynamics.contacts.B2Contact.call(this)
    }, i["box2D.dynamics.contacts.B2PolygonContact"] = p.dynamics.contacts.B2PolygonContact, p.dynamics.contacts.B2PolygonContact.__name__ = !0, p.dynamics.contacts.B2PolygonContact.create = function() {
        return new p.dynamics.contacts.B2PolygonContact
    }, p.dynamics.contacts.B2PolygonContact.destroy = function() {}, p.dynamics.contacts.B2PolygonContact.__super__ = p.dynamics.contacts.B2Contact, p.dynamics.contacts.B2PolygonContact.prototype = t(p.dynamics.contacts.B2Contact.prototype, {
        reset: function(t, e) {
            p.dynamics.contacts.B2Contact.prototype.reset.call(this, t, e)
        },
        evaluate: function() {
            var t = this.m_fixtureA.getBody(),
                e = this.m_fixtureB.getBody();
            p.collision.B2Collision.collidePolygons(this.m_manifold, A.Boot.__cast(this.m_fixtureA.getShape(), p.collision.shapes.B2PolygonShape), t.m_xf, A.Boot.__cast(this.m_fixtureB.getShape(), p.collision.shapes.B2PolygonShape), e.m_xf)
        },
        __class__: p.dynamics.contacts.B2PolygonContact
    }), p.dynamics.controllers = {}, p.dynamics.controllers.B2Controller = function() {
        this.m_bodyCount = 0
    }, i["box2D.dynamics.controllers.B2Controller"] = p.dynamics.controllers.B2Controller, p.dynamics.controllers.B2Controller.__name__ = !0, p.dynamics.controllers.B2Controller.prototype = {
        step: function() {},
        removeBody: function(t) {
            for (var e = t.m_controllerList; null != e && e.controller != this;) e = e.nextController;
            null != e.prevBody && (e.prevBody.nextBody = e.nextBody), null != e.nextBody && (e.nextBody.prevBody = e.prevBody), null != e.nextController && (e.nextController.prevController = e.prevController), null != e.prevController && (e.prevController.nextController = e.nextController), this.m_bodyList == e && (this.m_bodyList = e.nextBody), t.m_controllerList == e && (t.m_controllerList = e.nextController), t.m_controllerCount--, this.m_bodyCount--
        },
        __class__: p.dynamics.controllers.B2Controller
    }, p.dynamics.controllers.B2ControllerEdge = function() {}, i["box2D.dynamics.controllers.B2ControllerEdge"] = p.dynamics.controllers.B2ControllerEdge, p.dynamics.controllers.B2ControllerEdge.__name__ = !0, p.dynamics.controllers.B2ControllerEdge.prototype = {
        __class__: p.dynamics.controllers.B2ControllerEdge
    }, p.dynamics.joints = {}, p.dynamics.joints.B2Joint = function(t) {
        this.m_edgeA = new p.dynamics.joints.B2JointEdge, this.m_edgeB = new p.dynamics.joints.B2JointEdge, this.m_localCenterA = new p.common.math.B2Vec2, this.m_localCenterB = new p.common.math.B2Vec2, p.common.B2Settings.b2Assert(t.bodyA != t.bodyB), this.m_type = t.type, this.m_prev = null, this.m_next = null, this.m_bodyA = t.bodyA, this.m_bodyB = t.bodyB, this.m_collideConnected = t.collideConnected, this.m_islandFlag = !1, this.m_userData = t.userData
    }, i["box2D.dynamics.joints.B2Joint"] = p.dynamics.joints.B2Joint, p.dynamics.joints.B2Joint.__name__ = !0, p.dynamics.joints.B2Joint.create = function(t) {
        var e = null,
            s = t.type;
        switch (s) {
            case 3:
                e = new p.dynamics.joints.B2DistanceJoint(A.Boot.__cast(t, p.dynamics.joints.B2DistanceJointDef));
                break;
            case 5:
                e = new p.dynamics.joints.B2MouseJoint(A.Boot.__cast(t, p.dynamics.joints.B2MouseJointDef));
                break;
            case 2:
                e = new p.dynamics.joints.B2PrismaticJoint(A.Boot.__cast(t, p.dynamics.joints.B2PrismaticJointDef));
                break;
            case 1:
                e = new p.dynamics.joints.B2RevoluteJoint(A.Boot.__cast(t, p.dynamics.joints.B2RevoluteJointDef));
                break;
            case 4:
                e = new p.dynamics.joints.B2PulleyJoint(A.Boot.__cast(t, p.dynamics.joints.B2PulleyJointDef));
                break;
            case 6:
                e = new p.dynamics.joints.B2GearJoint(A.Boot.__cast(t, p.dynamics.joints.B2GearJointDef));
                break;
            case 7:
                e = new p.dynamics.joints.B2LineJoint(A.Boot.__cast(t, p.dynamics.joints.B2LineJointDef));
                break;
            case 8:
                e = new p.dynamics.joints.B2WeldJoint(A.Boot.__cast(t, p.dynamics.joints.B2WeldJointDef));
                break;
            case 9:
                e = new p.dynamics.joints.B2FrictionJoint(A.Boot.__cast(t, p.dynamics.joints.B2FrictionJointDef))
        }
        return e
    }, p.dynamics.joints.B2Joint.destroy = function() {}, p.dynamics.joints.B2Joint.prototype = {
        getBodyA: function() {
            return this.m_bodyA
        },
        getBodyB: function() {
            return this.m_bodyB
        },
        initVelocityConstraints: function() {},
        solveVelocityConstraints: function() {},
        finalizeVelocityConstraints: function() {},
        solvePositionConstraints: function() {
            return !1
        },
        __class__: p.dynamics.joints.B2Joint
    }, p.dynamics.joints.B2DistanceJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_localAnchor1 = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_u = new p.common.math.B2Vec2;
        this.m_localAnchor1.setV(t.localAnchorA), this.m_localAnchor2.setV(t.localAnchorB), this.m_length = t.length, this.m_frequencyHz = t.frequencyHz, this.m_dampingRatio = t.dampingRatio, this.m_impulse = 0, this.m_gamma = 0, this.m_bias = 0
    }, i["box2D.dynamics.joints.B2DistanceJoint"] = p.dynamics.joints.B2DistanceJoint, p.dynamics.joints.B2DistanceJoint.__name__ = !0, p.dynamics.joints.B2DistanceJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2DistanceJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            e = i.m_xf.R;
            var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
                r = this.m_localAnchor1.y - i.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s, e = n.m_xf.R;
            var a = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
                l = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
            s = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = s, this.m_u.x = n.m_sweep.c.x + a - i.m_sweep.c.x - o, this.m_u.y = n.m_sweep.c.y + l - i.m_sweep.c.y - r;
            var h = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
            h > p.common.B2Settings.b2_linearSlop ? this.m_u.multiply(1 / h) : this.m_u.setZero();
            var c = o * this.m_u.y - r * this.m_u.x,
                _ = a * this.m_u.y - l * this.m_u.x,
                m = i.m_invMass + i.m_invI * c * c + n.m_invMass + n.m_invI * _ * _;
            if (this.m_mass = 0 != m ? 1 / m : 0, this.m_frequencyHz > 0) {
                var u = h - this.m_length,
                    d = 2 * Math.PI * this.m_frequencyHz,
                    y = 2 * this.m_mass * this.m_dampingRatio * d,
                    f = this.m_mass * d * d;
                this.m_gamma = t.dt * (y + t.dt * f), this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0, this.m_bias = u * t.dt * f * this.m_gamma, this.m_mass = m + this.m_gamma, this.m_mass = 0 != this.m_mass ? 1 / this.m_mass : 0
            }
            if (t.warmStarting) {
                this.m_impulse *= t.dtRatio;
                var g = this.m_impulse * this.m_u.x,
                    v = this.m_impulse * this.m_u.y;
                i.m_linearVelocity.x -= i.m_invMass * g, i.m_linearVelocity.y -= i.m_invMass * v, i.m_angularVelocity -= i.m_invI * (o * v - r * g), n.m_linearVelocity.x += n.m_invMass * g, n.m_linearVelocity.y += n.m_invMass * v, n.m_angularVelocity += n.m_invI * (a * v - l * g)
            } else this.m_impulse = 0
        },
        solveVelocityConstraints: function() {
            var t, e = this.m_bodyA,
                s = this.m_bodyB;
            t = e.m_xf.R;
            var i = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
                n = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
                o = t.col1.x * i + t.col2.x * n;
            n = t.col1.y * i + t.col2.y * n, i = o, t = s.m_xf.R;
            var r = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
                a = this.m_localAnchor2.y - s.m_sweep.localCenter.y;
            o = t.col1.x * r + t.col2.x * a, a = t.col1.y * r + t.col2.y * a, r = o;
            var l = e.m_linearVelocity.x + -e.m_angularVelocity * n,
                h = e.m_linearVelocity.y + e.m_angularVelocity * i,
                c = s.m_linearVelocity.x + -s.m_angularVelocity * a,
                _ = s.m_linearVelocity.y + s.m_angularVelocity * r,
                m = this.m_u.x * (c - l) + this.m_u.y * (_ - h),
                u = -this.m_mass * (m + this.m_bias + this.m_gamma * this.m_impulse);
            this.m_impulse += u;
            var d = u * this.m_u.x,
                p = u * this.m_u.y;
            e.m_linearVelocity.x -= e.m_invMass * d, e.m_linearVelocity.y -= e.m_invMass * p, e.m_angularVelocity -= e.m_invI * (i * p - n * d), s.m_linearVelocity.x += s.m_invMass * d, s.m_linearVelocity.y += s.m_invMass * p, s.m_angularVelocity += s.m_invI * (r * p - a * d)
        },
        solvePositionConstraints: function() {
            var t;
            if (this.m_frequencyHz > 0) return !0;
            var e = this.m_bodyA,
                s = this.m_bodyB;
            t = e.m_xf.R;
            var i = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
                n = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
                o = t.col1.x * i + t.col2.x * n;
            n = t.col1.y * i + t.col2.y * n, i = o, t = s.m_xf.R;
            var r = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
                a = this.m_localAnchor2.y - s.m_sweep.localCenter.y;
            o = t.col1.x * r + t.col2.x * a, a = t.col1.y * r + t.col2.y * a, r = o;
            var l = s.m_sweep.c.x + r - e.m_sweep.c.x - i,
                h = s.m_sweep.c.y + a - e.m_sweep.c.y - n,
                c = Math.sqrt(l * l + h * h);
            l /= c, h /= c;
            var _ = c - this.m_length;
            _ = p.common.math.B2Math.clamp(_, -p.common.B2Settings.b2_maxLinearCorrection, p.common.B2Settings.b2_maxLinearCorrection);
            var m = -this.m_mass * _;
            this.m_u.set(l, h);
            var u = m * this.m_u.x,
                d = m * this.m_u.y;
            return e.m_sweep.c.x -= e.m_invMass * u, e.m_sweep.c.y -= e.m_invMass * d, e.m_sweep.a -= e.m_invI * (i * d - n * u), s.m_sweep.c.x += s.m_invMass * u, s.m_sweep.c.y += s.m_invMass * d, s.m_sweep.a += s.m_invI * (r * d - a * u), e.synchronizeTransform(), s.synchronizeTransform(), p.common.math.B2Math.abs(_) < p.common.B2Settings.b2_linearSlop
        },
        __class__: p.dynamics.joints.B2DistanceJoint
    }), p.dynamics.joints.B2JointDef = function() {
        this.type = 0, this.userData = null, this.bodyA = null, this.bodyB = null, this.collideConnected = !1
    }, i["box2D.dynamics.joints.B2JointDef"] = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2JointDef.__name__ = !0, p.dynamics.joints.B2JointDef.prototype = {
        __class__: p.dynamics.joints.B2JointDef
    }, p.dynamics.joints.B2DistanceJointDef = function() {}, i["box2D.dynamics.joints.B2DistanceJointDef"] = p.dynamics.joints.B2DistanceJointDef, p.dynamics.joints.B2DistanceJointDef.__name__ = !0, p.dynamics.joints.B2DistanceJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2DistanceJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2DistanceJointDef
    }), p.dynamics.joints.B2FrictionJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_localAnchorA = new p.common.math.B2Vec2, this.m_localAnchorB = new p.common.math.B2Vec2, this.m_linearMass = new p.common.math.B2Mat22, this.m_linearImpulse = new p.common.math.B2Vec2, this.m_localAnchorA.setV(t.localAnchorA), this.m_localAnchorB.setV(t.localAnchorB), this.m_linearMass.setZero(), this.m_angularMass = 0, this.m_linearImpulse.setZero(), this.m_angularImpulse = 0, this.m_maxForce = t.maxForce, this.m_maxTorque = t.maxTorque
    }, i["box2D.dynamics.joints.B2FrictionJoint"] = p.dynamics.joints.B2FrictionJoint, p.dynamics.joints.B2FrictionJoint.__name__ = !0, p.dynamics.joints.B2FrictionJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2FrictionJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            e = i.m_xf.R;
            var o = this.m_localAnchorA.x - i.m_sweep.localCenter.x,
                r = this.m_localAnchorA.y - i.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s, e = n.m_xf.R;
            var a = this.m_localAnchorB.x - n.m_sweep.localCenter.x,
                l = this.m_localAnchorB.y - n.m_sweep.localCenter.y;
            s = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = s;
            var h = i.m_invMass,
                c = n.m_invMass,
                _ = i.m_invI,
                m = n.m_invI,
                u = new p.common.math.B2Mat22;
            if (u.col1.x = h + c, u.col2.x = 0, u.col1.y = 0, u.col2.y = h + c, u.col1.x += _ * r * r, u.col2.x += -_ * o * r, u.col1.y += -_ * o * r, u.col2.y += _ * o * o, u.col1.x += m * l * l, u.col2.x += -m * a * l, u.col1.y += -m * a * l, u.col2.y += m * a * a, u.getInverse(this.m_linearMass), this.m_angularMass = _ + m, this.m_angularMass > 0 && (this.m_angularMass = 1 / this.m_angularMass), t.warmStarting) {
                this.m_linearImpulse.x *= t.dtRatio, this.m_linearImpulse.y *= t.dtRatio, this.m_angularImpulse *= t.dtRatio;
                var d = this.m_linearImpulse;
                i.m_linearVelocity.x -= h * d.x, i.m_linearVelocity.y -= h * d.y, i.m_angularVelocity -= _ * (o * d.y - r * d.x + this.m_angularImpulse), n.m_linearVelocity.x += c * d.x, n.m_linearVelocity.y += c * d.y, n.m_angularVelocity += m * (a * d.y - l * d.x + this.m_angularImpulse)
            } else this.m_linearImpulse.setZero(), this.m_angularImpulse = 0
        },
        solveVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB,
                o = i.m_linearVelocity,
                r = i.m_angularVelocity,
                a = n.m_linearVelocity,
                l = n.m_angularVelocity,
                h = i.m_invMass,
                c = n.m_invMass,
                _ = i.m_invI,
                m = n.m_invI;
            e = i.m_xf.R;
            var u = this.m_localAnchorA.x - i.m_sweep.localCenter.x,
                d = this.m_localAnchorA.y - i.m_sweep.localCenter.y;
            s = e.col1.x * u + e.col2.x * d, d = e.col1.y * u + e.col2.y * d, u = s, e = n.m_xf.R;
            var y = this.m_localAnchorB.x - n.m_sweep.localCenter.x,
                f = this.m_localAnchorB.y - n.m_sweep.localCenter.y;
            s = e.col1.x * y + e.col2.x * f, f = e.col1.y * y + e.col2.y * f, y = s;
            var g, v = l - r,
                x = -this.m_angularMass * v,
                w = this.m_angularImpulse;
            g = t.dt * this.m_maxTorque, this.m_angularImpulse = p.common.math.B2Math.clamp(this.m_angularImpulse + x, -g, g), x = this.m_angularImpulse - w, r -= _ * x, l += m * x;
            var b = a.x - l * f - o.x + r * d,
                B = a.y + l * y - o.y - r * u,
                S = p.common.math.B2Math.mulMV(this.m_linearMass, new p.common.math.B2Vec2(-b, -B)),
                A = this.m_linearImpulse.copy();
            this.m_linearImpulse.add(S), g = t.dt * this.m_maxForce, this.m_linearImpulse.lengthSquared() > g * g && (this.m_linearImpulse.normalize(), this.m_linearImpulse.multiply(g)), S = p.common.math.B2Math.subtractVV(this.m_linearImpulse, A), o.x -= h * S.x, o.y -= h * S.y, r -= _ * (u * S.y - d * S.x), a.x += c * S.x, a.y += c * S.y, l += m * (y * S.y - f * S.x), i.m_angularVelocity = r, n.m_angularVelocity = l
        },
        solvePositionConstraints: function() {
            return !0
        },
        __class__: p.dynamics.joints.B2FrictionJoint
    }), p.dynamics.joints.B2FrictionJointDef = function() {}, i["box2D.dynamics.joints.B2FrictionJointDef"] = p.dynamics.joints.B2FrictionJointDef, p.dynamics.joints.B2FrictionJointDef.__name__ = !0, p.dynamics.joints.B2FrictionJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2FrictionJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2FrictionJointDef
    }), p.dynamics.joints.B2GearJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_groundAnchor1 = new p.common.math.B2Vec2, this.m_groundAnchor2 = new p.common.math.B2Vec2, this.m_localAnchor1 = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_J = new p.dynamics.joints.B2Jacobian;
        var e = t.joint1.m_type,
            s = t.joint2.m_type;
        this.m_revolute1 = null, this.m_prismatic1 = null, this.m_revolute2 = null, this.m_prismatic2 = null;
        var i, n;
        this.m_ground1 = t.joint1.getBodyA(), this.m_bodyA = t.joint1.getBodyB(), 1 == e ? (this.m_revolute1 = A.Boot.__cast(t.joint1, p.dynamics.joints.B2RevoluteJoint), this.m_groundAnchor1.setV(this.m_revolute1.m_localAnchor1), this.m_localAnchor1.setV(this.m_revolute1.m_localAnchor2), i = this.m_revolute1.getJointAngle()) : (this.m_prismatic1 = A.Boot.__cast(t.joint1, p.dynamics.joints.B2PrismaticJoint), this.m_groundAnchor1.setV(this.m_prismatic1.m_localAnchor1), this.m_localAnchor1.setV(this.m_prismatic1.m_localAnchor2), i = this.m_prismatic1.getJointTranslation()), this.m_ground2 = t.joint2.getBodyA(), this.m_bodyB = t.joint2.getBodyB(), 1 == s ? (this.m_revolute2 = A.Boot.__cast(t.joint2, p.dynamics.joints.B2RevoluteJoint), this.m_groundAnchor2.setV(this.m_revolute2.m_localAnchor1), this.m_localAnchor2.setV(this.m_revolute2.m_localAnchor2), n = this.m_revolute2.getJointAngle()) : (this.m_prismatic2 = A.Boot.__cast(t.joint2, p.dynamics.joints.B2PrismaticJoint), this.m_groundAnchor2.setV(this.m_prismatic2.m_localAnchor1), this.m_localAnchor2.setV(this.m_prismatic2.m_localAnchor2), n = this.m_prismatic2.getJointTranslation()), this.m_ratio = t.ratio, this.m_constant = i + this.m_ratio * n, this.m_impulse = 0
    }, i["box2D.dynamics.joints.B2GearJoint"] = p.dynamics.joints.B2GearJoint, p.dynamics.joints.B2GearJoint.__name__ = !0, p.dynamics.joints.B2GearJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2GearJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s, i, n, o, r, a, l, h = this.m_ground1,
                c = this.m_ground2,
                _ = this.m_bodyA,
                m = this.m_bodyB,
                u = 0;
            this.m_J.setZero(), null != this.m_revolute1 ? (this.m_J.angularA = -1, u += _.m_invI) : (o = h.m_xf.R, r = this.m_prismatic1.m_localXAxis1, e = o.col1.x * r.x + o.col2.x * r.y, s = o.col1.y * r.x + o.col2.y * r.y, o = _.m_xf.R, i = this.m_localAnchor1.x - _.m_sweep.localCenter.x, n = this.m_localAnchor1.y - _.m_sweep.localCenter.y, l = o.col1.x * i + o.col2.x * n, n = o.col1.y * i + o.col2.y * n, i = l, a = i * s - n * e, this.m_J.linearA.set(-e, -s), this.m_J.angularA = -a, u += _.m_invMass + _.m_invI * a * a), null != this.m_revolute2 ? (this.m_J.angularB = -this.m_ratio, u += this.m_ratio * this.m_ratio * m.m_invI) : (o = c.m_xf.R, r = this.m_prismatic2.m_localXAxis1, e = o.col1.x * r.x + o.col2.x * r.y, s = o.col1.y * r.x + o.col2.y * r.y, o = m.m_xf.R, i = this.m_localAnchor2.x - m.m_sweep.localCenter.x, n = this.m_localAnchor2.y - m.m_sweep.localCenter.y, l = o.col1.x * i + o.col2.x * n, n = o.col1.y * i + o.col2.y * n, i = l, a = i * s - n * e, this.m_J.linearB.set(-this.m_ratio * e, -this.m_ratio * s), this.m_J.angularB = -this.m_ratio * a, u += this.m_ratio * this.m_ratio * (m.m_invMass + m.m_invI * a * a)), this.m_mass = u > 0 ? 1 / u : 0, t.warmStarting ? (_.m_linearVelocity.x += _.m_invMass * this.m_impulse * this.m_J.linearA.x, _.m_linearVelocity.y += _.m_invMass * this.m_impulse * this.m_J.linearA.y, _.m_angularVelocity += _.m_invI * this.m_impulse * this.m_J.angularA, m.m_linearVelocity.x += m.m_invMass * this.m_impulse * this.m_J.linearB.x, m.m_linearVelocity.y += m.m_invMass * this.m_impulse * this.m_J.linearB.y, m.m_angularVelocity += m.m_invI * this.m_impulse * this.m_J.angularB) : this.m_impulse = 0
        },
        solveVelocityConstraints: function() {
            var t = this.m_bodyA,
                e = this.m_bodyB,
                s = this.m_J.compute(t.m_linearVelocity, t.m_angularVelocity, e.m_linearVelocity, e.m_angularVelocity),
                i = -this.m_mass * s;
            this.m_impulse += i, t.m_linearVelocity.x += t.m_invMass * i * this.m_J.linearA.x, t.m_linearVelocity.y += t.m_invMass * i * this.m_J.linearA.y, t.m_angularVelocity += t.m_invI * i * this.m_J.angularA, e.m_linearVelocity.x += e.m_invMass * i * this.m_J.linearB.x, e.m_linearVelocity.y += e.m_invMass * i * this.m_J.linearB.y, e.m_angularVelocity += e.m_invI * i * this.m_J.angularB
        },
        solvePositionConstraints: function() {
            var t, e, s = 0,
                i = this.m_bodyA,
                n = this.m_bodyB;
            t = null != this.m_revolute1 ? this.m_revolute1.getJointAngle() : this.m_prismatic1.getJointTranslation(), e = null != this.m_revolute2 ? this.m_revolute2.getJointAngle() : this.m_prismatic2.getJointTranslation();
            var o = this.m_constant - (t + this.m_ratio * e),
                r = -this.m_mass * o;
            return i.m_sweep.c.x += i.m_invMass * r * this.m_J.linearA.x, i.m_sweep.c.y += i.m_invMass * r * this.m_J.linearA.y, i.m_sweep.a += i.m_invI * r * this.m_J.angularA, n.m_sweep.c.x += n.m_invMass * r * this.m_J.linearB.x, n.m_sweep.c.y += n.m_invMass * r * this.m_J.linearB.y, n.m_sweep.a += n.m_invI * r * this.m_J.angularB, i.synchronizeTransform(), n.synchronizeTransform(), s < p.common.B2Settings.b2_linearSlop
        },
        __class__: p.dynamics.joints.B2GearJoint
    }), p.dynamics.joints.B2GearJointDef = function() {}, i["box2D.dynamics.joints.B2GearJointDef"] = p.dynamics.joints.B2GearJointDef, p.dynamics.joints.B2GearJointDef.__name__ = !0, p.dynamics.joints.B2GearJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2GearJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2GearJointDef
    }), p.dynamics.joints.B2Jacobian = function() {
        this.linearA = new p.common.math.B2Vec2, this.linearB = new p.common.math.B2Vec2
    }, i["box2D.dynamics.joints.B2Jacobian"] = p.dynamics.joints.B2Jacobian, p.dynamics.joints.B2Jacobian.__name__ = !0, p.dynamics.joints.B2Jacobian.prototype = {
        setZero: function() {
            this.linearA.setZero(), this.angularA = 0, this.linearB.setZero(), this.angularB = 0
        },
        compute: function(t, e, s, i) {
            return this.linearA.x * t.x + this.linearA.y * t.y + this.angularA * e + (this.linearB.x * s.x + this.linearB.y * s.y) + this.angularB * i
        },
        __class__: p.dynamics.joints.B2Jacobian
    }, p.dynamics.joints.B2JointEdge = function() {}, i["box2D.dynamics.joints.B2JointEdge"] = p.dynamics.joints.B2JointEdge, p.dynamics.joints.B2JointEdge.__name__ = !0, p.dynamics.joints.B2JointEdge.prototype = {
        __class__: p.dynamics.joints.B2JointEdge
    }, p.dynamics.joints.B2LineJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_localAnchor1 = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_localXAxis1 = new p.common.math.B2Vec2, this.m_localYAxis1 = new p.common.math.B2Vec2, this.m_axis = new p.common.math.B2Vec2, this.m_perp = new p.common.math.B2Vec2, this.m_K = new p.common.math.B2Mat22, this.m_impulse = new p.common.math.B2Vec2;
        this.m_localAnchor1.setV(t.localAnchorA), this.m_localAnchor2.setV(t.localAnchorB), this.m_localXAxis1.setV(t.localAxisA), this.m_localYAxis1.x = -this.m_localXAxis1.y, this.m_localYAxis1.y = this.m_localXAxis1.x, this.m_impulse.setZero(), this.m_motorMass = 0, this.m_motorImpulse = 0, this.m_lowerTranslation = t.lowerTranslation, this.m_upperTranslation = t.upperTranslation, this.m_maxMotorForce = t.maxMotorForce, this.m_motorSpeed = t.motorSpeed, this.m_enableLimit = t.enableLimit, this.m_enableMotor = t.enableMotor, this.m_limitState = 0, this.m_axis.setZero(), this.m_perp.setZero()
    }, i["box2D.dynamics.joints.B2LineJoint"] = p.dynamics.joints.B2LineJoint, p.dynamics.joints.B2LineJoint.__name__ = !0, p.dynamics.joints.B2LineJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2LineJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            this.m_localCenterA.setV(i.getLocalCenter()), this.m_localCenterB.setV(n.getLocalCenter()); {
                var o = i.getTransform();
                n.getTransform()
            }
            e = i.m_xf.R;
            var r = this.m_localAnchor1.x - this.m_localCenterA.x,
                a = this.m_localAnchor1.y - this.m_localCenterA.y;
            s = e.col1.x * r + e.col2.x * a, a = e.col1.y * r + e.col2.y * a, r = s, e = n.m_xf.R;
            var l = this.m_localAnchor2.x - this.m_localCenterB.x,
                h = this.m_localAnchor2.y - this.m_localCenterB.y;
            s = e.col1.x * l + e.col2.x * h, h = e.col1.y * l + e.col2.y * h, l = s;
            var c = n.m_sweep.c.x + l - i.m_sweep.c.x - r,
                _ = n.m_sweep.c.y + h - i.m_sweep.c.y - a;
            this.m_invMassA = i.m_invMass, this.m_invMassB = n.m_invMass, this.m_invIA = i.m_invI, this.m_invIB = n.m_invI, this.m_axis.setV(p.common.math.B2Math.mulMV(o.R, this.m_localXAxis1)), this.m_a1 = (c + r) * this.m_axis.y - (_ + a) * this.m_axis.x, this.m_a2 = l * this.m_axis.y - h * this.m_axis.x, this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2, this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0, this.m_perp.setV(p.common.math.B2Math.mulMV(o.R, this.m_localYAxis1)), this.m_s1 = (c + r) * this.m_perp.y - (_ + a) * this.m_perp.x, this.m_s2 = l * this.m_perp.y - h * this.m_perp.x;
            var m = this.m_invMassA,
                u = this.m_invMassB,
                d = this.m_invIA,
                y = this.m_invIB;
            if (this.m_K.col1.x = m + u + d * this.m_s1 * this.m_s1 + y * this.m_s2 * this.m_s2, this.m_K.col1.y = d * this.m_s1 * this.m_a1 + y * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = m + u + d * this.m_a1 * this.m_a1 + y * this.m_a2 * this.m_a2, this.m_enableLimit) {
                var f = this.m_axis.x * c + this.m_axis.y * _;
                p.common.math.B2Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * p.common.B2Settings.b2_linearSlop ? this.m_limitState = 3 : f <= this.m_lowerTranslation ? 1 != this.m_limitState && (this.m_limitState = 1, this.m_impulse.y = 0) : f >= this.m_upperTranslation ? 2 != this.m_limitState && (this.m_limitState = 2, this.m_impulse.y = 0) : (this.m_limitState = 0, this.m_impulse.y = 0)
            } else this.m_limitState = 0;
            if (0 == this.m_enableMotor && (this.m_motorImpulse = 0), t.warmStarting) {
                this.m_impulse.x *= t.dtRatio, this.m_impulse.y *= t.dtRatio, this.m_motorImpulse *= t.dtRatio;
                var g = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x,
                    v = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y,
                    x = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1,
                    w = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
                i.m_linearVelocity.x -= this.m_invMassA * g, i.m_linearVelocity.y -= this.m_invMassA * v, i.m_angularVelocity -= this.m_invIA * x, n.m_linearVelocity.x += this.m_invMassB * g, n.m_linearVelocity.y += this.m_invMassB * v, n.m_angularVelocity += this.m_invIB * w
            } else this.m_impulse.setZero(), this.m_motorImpulse = 0
        },
        solveVelocityConstraints: function(t) {
            var e, s, i, n, o = this.m_bodyA,
                r = this.m_bodyB,
                a = o.m_linearVelocity,
                l = o.m_angularVelocity,
                h = r.m_linearVelocity,
                c = r.m_angularVelocity;
            if (this.m_enableMotor && 3 != this.m_limitState) {
                var _ = this.m_axis.x * (h.x - a.x) + this.m_axis.y * (h.y - a.y) + this.m_a2 * c - this.m_a1 * l,
                    m = this.m_motorMass * (this.m_motorSpeed - _),
                    u = this.m_motorImpulse,
                    d = t.dt * this.m_maxMotorForce;
                this.m_motorImpulse = p.common.math.B2Math.clamp(this.m_motorImpulse + m, -d, d), m = this.m_motorImpulse - u, e = m * this.m_axis.x, s = m * this.m_axis.y, i = m * this.m_a1, n = m * this.m_a2, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            }
            var y = this.m_perp.x * (h.x - a.x) + this.m_perp.y * (h.y - a.y) + this.m_s2 * c - this.m_s1 * l;
            if (this.m_enableLimit && 0 != this.m_limitState) {
                var f = this.m_axis.x * (h.x - a.x) + this.m_axis.y * (h.y - a.y) + this.m_a2 * c - this.m_a1 * l,
                    g = this.m_impulse.copy(),
                    v = this.m_K.solve(new p.common.math.B2Vec2, -y, -f);
                this.m_impulse.add(v), 1 == this.m_limitState ? this.m_impulse.y = p.common.math.B2Math.max(this.m_impulse.y, 0) : 2 == this.m_limitState && (this.m_impulse.y = p.common.math.B2Math.min(this.m_impulse.y, 0));
                var x, w = -y - (this.m_impulse.y - g.y) * this.m_K.col2.x;
                x = 0 != this.m_K.col1.x ? w / this.m_K.col1.x + g.x : g.x, this.m_impulse.x = x, v.x = this.m_impulse.x - g.x, v.y = this.m_impulse.y - g.y, e = v.x * this.m_perp.x + v.y * this.m_axis.x, s = v.x * this.m_perp.y + v.y * this.m_axis.y, i = v.x * this.m_s1 + v.y * this.m_a1, n = v.x * this.m_s2 + v.y * this.m_a2, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            } else {
                var b;
                b = 0 != this.m_K.col1.x ? -y / this.m_K.col1.x : 0, this.m_impulse.x += b, e = b * this.m_perp.x, s = b * this.m_perp.y, i = b * this.m_s1, n = b * this.m_s2, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            }
            o.m_linearVelocity.setV(a), o.m_angularVelocity = l, r.m_linearVelocity.setV(h), r.m_angularVelocity = c
        },
        solvePositionConstraints: function() {
            var t, e, s, i, n, o, r = this.m_bodyA,
                a = this.m_bodyB,
                l = r.m_sweep.c,
                h = r.m_sweep.a,
                c = a.m_sweep.c,
                _ = a.m_sweep.a,
                m = 0,
                u = 0,
                d = !1,
                y = 0,
                f = p.common.math.B2Mat22.fromAngle(h),
                g = p.common.math.B2Mat22.fromAngle(_);
            t = f;
            var v = this.m_localAnchor1.x - this.m_localCenterA.x,
                x = this.m_localAnchor1.y - this.m_localCenterA.y;
            e = t.col1.x * v + t.col2.x * x, x = t.col1.y * v + t.col2.y * x, v = e, t = g;
            var w = this.m_localAnchor2.x - this.m_localCenterB.x,
                b = this.m_localAnchor2.y - this.m_localCenterB.y;
            e = t.col1.x * w + t.col2.x * b, b = t.col1.y * w + t.col2.y * b, w = e;
            var B = c.x + w - l.x - v,
                S = c.y + b - l.y - x;
            if (this.m_enableLimit) {
                this.m_axis = p.common.math.B2Math.mulMV(f, this.m_localXAxis1), this.m_a1 = (B + v) * this.m_axis.y - (S + x) * this.m_axis.x, this.m_a2 = w * this.m_axis.y - b * this.m_axis.x;
                var A = this.m_axis.x * B + this.m_axis.y * S;
                p.common.math.B2Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * p.common.B2Settings.b2_linearSlop ? (y = p.common.math.B2Math.clamp(A, -p.common.B2Settings.b2_maxLinearCorrection, p.common.B2Settings.b2_maxLinearCorrection), m = p.common.math.B2Math.abs(A), d = !0) : A <= this.m_lowerTranslation ? (y = p.common.math.B2Math.clamp(A - this.m_lowerTranslation + p.common.B2Settings.b2_linearSlop, -p.common.B2Settings.b2_maxLinearCorrection, 0), m = this.m_lowerTranslation - A, d = !0) : A >= this.m_upperTranslation && (y = p.common.math.B2Math.clamp(A - this.m_upperTranslation + p.common.B2Settings.b2_linearSlop, 0, p.common.B2Settings.b2_maxLinearCorrection), m = A - this.m_upperTranslation, d = !0)
            }
            this.m_perp = p.common.math.B2Math.mulMV(f, this.m_localYAxis1), this.m_s1 = (B + v) * this.m_perp.y - (S + x) * this.m_perp.x, this.m_s2 = w * this.m_perp.y - b * this.m_perp.x;
            var C = new p.common.math.B2Vec2,
                I = this.m_perp.x * B + this.m_perp.y * S;
            if (m = p.common.math.B2Math.max(m, p.common.math.B2Math.abs(I)), u = 0, d) s = this.m_invMassA, i = this.m_invMassB, n = this.m_invIA, o = this.m_invIB, this.m_K.col1.x = s + i + n * this.m_s1 * this.m_s1 + o * this.m_s2 * this.m_s2, this.m_K.col1.y = n * this.m_s1 * this.m_a1 + o * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = s + i + n * this.m_a1 * this.m_a1 + o * this.m_a2 * this.m_a2, this.m_K.solve(C, -I, -y);
            else {
                s = this.m_invMassA, i = this.m_invMassB, n = this.m_invIA, o = this.m_invIB;
                var k, M = s + i + n * this.m_s1 * this.m_s1 + o * this.m_s2 * this.m_s2;
                k = 0 != M ? -I / M : 0, C.x = k, C.y = 0
            }
            var V = C.x * this.m_perp.x + C.y * this.m_axis.x,
                z = C.x * this.m_perp.y + C.y * this.m_axis.y,
                T = C.x * this.m_s1 + C.y * this.m_a1,
                P = C.x * this.m_s2 + C.y * this.m_a2;
            return l.x -= this.m_invMassA * V, l.y -= this.m_invMassA * z, h -= this.m_invIA * T, c.x += this.m_invMassB * V, c.y += this.m_invMassB * z, _ += this.m_invIB * P, r.m_sweep.a = h, a.m_sweep.a = _, r.synchronizeTransform(), a.synchronizeTransform(), m <= p.common.B2Settings.b2_linearSlop && u <= p.common.B2Settings.b2_angularSlop
        },
        __class__: p.dynamics.joints.B2LineJoint
    }), p.dynamics.joints.B2LineJointDef = function() {}, i["box2D.dynamics.joints.B2LineJointDef"] = p.dynamics.joints.B2LineJointDef, p.dynamics.joints.B2LineJointDef.__name__ = !0, p.dynamics.joints.B2LineJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2LineJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2LineJointDef
    }), p.dynamics.joints.B2MouseJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.K = new p.common.math.B2Mat22, this.K1 = new p.common.math.B2Mat22, this.K2 = new p.common.math.B2Mat22, this.m_localAnchor = new p.common.math.B2Vec2, this.m_target = new p.common.math.B2Vec2, this.m_impulse = new p.common.math.B2Vec2, this.m_mass = new p.common.math.B2Mat22, this.m_C = new p.common.math.B2Vec2, this.m_target.setV(t.target);
        var e = this.m_target.x - this.m_bodyB.m_xf.position.x,
            s = this.m_target.y - this.m_bodyB.m_xf.position.y,
            i = this.m_bodyB.m_xf.R;
        this.m_localAnchor.x = e * i.col1.x + s * i.col1.y, this.m_localAnchor.y = e * i.col2.x + s * i.col2.y, this.m_maxForce = t.maxForce, this.m_impulse.setZero(), this.m_frequencyHz = t.frequencyHz, this.m_dampingRatio = t.dampingRatio, this.m_beta = 0, this.m_gamma = 0
    }, i["box2D.dynamics.joints.B2MouseJoint"] = p.dynamics.joints.B2MouseJoint, p.dynamics.joints.B2MouseJoint.__name__ = !0, p.dynamics.joints.B2MouseJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2MouseJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e = this.m_bodyB,
                s = e.getMass(),
                i = 2 * Math.PI * this.m_frequencyHz,
                n = 2 * s * this.m_dampingRatio * i,
                o = s * i * i;
            this.m_gamma = t.dt * (n + t.dt * o), this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0, this.m_beta = t.dt * o * this.m_gamma;
            var r;
            r = e.m_xf.R;
            var a = this.m_localAnchor.x - e.m_sweep.localCenter.x,
                l = this.m_localAnchor.y - e.m_sweep.localCenter.y,
                h = r.col1.x * a + r.col2.x * l;
            l = r.col1.y * a + r.col2.y * l, a = h;
            var c = e.m_invMass,
                _ = e.m_invI;
            this.K1.col1.x = c, this.K1.col2.x = 0, this.K1.col1.y = 0, this.K1.col2.y = c, this.K2.col1.x = _ * l * l, this.K2.col2.x = -_ * a * l, this.K2.col1.y = -_ * a * l, this.K2.col2.y = _ * a * a, this.K.setM(this.K1), this.K.addM(this.K2), this.K.col1.x += this.m_gamma, this.K.col2.y += this.m_gamma, this.K.getInverse(this.m_mass), this.m_C.x = e.m_sweep.c.x + a - this.m_target.x, this.m_C.y = e.m_sweep.c.y + l - this.m_target.y, e.m_angularVelocity *= .98, this.m_impulse.x *= t.dtRatio, this.m_impulse.y *= t.dtRatio, e.m_linearVelocity.x += c * this.m_impulse.x, e.m_linearVelocity.y += c * this.m_impulse.y, e.m_angularVelocity += _ * (a * this.m_impulse.y - l * this.m_impulse.x)
        },
        solveVelocityConstraints: function(t) {
            var e, s, i, n = this.m_bodyB;
            e = n.m_xf.R;
            var o = this.m_localAnchor.x - n.m_sweep.localCenter.x,
                r = this.m_localAnchor.y - n.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s;
            var a = n.m_linearVelocity.x + -n.m_angularVelocity * r,
                l = n.m_linearVelocity.y + n.m_angularVelocity * o;
            e = this.m_mass, s = a + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x, i = l + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
            var h = -(e.col1.x * s + e.col2.x * i),
                c = -(e.col1.y * s + e.col2.y * i),
                _ = this.m_impulse.x,
                m = this.m_impulse.y;
            this.m_impulse.x += h, this.m_impulse.y += c;
            var u = t.dt * this.m_maxForce;
            this.m_impulse.lengthSquared() > u * u && this.m_impulse.multiply(u / this.m_impulse.length()), h = this.m_impulse.x - _, c = this.m_impulse.y - m, n.m_linearVelocity.x += n.m_invMass * h, n.m_linearVelocity.y += n.m_invMass * c, n.m_angularVelocity += n.m_invI * (o * c - r * h)
        },
        solvePositionConstraints: function() {
            return !0
        },
        __class__: p.dynamics.joints.B2MouseJoint
    }), p.dynamics.joints.B2MouseJointDef = function() {}, i["box2D.dynamics.joints.B2MouseJointDef"] = p.dynamics.joints.B2MouseJointDef, p.dynamics.joints.B2MouseJointDef.__name__ = !0, p.dynamics.joints.B2MouseJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2MouseJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2MouseJointDef
    }), p.dynamics.joints.B2PrismaticJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_localAnchor1 = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_localXAxis1 = new p.common.math.B2Vec2, this.m_localYAxis1 = new p.common.math.B2Vec2, this.m_axis = new p.common.math.B2Vec2, this.m_perp = new p.common.math.B2Vec2, this.m_K = new p.common.math.B2Mat33, this.m_impulse = new p.common.math.B2Vec3;
        this.m_localAnchor1.setV(t.localAnchorA), this.m_localAnchor2.setV(t.localAnchorB), this.m_localXAxis1.setV(t.localAxisA), this.m_localYAxis1.x = -this.m_localXAxis1.y, this.m_localYAxis1.y = this.m_localXAxis1.x, this.m_refAngle = t.referenceAngle, this.m_impulse.setZero(), this.m_motorMass = 0, this.m_motorImpulse = 0, this.m_lowerTranslation = t.lowerTranslation, this.m_upperTranslation = t.upperTranslation, this.m_maxMotorForce = t.maxMotorForce, this.m_motorSpeed = t.motorSpeed, this.m_enableLimit = t.enableLimit, this.m_enableMotor = t.enableMotor, this.m_limitState = 0, this.m_axis.setZero(), this.m_perp.setZero()
    }, i["box2D.dynamics.joints.B2PrismaticJoint"] = p.dynamics.joints.B2PrismaticJoint, p.dynamics.joints.B2PrismaticJoint.__name__ = !0, p.dynamics.joints.B2PrismaticJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2PrismaticJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        getJointTranslation: function() {
            var t = this.m_bodyA,
                e = this.m_bodyB,
                s = t.getWorldPoint(this.m_localAnchor1),
                i = e.getWorldPoint(this.m_localAnchor2),
                n = i.x - s.x,
                o = i.y - s.y,
                r = t.getWorldVector(this.m_localXAxis1),
                a = r.x * n + r.y * o;
            return a
        },
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            this.m_localCenterA.setV(i.getLocalCenter()), this.m_localCenterB.setV(n.getLocalCenter()); {
                var o = i.getTransform();
                n.getTransform()
            }
            e = i.m_xf.R;
            var r = this.m_localAnchor1.x - this.m_localCenterA.x,
                a = this.m_localAnchor1.y - this.m_localCenterA.y;
            s = e.col1.x * r + e.col2.x * a, a = e.col1.y * r + e.col2.y * a, r = s, e = n.m_xf.R;
            var l = this.m_localAnchor2.x - this.m_localCenterB.x,
                h = this.m_localAnchor2.y - this.m_localCenterB.y;
            s = e.col1.x * l + e.col2.x * h, h = e.col1.y * l + e.col2.y * h, l = s;
            var c = n.m_sweep.c.x + l - i.m_sweep.c.x - r,
                _ = n.m_sweep.c.y + h - i.m_sweep.c.y - a;
            this.m_invMassA = i.m_invMass, this.m_invMassB = n.m_invMass, this.m_invIA = i.m_invI, this.m_invIB = n.m_invI, this.m_axis.setV(p.common.math.B2Math.mulMV(o.R, this.m_localXAxis1)), this.m_a1 = (c + r) * this.m_axis.y - (_ + a) * this.m_axis.x, this.m_a2 = l * this.m_axis.y - h * this.m_axis.x, this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2, this.m_motorMass > Number.MIN_VALUE && (this.m_motorMass = 1 / this.m_motorMass), this.m_perp.setV(p.common.math.B2Math.mulMV(o.R, this.m_localYAxis1)), this.m_s1 = (c + r) * this.m_perp.y - (_ + a) * this.m_perp.x, this.m_s2 = l * this.m_perp.y - h * this.m_perp.x;
            var m = this.m_invMassA,
                u = this.m_invMassB,
                d = this.m_invIA,
                y = this.m_invIB;
            if (this.m_K.col1.x = m + u + d * this.m_s1 * this.m_s1 + y * this.m_s2 * this.m_s2, this.m_K.col1.y = d * this.m_s1 + y * this.m_s2, this.m_K.col1.z = d * this.m_s1 * this.m_a1 + y * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = d + y, this.m_K.col2.z = d * this.m_a1 + y * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = m + u + d * this.m_a1 * this.m_a1 + y * this.m_a2 * this.m_a2, this.m_enableLimit) {
                var f = this.m_axis.x * c + this.m_axis.y * _;
                p.common.math.B2Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * p.common.B2Settings.b2_linearSlop ? this.m_limitState = 3 : f <= this.m_lowerTranslation ? 1 != this.m_limitState && (this.m_limitState = 1, this.m_impulse.z = 0) : f >= this.m_upperTranslation ? 2 != this.m_limitState && (this.m_limitState = 2, this.m_impulse.z = 0) : (this.m_limitState = 0, this.m_impulse.z = 0)
            } else this.m_limitState = 0;
            if (0 == this.m_enableMotor && (this.m_motorImpulse = 0), t.warmStarting) {
                this.m_impulse.x *= t.dtRatio, this.m_impulse.y *= t.dtRatio, this.m_motorImpulse *= t.dtRatio;
                var g = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x,
                    v = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y,
                    x = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1,
                    w = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
                i.m_linearVelocity.x -= this.m_invMassA * g, i.m_linearVelocity.y -= this.m_invMassA * v, i.m_angularVelocity -= this.m_invIA * x, n.m_linearVelocity.x += this.m_invMassB * g, n.m_linearVelocity.y += this.m_invMassB * v, n.m_angularVelocity += this.m_invIB * w
            } else this.m_impulse.setZero(), this.m_motorImpulse = 0
        },
        solveVelocityConstraints: function(t) {
            var e, s, i, n, o = this.m_bodyA,
                r = this.m_bodyB,
                a = o.m_linearVelocity,
                l = o.m_angularVelocity,
                h = r.m_linearVelocity,
                c = r.m_angularVelocity;
            if (this.m_enableMotor && 3 != this.m_limitState) {
                var _ = this.m_axis.x * (h.x - a.x) + this.m_axis.y * (h.y - a.y) + this.m_a2 * c - this.m_a1 * l,
                    m = this.m_motorMass * (this.m_motorSpeed - _),
                    u = this.m_motorImpulse,
                    d = t.dt * this.m_maxMotorForce;
                this.m_motorImpulse = p.common.math.B2Math.clamp(this.m_motorImpulse + m, -d, d), m = this.m_motorImpulse - u, e = m * this.m_axis.x, s = m * this.m_axis.y, i = m * this.m_a1, n = m * this.m_a2, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            }
            var y = this.m_perp.x * (h.x - a.x) + this.m_perp.y * (h.y - a.y) + this.m_s2 * c - this.m_s1 * l,
                f = c - l;
            if (this.m_enableLimit && 0 != this.m_limitState) {
                var g = this.m_axis.x * (h.x - a.x) + this.m_axis.y * (h.y - a.y) + this.m_a2 * c - this.m_a1 * l,
                    v = this.m_impulse.copy(),
                    x = this.m_K.solve33(new p.common.math.B2Vec3, -y, -f, -g);
                this.m_impulse.add(x), 1 == this.m_limitState ? this.m_impulse.z = p.common.math.B2Math.max(this.m_impulse.z, 0) : 2 == this.m_limitState && (this.m_impulse.z = p.common.math.B2Math.min(this.m_impulse.z, 0));
                var w = -y - (this.m_impulse.z - v.z) * this.m_K.col3.x,
                    b = -f - (this.m_impulse.z - v.z) * this.m_K.col3.y,
                    B = this.m_K.solve22(new p.common.math.B2Vec2, w, b);
                B.x += v.x, B.y += v.y, this.m_impulse.x = B.x, this.m_impulse.y = B.y, x.x = this.m_impulse.x - v.x, x.y = this.m_impulse.y - v.y, x.z = this.m_impulse.z - v.z, e = x.x * this.m_perp.x + x.z * this.m_axis.x, s = x.x * this.m_perp.y + x.z * this.m_axis.y, i = x.x * this.m_s1 + x.y + x.z * this.m_a1, n = x.x * this.m_s2 + x.y + x.z * this.m_a2, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            } else {
                var S = this.m_K.solve22(new p.common.math.B2Vec2, -y, -f);
                this.m_impulse.x += S.x, this.m_impulse.y += S.y, e = S.x * this.m_perp.x, s = S.x * this.m_perp.y, i = S.x * this.m_s1 + S.y, n = S.x * this.m_s2 + S.y, a.x -= this.m_invMassA * e, a.y -= this.m_invMassA * s, l -= this.m_invIA * i, h.x += this.m_invMassB * e, h.y += this.m_invMassB * s, c += this.m_invIB * n
            }
            o.m_linearVelocity.setV(a), o.m_angularVelocity = l, r.m_linearVelocity.setV(h), r.m_angularVelocity = c
        },
        solvePositionConstraints: function() {
            var t, e, s, i, n, o, r = this.m_bodyA,
                a = this.m_bodyB,
                l = r.m_sweep.c,
                h = r.m_sweep.a,
                c = a.m_sweep.c,
                _ = a.m_sweep.a,
                m = 0,
                u = 0,
                d = !1,
                y = 0,
                f = p.common.math.B2Mat22.fromAngle(h),
                g = p.common.math.B2Mat22.fromAngle(_);
            t = f;
            var v = this.m_localAnchor1.x - this.m_localCenterA.x,
                x = this.m_localAnchor1.y - this.m_localCenterA.y;
            e = t.col1.x * v + t.col2.x * x, x = t.col1.y * v + t.col2.y * x, v = e, t = g;
            var w = this.m_localAnchor2.x - this.m_localCenterB.x,
                b = this.m_localAnchor2.y - this.m_localCenterB.y;
            e = t.col1.x * w + t.col2.x * b, b = t.col1.y * w + t.col2.y * b, w = e;
            var B = c.x + w - l.x - v,
                S = c.y + b - l.y - x;
            if (this.m_enableLimit) {
                this.m_axis = p.common.math.B2Math.mulMV(f, this.m_localXAxis1), this.m_a1 = (B + v) * this.m_axis.y - (S + x) * this.m_axis.x, this.m_a2 = w * this.m_axis.y - b * this.m_axis.x;
                var A = this.m_axis.x * B + this.m_axis.y * S;
                p.common.math.B2Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * p.common.B2Settings.b2_linearSlop ? (y = p.common.math.B2Math.clamp(A, -p.common.B2Settings.b2_maxLinearCorrection, p.common.B2Settings.b2_maxLinearCorrection), m = p.common.math.B2Math.abs(A), d = !0) : A <= this.m_lowerTranslation ? (y = p.common.math.B2Math.clamp(A - this.m_lowerTranslation + p.common.B2Settings.b2_linearSlop, -p.common.B2Settings.b2_maxLinearCorrection, 0), m = this.m_lowerTranslation - A, d = !0) : A >= this.m_upperTranslation && (y = p.common.math.B2Math.clamp(A - this.m_upperTranslation + p.common.B2Settings.b2_linearSlop, 0, p.common.B2Settings.b2_maxLinearCorrection), m = A - this.m_upperTranslation, d = !0)
            }
            this.m_perp = p.common.math.B2Math.mulMV(f, this.m_localYAxis1), this.m_s1 = (B + v) * this.m_perp.y - (S + x) * this.m_perp.x, this.m_s2 = w * this.m_perp.y - b * this.m_perp.x;
            var C = new p.common.math.B2Vec3,
                I = this.m_perp.x * B + this.m_perp.y * S,
                k = _ - h - this.m_refAngle;
            if (m = p.common.math.B2Math.max(m, p.common.math.B2Math.abs(I)), u = p.common.math.B2Math.abs(k), d) s = this.m_invMassA, i = this.m_invMassB, n = this.m_invIA, o = this.m_invIB, this.m_K.col1.x = s + i + n * this.m_s1 * this.m_s1 + o * this.m_s2 * this.m_s2, this.m_K.col1.y = n * this.m_s1 + o * this.m_s2, this.m_K.col1.z = n * this.m_s1 * this.m_a1 + o * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = n + o, this.m_K.col2.z = n * this.m_a1 + o * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = s + i + n * this.m_a1 * this.m_a1 + o * this.m_a2 * this.m_a2, this.m_K.solve33(C, -I, -k, -y);
            else {
                s = this.m_invMassA, i = this.m_invMassB, n = this.m_invIA, o = this.m_invIB;
                var M = s + i + n * this.m_s1 * this.m_s1 + o * this.m_s2 * this.m_s2,
                    V = n * this.m_s1 + o * this.m_s2,
                    z = n + o;
                this.m_K.col1.set(M, V, 0), this.m_K.col2.set(V, z, 0);
                var T = this.m_K.solve22(new p.common.math.B2Vec2, -I, -k);
                C.x = T.x, C.y = T.y, C.z = 0
            }
            var P = C.x * this.m_perp.x + C.z * this.m_axis.x,
                D = C.x * this.m_perp.y + C.z * this.m_axis.y,
                L = C.x * this.m_s1 + C.y + C.z * this.m_a1,
                F = C.x * this.m_s2 + C.y + C.z * this.m_a2;
            return l.x -= this.m_invMassA * P, l.y -= this.m_invMassA * D, h -= this.m_invIA * L, c.x += this.m_invMassB * P, c.y += this.m_invMassB * D, _ += this.m_invIB * F, r.m_sweep.a = h, a.m_sweep.a = _, r.synchronizeTransform(), a.synchronizeTransform(), m <= p.common.B2Settings.b2_linearSlop && u <= p.common.B2Settings.b2_angularSlop
        },
        __class__: p.dynamics.joints.B2PrismaticJoint
    }), p.dynamics.joints.B2PrismaticJointDef = function() {}, i["box2D.dynamics.joints.B2PrismaticJointDef"] = p.dynamics.joints.B2PrismaticJointDef, p.dynamics.joints.B2PrismaticJointDef.__name__ = !0, p.dynamics.joints.B2PrismaticJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2PrismaticJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2PrismaticJointDef
    }), p.dynamics.joints.B2PulleyJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_groundAnchor1 = new p.common.math.B2Vec2, this.m_groundAnchor2 = new p.common.math.B2Vec2, this.m_localAnchor1 = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_u1 = new p.common.math.B2Vec2, this.m_u2 = new p.common.math.B2Vec2;
        this.m_ground = this.m_bodyA.m_world.m_groundBody, this.m_groundAnchor1.x = t.groundAnchorA.x - this.m_ground.m_xf.position.x, this.m_groundAnchor1.y = t.groundAnchorA.y - this.m_ground.m_xf.position.y, this.m_groundAnchor2.x = t.groundAnchorB.x - this.m_ground.m_xf.position.x, this.m_groundAnchor2.y = t.groundAnchorB.y - this.m_ground.m_xf.position.y, this.m_localAnchor1.setV(t.localAnchorA), this.m_localAnchor2.setV(t.localAnchorB), this.m_ratio = t.ratio, this.m_constant = t.lengthA + this.m_ratio * t.lengthB, this.m_maxLength1 = p.common.math.B2Math.min(t.maxLengthA, this.m_constant - this.m_ratio * p.dynamics.joints.B2PulleyJoint.b2_minPulleyLength), this.m_maxLength2 = p.common.math.B2Math.min(t.maxLengthB, (this.m_constant - p.dynamics.joints.B2PulleyJoint.b2_minPulleyLength) / this.m_ratio), this.m_impulse = 0, this.m_limitImpulse1 = 0, this.m_limitImpulse2 = 0
    }, i["box2D.dynamics.joints.B2PulleyJoint"] = p.dynamics.joints.B2PulleyJoint, p.dynamics.joints.B2PulleyJoint.__name__ = !0, p.dynamics.joints.B2PulleyJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2PulleyJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s = this.m_bodyA,
                i = this.m_bodyB;
            e = s.m_xf.R;
            var n = this.m_localAnchor1.x - s.m_sweep.localCenter.x,
                o = this.m_localAnchor1.y - s.m_sweep.localCenter.y,
                r = e.col1.x * n + e.col2.x * o;
            o = e.col1.y * n + e.col2.y * o, n = r, e = i.m_xf.R;
            var a = this.m_localAnchor2.x - i.m_sweep.localCenter.x,
                l = this.m_localAnchor2.y - i.m_sweep.localCenter.y;
            r = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = r;
            var h = s.m_sweep.c.x + n,
                c = s.m_sweep.c.y + o,
                _ = i.m_sweep.c.x + a,
                m = i.m_sweep.c.y + l,
                u = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x,
                d = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y,
                y = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x,
                f = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
            this.m_u1.set(h - u, c - d), this.m_u2.set(_ - y, m - f);
            var g = this.m_u1.length(),
                v = this.m_u2.length();
            g > p.common.B2Settings.b2_linearSlop ? this.m_u1.multiply(1 / g) : this.m_u1.setZero(), v > p.common.B2Settings.b2_linearSlop ? this.m_u2.multiply(1 / v) : this.m_u2.setZero();
            var x = this.m_constant - g - this.m_ratio * v;
            x > 0 ? (this.m_state = 0, this.m_impulse = 0) : this.m_state = 2, g < this.m_maxLength1 ? (this.m_limitState1 = 0, this.m_limitImpulse1 = 0) : this.m_limitState1 = 2, v < this.m_maxLength2 ? (this.m_limitState2 = 0, this.m_limitImpulse2 = 0) : this.m_limitState2 = 2;
            var w = n * this.m_u1.y - o * this.m_u1.x,
                b = a * this.m_u2.y - l * this.m_u2.x;
            if (this.m_limitMass1 = s.m_invMass + s.m_invI * w * w, this.m_limitMass2 = i.m_invMass + i.m_invI * b * b, this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2, this.m_limitMass1 = 1 / this.m_limitMass1, this.m_limitMass2 = 1 / this.m_limitMass2, this.m_pulleyMass = 1 / this.m_pulleyMass, t.warmStarting) {
                this.m_impulse *= t.dtRatio, this.m_limitImpulse1 *= t.dtRatio, this.m_limitImpulse2 *= t.dtRatio;
                var B = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x,
                    S = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y,
                    A = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x,
                    C = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
                s.m_linearVelocity.x += s.m_invMass * B, s.m_linearVelocity.y += s.m_invMass * S, s.m_angularVelocity += s.m_invI * (n * S - o * B), i.m_linearVelocity.x += i.m_invMass * A, i.m_linearVelocity.y += i.m_invMass * C, i.m_angularVelocity += i.m_invI * (a * C - l * A)
            } else this.m_impulse = 0, this.m_limitImpulse1 = 0, this.m_limitImpulse2 = 0
        },
        solveVelocityConstraints: function() {
            var t, e = this.m_bodyA,
                s = this.m_bodyB;
            t = e.m_xf.R;
            var i = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
                n = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
                o = t.col1.x * i + t.col2.x * n;
            n = t.col1.y * i + t.col2.y * n, i = o, t = s.m_xf.R;
            var r = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
                a = this.m_localAnchor2.y - s.m_sweep.localCenter.y;
            o = t.col1.x * r + t.col2.x * a, a = t.col1.y * r + t.col2.y * a, r = o;
            var l, h, c, _, m, u, d, y, f, g, v;
            2 == this.m_state && (l = e.m_linearVelocity.x + -e.m_angularVelocity * n, h = e.m_linearVelocity.y + e.m_angularVelocity * i, c = s.m_linearVelocity.x + -s.m_angularVelocity * a, _ = s.m_linearVelocity.y + s.m_angularVelocity * r, f = -(this.m_u1.x * l + this.m_u1.y * h) - this.m_ratio * (this.m_u2.x * c + this.m_u2.y * _), g = this.m_pulleyMass * -f, v = this.m_impulse, this.m_impulse = p.common.math.B2Math.max(0, this.m_impulse + g), g = this.m_impulse - v, m = -g * this.m_u1.x, u = -g * this.m_u1.y, d = -this.m_ratio * g * this.m_u2.x, y = -this.m_ratio * g * this.m_u2.y, e.m_linearVelocity.x += e.m_invMass * m, e.m_linearVelocity.y += e.m_invMass * u, e.m_angularVelocity += e.m_invI * (i * u - n * m), s.m_linearVelocity.x += s.m_invMass * d, s.m_linearVelocity.y += s.m_invMass * y, s.m_angularVelocity += s.m_invI * (r * y - a * d)), 2 == this.m_limitState1 && (l = e.m_linearVelocity.x + -e.m_angularVelocity * n, h = e.m_linearVelocity.y + e.m_angularVelocity * i, f = -(this.m_u1.x * l + this.m_u1.y * h), g = -this.m_limitMass1 * f, v = this.m_limitImpulse1, this.m_limitImpulse1 = p.common.math.B2Math.max(0, this.m_limitImpulse1 + g), g = this.m_limitImpulse1 - v, m = -g * this.m_u1.x, u = -g * this.m_u1.y, e.m_linearVelocity.x += e.m_invMass * m, e.m_linearVelocity.y += e.m_invMass * u, e.m_angularVelocity += e.m_invI * (i * u - n * m)), 2 == this.m_limitState2 && (c = s.m_linearVelocity.x + -s.m_angularVelocity * a, _ = s.m_linearVelocity.y + s.m_angularVelocity * r, f = -(this.m_u2.x * c + this.m_u2.y * _), g = -this.m_limitMass2 * f, v = this.m_limitImpulse2, this.m_limitImpulse2 = p.common.math.B2Math.max(0, this.m_limitImpulse2 + g), g = this.m_limitImpulse2 - v, d = -g * this.m_u2.x, y = -g * this.m_u2.y, s.m_linearVelocity.x += s.m_invMass * d, s.m_linearVelocity.y += s.m_invMass * y, s.m_angularVelocity += s.m_invI * (r * y - a * d))
        },
        solvePositionConstraints: function() {
            var t, e, s, i, n, o, r, a, l, h, c, _, m, u, d = this.m_bodyA,
                y = this.m_bodyB,
                f = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x,
                g = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y,
                v = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x,
                x = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y,
                w = 0;
            return 2 == this.m_state && (t = d.m_xf.R, e = this.m_localAnchor1.x - d.m_sweep.localCenter.x, s = this.m_localAnchor1.y - d.m_sweep.localCenter.y, u = t.col1.x * e + t.col2.x * s, s = t.col1.y * e + t.col2.y * s, e = u, t = y.m_xf.R, i = this.m_localAnchor2.x - y.m_sweep.localCenter.x, n = this.m_localAnchor2.y - y.m_sweep.localCenter.y, u = t.col1.x * i + t.col2.x * n, n = t.col1.y * i + t.col2.y * n, i = u, o = d.m_sweep.c.x + e, r = d.m_sweep.c.y + s, a = y.m_sweep.c.x + i, l = y.m_sweep.c.y + n, this.m_u1.set(o - f, r - g), this.m_u2.set(a - v, l - x), h = this.m_u1.length(), c = this.m_u2.length(), h > p.common.B2Settings.b2_linearSlop ? this.m_u1.multiply(1 / h) : this.m_u1.setZero(), c > p.common.B2Settings.b2_linearSlop ? this.m_u2.multiply(1 / c) : this.m_u2.setZero(), _ = this.m_constant - h - this.m_ratio * c, w = p.common.math.B2Math.max(w, -_), _ = p.common.math.B2Math.clamp(_ + p.common.B2Settings.b2_linearSlop, -p.common.B2Settings.b2_maxLinearCorrection, 0), m = -this.m_pulleyMass * _, o = -m * this.m_u1.x, r = -m * this.m_u1.y, a = -this.m_ratio * m * this.m_u2.x, l = -this.m_ratio * m * this.m_u2.y, d.m_sweep.c.x += d.m_invMass * o, d.m_sweep.c.y += d.m_invMass * r, d.m_sweep.a += d.m_invI * (e * r - s * o), y.m_sweep.c.x += y.m_invMass * a, y.m_sweep.c.y += y.m_invMass * l, y.m_sweep.a += y.m_invI * (i * l - n * a), d.synchronizeTransform(), y.synchronizeTransform()), 2 == this.m_limitState1 && (t = d.m_xf.R, e = this.m_localAnchor1.x - d.m_sweep.localCenter.x, s = this.m_localAnchor1.y - d.m_sweep.localCenter.y, u = t.col1.x * e + t.col2.x * s, s = t.col1.y * e + t.col2.y * s, e = u, o = d.m_sweep.c.x + e, r = d.m_sweep.c.y + s, this.m_u1.set(o - f, r - g), h = this.m_u1.length(), h > p.common.B2Settings.b2_linearSlop ? (this.m_u1.x *= 1 / h, this.m_u1.y *= 1 / h) : this.m_u1.setZero(), _ = this.m_maxLength1 - h, w = p.common.math.B2Math.max(w, -_), _ = p.common.math.B2Math.clamp(_ + p.common.B2Settings.b2_linearSlop, -p.common.B2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass1 * _, o = -m * this.m_u1.x, r = -m * this.m_u1.y, d.m_sweep.c.x += d.m_invMass * o, d.m_sweep.c.y += d.m_invMass * r, d.m_sweep.a += d.m_invI * (e * r - s * o), d.synchronizeTransform()), 2 == this.m_limitState2 && (t = y.m_xf.R, i = this.m_localAnchor2.x - y.m_sweep.localCenter.x, n = this.m_localAnchor2.y - y.m_sweep.localCenter.y, u = t.col1.x * i + t.col2.x * n, n = t.col1.y * i + t.col2.y * n, i = u, a = y.m_sweep.c.x + i, l = y.m_sweep.c.y + n, this.m_u2.set(a - v, l - x), c = this.m_u2.length(), c > p.common.B2Settings.b2_linearSlop ? (this.m_u2.x *= 1 / c, this.m_u2.y *= 1 / c) : this.m_u2.setZero(), _ = this.m_maxLength2 - c, w = p.common.math.B2Math.max(w, -_), _ = p.common.math.B2Math.clamp(_ + p.common.B2Settings.b2_linearSlop, -p.common.B2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass2 * _, a = -m * this.m_u2.x, l = -m * this.m_u2.y, y.m_sweep.c.x += y.m_invMass * a, y.m_sweep.c.y += y.m_invMass * l, y.m_sweep.a += y.m_invI * (i * l - n * a), y.synchronizeTransform()), w < p.common.B2Settings.b2_linearSlop
        },
        __class__: p.dynamics.joints.B2PulleyJoint
    }), p.dynamics.joints.B2PulleyJointDef = function() {}, i["box2D.dynamics.joints.B2PulleyJointDef"] = p.dynamics.joints.B2PulleyJointDef, p.dynamics.joints.B2PulleyJointDef.__name__ = !0, p.dynamics.joints.B2PulleyJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2PulleyJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2PulleyJointDef
    }), p.dynamics.joints.B2RevoluteJoint = function(t) {
        this.m_pivotMass = new p.common.math.B2Mat22, this.m_pivotForce = new p.common.math.B2Vec2, this.m_localAnchor2 = new p.common.math.B2Vec2, this.m_localAnchor1 = new p.common.math.B2Vec2, p.dynamics.joints.B2Joint.call(this, t), this.K = new p.common.math.B2Mat22, this.K1 = new p.common.math.B2Mat22, this.K2 = new p.common.math.B2Mat22, this.K3 = new p.common.math.B2Mat22, this.m_localAnchor1.setV(t.localAnchorA), this.m_localAnchor2.setV(t.localAnchorB), this.m_referenceAngle = t.referenceAngle, this.m_pivotForce.set(0, 0), this.m_motorForce = 0, this.m_limitForce = 0, this.m_limitPositionImpulse = 0, this.m_lowerAngle = t.lowerAngle, this.m_upperAngle = t.upperAngle, this.m_maxMotorTorque = t.maxMotorTorque, this.m_motorSpeed = t.motorSpeed, this.m_enableLimit = t.enableLimit, this.m_enableMotor = t.enableMotor
    }, i["box2D.dynamics.joints.B2RevoluteJoint"] = p.dynamics.joints.B2RevoluteJoint, p.dynamics.joints.B2RevoluteJoint.__name__ = !0, p.dynamics.joints.B2RevoluteJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2RevoluteJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        getJointAngle: function() {
            return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
        },
        enableLimit: function(t) {
            this.m_enableLimit = t
        },
        setLimits: function(t, e) {
            this.m_lowerAngle = t, this.m_upperAngle = e
        },
        enableMotor: function(t) {
            this.m_enableMotor = t
        },
        setMotorSpeed: function(t) {
            this.m_motorSpeed = t
        },
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            e = i.m_xf.R;
            var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
                r = this.m_localAnchor1.y - i.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s, e = n.m_xf.R;
            var a = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
                l = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
            s = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = s;
            var h = i.m_invMass,
                c = n.m_invMass,
                _ = i.m_invI,
                m = n.m_invI;
            if (this.K1.col1.x = h + c, this.K1.col2.x = 0, this.K1.col1.y = 0, this.K1.col2.y = h + c, this.K2.col1.x = _ * r * r, this.K2.col2.x = -_ * o * r, this.K2.col1.y = -_ * o * r, this.K2.col2.y = _ * o * o, this.K3.col1.x = m * l * l, this.K3.col2.x = -m * a * l, this.K3.col1.y = -m * a * l, this.K3.col2.y = m * a * a, this.K.setM(this.K1), this.K.addM(this.K2), this.K.addM(this.K3), this.K.getInverse(this.m_pivotMass), this.m_motorMass = 1 / (_ + m), 0 == this.m_enableMotor && (this.m_motorForce = 0), this.m_enableLimit) {
                var u = n.m_sweep.a - i.m_sweep.a - this.m_referenceAngle;
                p.common.math.B2Math.abs(this.m_upperAngle - this.m_lowerAngle) < 2 * p.common.B2Settings.b2_angularSlop ? this.m_limitState = 3 : u <= this.m_lowerAngle ? (1 != this.m_limitState && (this.m_limitForce = 0), this.m_limitState = 1) : u >= this.m_upperAngle ? (2 != this.m_limitState && (this.m_limitForce = 0), this.m_limitState = 2) : (this.m_limitState = 0, this.m_limitForce = 0)
            } else this.m_limitForce = 0;
            t.warmStarting ? (i.m_linearVelocity.x -= t.dt * h * this.m_pivotForce.x, i.m_linearVelocity.y -= t.dt * h * this.m_pivotForce.y, i.m_angularVelocity -= t.dt * _ * (o * this.m_pivotForce.y - r * this.m_pivotForce.x + this.m_motorForce + this.m_limitForce), n.m_linearVelocity.x += t.dt * c * this.m_pivotForce.x, n.m_linearVelocity.y += t.dt * c * this.m_pivotForce.y, n.m_angularVelocity += t.dt * m * (a * this.m_pivotForce.y - l * this.m_pivotForce.x + this.m_motorForce + this.m_limitForce)) : (this.m_pivotForce.setZero(), this.m_motorForce = 0, this.m_limitForce = 0), this.m_limitPositionImpulse = 0
        },
        solveVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            e = i.m_xf.R;
            var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
                r = this.m_localAnchor1.y - i.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s, e = n.m_xf.R;
            var a = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
                l = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
            s = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = s;
            var h, c = n.m_linearVelocity.x + -n.m_angularVelocity * l - i.m_linearVelocity.x - -i.m_angularVelocity * r,
                _ = n.m_linearVelocity.y + n.m_angularVelocity * a - i.m_linearVelocity.y - i.m_angularVelocity * o,
                m = -t.inv_dt * (this.m_pivotMass.col1.x * c + this.m_pivotMass.col2.x * _),
                u = -t.inv_dt * (this.m_pivotMass.col1.y * c + this.m_pivotMass.col2.y * _);
            this.m_pivotForce.x += m, this.m_pivotForce.y += u;
            var d = t.dt * m,
                y = t.dt * u;
            if (i.m_linearVelocity.x -= i.m_invMass * d, i.m_linearVelocity.y -= i.m_invMass * y, i.m_angularVelocity -= i.m_invI * (o * y - r * d), n.m_linearVelocity.x += n.m_invMass * d, n.m_linearVelocity.y += n.m_invMass * y, n.m_angularVelocity += n.m_invI * (a * y - l * d), this.m_enableMotor && 3 != this.m_limitState) {
                var f = n.m_angularVelocity - i.m_angularVelocity - this.m_motorSpeed,
                    g = -t.inv_dt * this.m_motorMass * f,
                    v = this.m_motorForce;
                this.m_motorForce = p.common.math.B2Math.clamp(this.m_motorForce + g, -this.m_maxMotorTorque, this.m_maxMotorTorque), g = this.m_motorForce - v, i.m_angularVelocity -= i.m_invI * t.dt * g, n.m_angularVelocity += n.m_invI * t.dt * g
            }
            if (this.m_enableLimit && 0 != this.m_limitState) {
                var x = n.m_angularVelocity - i.m_angularVelocity,
                    w = -t.inv_dt * this.m_motorMass * x;
                3 == this.m_limitState ? this.m_limitForce += w : 1 == this.m_limitState ? (h = this.m_limitForce, this.m_limitForce = p.common.math.B2Math.max(this.m_limitForce + w, 0), w = this.m_limitForce - h) : 2 == this.m_limitState && (h = this.m_limitForce, this.m_limitForce = p.common.math.B2Math.min(this.m_limitForce + w, 0), w = this.m_limitForce - h), i.m_angularVelocity -= i.m_invI * t.dt * w, n.m_angularVelocity += n.m_invI * t.dt * w
            }
        },
        solvePositionConstraints: function() {
            var t, e, s, i = this.m_bodyA,
                n = this.m_bodyB,
                o = 0;
            s = i.m_xf.R;
            var r = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
                a = this.m_localAnchor1.y - i.m_sweep.localCenter.y,
                l = s.col1.x * r + s.col2.x * a;
            a = s.col1.y * r + s.col2.y * a, r = l, s = n.m_xf.R;
            var h = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
                c = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
            l = s.col1.x * h + s.col2.x * c, c = s.col1.y * h + s.col2.y * c, h = l;
            var _ = i.m_sweep.c.x + r,
                m = i.m_sweep.c.y + a,
                u = n.m_sweep.c.x + h,
                d = n.m_sweep.c.y + c,
                y = u - _,
                f = d - m;
            o = Math.sqrt(y * y + f * f);
            var g = i.m_invMass,
                v = n.m_invMass,
                x = i.m_invI,
                w = n.m_invI;
            this.K1.col1.x = g + v, this.K1.col2.x = 0, this.K1.col1.y = 0, this.K1.col2.y = g + v, this.K2.col1.x = x * a * a, this.K2.col2.x = -x * r * a, this.K2.col1.y = -x * r * a, this.K2.col2.y = x * r * r, this.K3.col1.x = w * c * c, this.K3.col2.x = -w * h * c, this.K3.col1.y = -w * h * c, this.K3.col2.y = w * h * h, this.K.setM(this.K1), this.K.addM(this.K2), this.K.addM(this.K3), this.K.solve(p.dynamics.joints.B2RevoluteJoint.tImpulse, -y, -f);
            var b = p.dynamics.joints.B2RevoluteJoint.tImpulse.x,
                B = p.dynamics.joints.B2RevoluteJoint.tImpulse.y;
            i.m_sweep.c.x -= i.m_invMass * b, i.m_sweep.c.y -= i.m_invMass * B, i.m_sweep.a -= i.m_invI * (r * B - a * b), n.m_sweep.c.x += n.m_invMass * b, n.m_sweep.c.y += n.m_invMass * B, n.m_sweep.a += n.m_invI * (h * B - c * b), i.synchronizeTransform(), n.synchronizeTransform();
            var S = 0;
            if (this.m_enableLimit && 0 != this.m_limitState) {
                var A = n.m_sweep.a - i.m_sweep.a - this.m_referenceAngle,
                    C = 0;
                3 == this.m_limitState ? (e = p.common.math.B2Math.clamp(A, -p.common.B2Settings.b2_maxAngularCorrection, p.common.B2Settings.b2_maxAngularCorrection), C = -this.m_motorMass * e, S = p.common.math.B2Math.abs(e)) : 1 == this.m_limitState ? (e = A - this.m_lowerAngle, S = p.common.math.B2Math.max(0, -e), e = p.common.math.B2Math.clamp(e + p.common.B2Settings.b2_angularSlop, -p.common.B2Settings.b2_maxAngularCorrection, 0), C = -this.m_motorMass * e, t = this.m_limitPositionImpulse, this.m_limitPositionImpulse = p.common.math.B2Math.max(this.m_limitPositionImpulse + C, 0), C = this.m_limitPositionImpulse - t) : 2 == this.m_limitState && (e = A - this.m_upperAngle, S = p.common.math.B2Math.max(0, e), e = p.common.math.B2Math.clamp(e - p.common.B2Settings.b2_angularSlop, 0, p.common.B2Settings.b2_maxAngularCorrection), C = -this.m_motorMass * e, t = this.m_limitPositionImpulse, this.m_limitPositionImpulse = p.common.math.B2Math.min(this.m_limitPositionImpulse + C, 0), C = this.m_limitPositionImpulse - t), i.m_sweep.a -= i.m_invI * C, n.m_sweep.a += n.m_invI * C, i.synchronizeTransform(), n.synchronizeTransform()
            }
            return o <= p.common.B2Settings.b2_linearSlop && S <= p.common.B2Settings.b2_angularSlop
        },
        __class__: p.dynamics.joints.B2RevoluteJoint
    }), p.dynamics.joints.B2RevoluteJointDef = function() {
        p.dynamics.joints.B2JointDef.call(this), this.localAnchorA = new p.common.math.B2Vec2, this.localAnchorB = new p.common.math.B2Vec2, this.type = 1, this.localAnchorA.set(0, 0), this.localAnchorB.set(0, 0), this.referenceAngle = 0, this.lowerAngle = 0, this.upperAngle = 0, this.maxMotorTorque = 0, this.motorSpeed = 0, this.enableLimit = !1, this.enableMotor = !1
    }, i["box2D.dynamics.joints.B2RevoluteJointDef"] = p.dynamics.joints.B2RevoluteJointDef, p.dynamics.joints.B2RevoluteJointDef.__name__ = !0, p.dynamics.joints.B2RevoluteJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2RevoluteJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2RevoluteJointDef
    }), p.dynamics.joints.B2WeldJoint = function(t) {
        p.dynamics.joints.B2Joint.call(this, t), this.m_localAnchorA = new p.common.math.B2Vec2, this.m_localAnchorB = new p.common.math.B2Vec2, this.m_impulse = new p.common.math.B2Vec3, this.m_mass = new p.common.math.B2Mat33, this.m_localAnchorA.setV(t.localAnchorA), this.m_localAnchorB.setV(t.localAnchorB), this.m_referenceAngle = t.referenceAngle, this.m_impulse.setZero(), this.m_mass = new p.common.math.B2Mat33
    }, i["box2D.dynamics.joints.B2WeldJoint"] = p.dynamics.joints.B2WeldJoint, p.dynamics.joints.B2WeldJoint.__name__ = !0, p.dynamics.joints.B2WeldJoint.__super__ = p.dynamics.joints.B2Joint, p.dynamics.joints.B2WeldJoint.prototype = t(p.dynamics.joints.B2Joint.prototype, {
        initVelocityConstraints: function(t) {
            var e, s, i = this.m_bodyA,
                n = this.m_bodyB;
            e = i.m_xf.R;
            var o = this.m_localAnchorA.x - i.m_sweep.localCenter.x,
                r = this.m_localAnchorA.y - i.m_sweep.localCenter.y;
            s = e.col1.x * o + e.col2.x * r, r = e.col1.y * o + e.col2.y * r, o = s, e = n.m_xf.R;
            var a = this.m_localAnchorB.x - n.m_sweep.localCenter.x,
                l = this.m_localAnchorB.y - n.m_sweep.localCenter.y;
            s = e.col1.x * a + e.col2.x * l, l = e.col1.y * a + e.col2.y * l, a = s;
            var h = i.m_invMass,
                c = n.m_invMass,
                _ = i.m_invI,
                m = n.m_invI;
            this.m_mass.col1.x = h + c + r * r * _ + l * l * m, this.m_mass.col2.x = -r * o * _ - l * a * m, this.m_mass.col3.x = -r * _ - l * m, this.m_mass.col1.y = this.m_mass.col2.x, this.m_mass.col2.y = h + c + o * o * _ + a * a * m, this.m_mass.col3.y = o * _ + a * m, this.m_mass.col1.z = this.m_mass.col3.x, this.m_mass.col2.z = this.m_mass.col3.y, this.m_mass.col3.z = _ + m, t.warmStarting ? (this.m_impulse.x *= t.dtRatio, this.m_impulse.y *= t.dtRatio, this.m_impulse.z *= t.dtRatio, i.m_linearVelocity.x -= h * this.m_impulse.x, i.m_linearVelocity.y -= h * this.m_impulse.y, i.m_angularVelocity -= _ * (o * this.m_impulse.y - r * this.m_impulse.x + this.m_impulse.z), n.m_linearVelocity.x += c * this.m_impulse.x, n.m_linearVelocity.y += c * this.m_impulse.y, n.m_angularVelocity += m * (a * this.m_impulse.y - l * this.m_impulse.x + this.m_impulse.z)) : this.m_impulse.setZero()
        },
        solveVelocityConstraints: function() {
            var t, e, s = this.m_bodyA,
                i = this.m_bodyB,
                n = s.m_linearVelocity,
                o = s.m_angularVelocity,
                r = i.m_linearVelocity,
                a = i.m_angularVelocity,
                l = s.m_invMass,
                h = i.m_invMass,
                c = s.m_invI,
                _ = i.m_invI;
            t = s.m_xf.R;
            var m = this.m_localAnchorA.x - s.m_sweep.localCenter.x,
                u = this.m_localAnchorA.y - s.m_sweep.localCenter.y;
            e = t.col1.x * m + t.col2.x * u, u = t.col1.y * m + t.col2.y * u, m = e, t = i.m_xf.R;
            var d = this.m_localAnchorB.x - i.m_sweep.localCenter.x,
                y = this.m_localAnchorB.y - i.m_sweep.localCenter.y;
            e = t.col1.x * d + t.col2.x * y, y = t.col1.y * d + t.col2.y * y, d = e;
            var f = r.x - a * y - n.x + o * u,
                g = r.y + a * d - n.y - o * m,
                v = a - o,
                x = new p.common.math.B2Vec3;
            this.m_mass.solve33(x, -f, -g, -v), this.m_impulse.add(x), n.x -= l * x.x, n.y -= l * x.y, o -= c * (m * x.y - u * x.x + x.z), r.x += h * x.x, r.y += h * x.y, a += _ * (d * x.y - y * x.x + x.z), s.m_angularVelocity = o, i.m_angularVelocity = a
        },
        solvePositionConstraints: function() {
            var t, e, s = this.m_bodyA,
                i = this.m_bodyB;
            t = s.m_xf.R;
            var n = this.m_localAnchorA.x - s.m_sweep.localCenter.x,
                o = this.m_localAnchorA.y - s.m_sweep.localCenter.y;
            e = t.col1.x * n + t.col2.x * o, o = t.col1.y * n + t.col2.y * o, n = e, t = i.m_xf.R;
            var r = this.m_localAnchorB.x - i.m_sweep.localCenter.x,
                a = this.m_localAnchorB.y - i.m_sweep.localCenter.y;
            e = t.col1.x * r + t.col2.x * a, a = t.col1.y * r + t.col2.y * a, r = e;
            var l = s.m_invMass,
                h = i.m_invMass,
                c = s.m_invI,
                _ = i.m_invI,
                m = i.m_sweep.c.x + r - s.m_sweep.c.x - n,
                u = i.m_sweep.c.y + a - s.m_sweep.c.y - o,
                d = i.m_sweep.a - s.m_sweep.a - this.m_referenceAngle,
                y = 10 * p.common.B2Settings.b2_linearSlop,
                f = Math.sqrt(m * m + u * u),
                g = p.common.math.B2Math.abs(d);
            f > y && (c *= 1, _ *= 1), this.m_mass.col1.x = l + h + o * o * c + a * a * _, this.m_mass.col2.x = -o * n * c - a * r * _, this.m_mass.col3.x = -o * c - a * _, this.m_mass.col1.y = this.m_mass.col2.x, this.m_mass.col2.y = l + h + n * n * c + r * r * _, this.m_mass.col3.y = n * c + r * _, this.m_mass.col1.z = this.m_mass.col3.x, this.m_mass.col2.z = this.m_mass.col3.y, this.m_mass.col3.z = c + _;
            var v = new p.common.math.B2Vec3;
            return this.m_mass.solve33(v, -m, -u, -d), s.m_sweep.c.x -= l * v.x, s.m_sweep.c.y -= l * v.y, s.m_sweep.a -= c * (n * v.y - o * v.x + v.z), i.m_sweep.c.x += h * v.x, i.m_sweep.c.y += h * v.y, i.m_sweep.a += _ * (r * v.y - a * v.x + v.z), s.synchronizeTransform(), i.synchronizeTransform(), f <= p.common.B2Settings.b2_linearSlop && g <= p.common.B2Settings.b2_angularSlop
        },
        __class__: p.dynamics.joints.B2WeldJoint
    }), p.dynamics.joints.B2WeldJointDef = function() {}, i["box2D.dynamics.joints.B2WeldJointDef"] = p.dynamics.joints.B2WeldJointDef, p.dynamics.joints.B2WeldJointDef.__name__ = !0, p.dynamics.joints.B2WeldJointDef.__super__ = p.dynamics.joints.B2JointDef, p.dynamics.joints.B2WeldJointDef.prototype = t(p.dynamics.joints.B2JointDef.prototype, {
        __class__: p.dynamics.joints.B2WeldJointDef
    });
    var S = {};
    S.Log = function() {}, i["haxe.Log"] = S.Log, S.Log.__name__ = !0, S.Log.trace = function(t, e) {
        A.Boot.__trace(t, e)
    }, S.Resource = function() {}, i["haxe.Resource"] = S.Resource, S.Resource.__name__ = !0, S.Resource.getString = function(t) {
        for (var e = 0, s = S.Resource.content; e < s.length;) {
            var i = s[e];
            if (++e, i.name == t) {
                if (null != i.str) return i.str;
                var n = S.crypto.Base64.decode(i.data);
                return n.toString()
            }
        }
        return null
    }, S.Timer = function() {}, i["haxe.Timer"] = S.Timer, S.Timer.__name__ = !0, S.Timer.stamp = function() {
        return (new Date).getTime() / 1e3
    }, S.Unserializer = function(t) {
        this.buf = t, this.length = t.length, this.pos = 0, this.scache = new Array, this.cache = new Array;
        var e = S.Unserializer.DEFAULT_RESOLVER;
        null == e && (e = B, S.Unserializer.DEFAULT_RESOLVER = e), this.setResolver(e)
    }, i["haxe.Unserializer"] = S.Unserializer, S.Unserializer.__name__ = !0, S.Unserializer.initCodes = function() {
        for (var t = new Array, e = 0, s = S.Unserializer.BASE64.length; s > e;) {
            var i = e++;
            t[S.Unserializer.BASE64.charCodeAt(i)] = i
        }
        return t
    }, S.Unserializer.prototype = {
        setResolver: function(t) {
            this.resolver = null == t ? {
                resolveClass: function() {
                    return null
                },
                resolveEnum: function() {
                    return null
                }
            } : t
        },
        get: function(t) {
            return this.buf.charCodeAt(t)
        },
        readDigits: function() {
            for (var t = 0, e = !1, s = this.pos;;) {
                var i = this.buf.charCodeAt(this.pos);
                if (i != i) break;
                if (45 != i) {
                    if (48 > i || i > 57) break;
                    t = 10 * t + (i - 48), this.pos++
                } else {
                    if (this.pos != s) break;
                    e = !0, this.pos++
                }
            }
            return e && (t *= -1), t
        },
        unserializeObject: function(t) {
            for (;;) {
                if (this.pos >= this.length) throw "Invalid object";
                if (103 == this.buf.charCodeAt(this.pos)) break;
                var e = this.unserialize();
                if ("string" != typeof e) throw "Invalid object key";
                var s = this.unserialize();
                t[e] = s
            }
            this.pos++
        },
        unserializeEnum: function(t, e) {
            if (58 != this.get(this.pos++)) throw "Invalid enum format";
            var s = this.readDigits();
            if (0 == s) return B.createEnum(t, e);
            for (var i = new Array; s-- > 0;) i.push(this.unserialize());
            return B.createEnum(t, e, i)
        },
        unserialize: function() {
            var t = this.get(this.pos++);
            switch (t) {
                case 110:
                    return null;
                case 116:
                    return !0;
                case 102:
                    return !1;
                case 122:
                    return 0;
                case 105:
                    return this.readDigits();
                case 100:
                    for (var e = this.pos;;) {
                        var s = this.buf.charCodeAt(this.pos);
                        if (!(s >= 43 && 58 > s || 101 == s || 69 == s)) break;
                        this.pos++
                    }
                    return w.parseFloat(h.substr(this.buf, e, this.pos - e));
                case 121:
                    var i = this.readDigits();
                    if (58 != this.get(this.pos++) || this.length - this.pos < i) throw "Invalid string length";
                    var n = h.substr(this.buf, this.pos, i);
                    return this.pos += i, n = decodeURIComponent(n.split("+").join(" ")), this.scache.push(n), n;
                case 107:
                    return Math.NaN;
                case 109:
                    return Math.NEGATIVE_INFINITY;
                case 112:
                    return Math.POSITIVE_INFINITY;
                case 97:
                    var o = (this.buf, new Array);
                    for (this.cache.push(o);;) {
                        var r = this.buf.charCodeAt(this.pos);
                        if (104 == r) {
                            this.pos++;
                            break
                        }
                        if (117 == r) {
                            this.pos++;
                            var a = this.readDigits();
                            o[o.length + a - 1] = null
                        } else o.push(this.unserialize())
                    }
                    return o;
                case 111:
                    var l = {};
                    return this.cache.push(l), this.unserializeObject(l), l;
                case 114:
                    var c = this.readDigits();
                    if (0 > c || c >= this.cache.length) throw "Invalid reference";
                    return this.cache[c];
                case 82:
                    var m = this.readDigits();
                    if (0 > m || m >= this.scache.length) throw "Invalid string reference";
                    return this.scache[m];
                case 120:
                    throw this.unserialize();
                case 99:
                    var u = this.unserialize(),
                        d = this.resolver.resolveClass(u);
                    if (null == d) throw "Class not found " + u;
                    var p = B.createEmptyInstance(d);
                    return this.cache.push(p), this.unserializeObject(p), p;
                case 119:
                    var y = this.unserialize(),
                        f = this.resolver.resolveEnum(y);
                    if (null == f) throw "Enum not found " + y;
                    var g = this.unserializeEnum(f, this.unserialize());
                    return this.cache.push(g), g;
                case 106:
                    var v = this.unserialize(),
                        x = this.resolver.resolveEnum(v);
                    if (null == x) throw "Enum not found " + v;
                    this.pos++;
                    var A = this.readDigits(),
                        C = B.getEnumConstructs(x)[A];
                    if (null == C) throw "Unknown enum index " + v + "@" + A;
                    var I = this.unserializeEnum(x, C);
                    return this.cache.push(I), I;
                case 108:
                    var k = new _;
                    this.cache.push(k);
                    for (this.buf; 104 != this.buf.charCodeAt(this.pos);) k.add(this.unserialize());
                    return this.pos++, k;
                case 98:
                    var M = new S.ds.StringMap;
                    this.cache.push(M);
                    for (this.buf; 104 != this.buf.charCodeAt(this.pos);) {
                        var V = this.unserialize();
                        M.set(V, this.unserialize())
                    }
                    return this.pos++, M;
                case 113:
                    var z = new S.ds.IntMap;
                    this.cache.push(z);
                    for (var T = (this.buf, this.get(this.pos++)); 58 == T;) {
                        var P = this.readDigits();
                        z.set(P, this.unserialize()), T = this.get(this.pos++)
                    }
                    if (104 != T) throw "Invalid IntMap format";
                    return z;
                case 77:
                    var D = new S.ds.ObjectMap;
                    this.cache.push(D);
                    for (this.buf; 104 != this.buf.charCodeAt(this.pos);) {
                        var L = this.unserialize();
                        D.set(L, this.unserialize())
                    }
                    return this.pos++, D;
                case 118:
                    var F, K = h.substr(this.buf, this.pos, 19);
                    return F = h.strDate(K), this.cache.push(F), this.pos += 19, F;
                case 115:
                    var E = this.readDigits(),
                        G = this.buf;
                    if (58 != this.get(this.pos++) || this.length - this.pos < E) throw "Invalid bytes length";
                    var j = S.Unserializer.CODES;
                    null == j && (j = S.Unserializer.initCodes(), S.Unserializer.CODES = j);
                    var R, O = this.pos,
                        J = 3 & E;
                    R = 3 * (E >> 2) + (J >= 2 ? J - 1 : 0);
                    for (var N = O + (E - J), W = S.io.Bytes.alloc(R), Z = 0; N > O;) {
                        var q = j[b.fastCodeAt(G, O++)],
                            U = j[b.fastCodeAt(G, O++)];
                        W.set(Z++, q << 2 | U >> 4);
                        var H = j[b.fastCodeAt(G, O++)];
                        W.set(Z++, U << 4 | H >> 2);
                        var Q = j[b.fastCodeAt(G, O++)];
                        W.set(Z++, H << 6 | Q)
                    }
                    if (J >= 2) {
                        var X = j[b.fastCodeAt(G, O++)],
                            Y = j[b.fastCodeAt(G, O++)];
                        if (W.set(Z++, X << 2 | Y >> 4), 3 == J) {
                            var $ = j[b.fastCodeAt(G, O++)];
                            W.set(Z++, Y << 4 | $ >> 2)
                        }
                    }
                    return this.pos += E, this.cache.push(W), W;
                case 67:
                    var te = this.unserialize(),
                        ee = this.resolver.resolveClass(te);
                    if (null == ee) throw "Class not found " + te;
                    var se = B.createEmptyInstance(ee);
                    if (this.cache.push(se), se.hxUnserialize(this), 103 != this.get(this.pos++)) throw "Invalid custom data";
                    return se
            }
            throw this.pos--, "Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos
        },
        __class__: S.Unserializer
    }, S.crypto = {}, S.crypto.Adler32 = function() {
        this.a1 = 1, this.a2 = 0
    }, i["haxe.crypto.Adler32"] = S.crypto.Adler32, S.crypto.Adler32.__name__ = !0, S.crypto.Adler32.read = function(t) {
        var e = new S.crypto.Adler32,
            s = t.readByte(),
            i = t.readByte(),
            n = t.readByte(),
            o = t.readByte();
        return e.a1 = n << 8 | o, e.a2 = s << 8 | i, e
    }, S.crypto.Adler32.prototype = {
        update: function(t, e, s) {
            for (var i = this.a1, n = this.a2, o = e, r = e + s; r > o;) {
                var a = o++,
                    l = t.b[a];
                i = (i + l) % 65521, n = (n + i) % 65521
            }
            this.a1 = i, this.a2 = n
        },
        equals: function(t) {
            return t.a1 == this.a1 && t.a2 == this.a2
        },
        __class__: S.crypto.Adler32
    }, S.io = {}, S.io.Bytes = function(t, e) {
        this.length = t, this.b = e
    }, i["haxe.io.Bytes"] = S.io.Bytes, S.io.Bytes.__name__ = !0, S.io.Bytes.alloc = function(t) {
        for (var e = new Array, s = 0; t > s;) {
            {
                s++
            }
            e.push(0)
        }
        return new S.io.Bytes(t, e)
    }, S.io.Bytes.ofString = function(t) {
        for (var e = new Array, s = 0; s < t.length;) {
            var i = b.fastCodeAt(t, s++);
            i >= 55296 && 56319 >= i && (i = i - 55232 << 10 | 1023 & b.fastCodeAt(t, s++)), 127 >= i ? e.push(i) : 2047 >= i ? (e.push(192 | i >> 6), e.push(128 | 63 & i)) : 65535 >= i ? (e.push(224 | i >> 12), e.push(128 | i >> 6 & 63), e.push(128 | 63 & i)) : (e.push(240 | i >> 18), e.push(128 | i >> 12 & 63), e.push(128 | i >> 6 & 63), e.push(128 | 63 & i))
        }
        return new S.io.Bytes(e.length, e)
    }, S.io.Bytes.prototype = {
        get: function(t) {
            return this.b[t]
        },
        set: function(t, e) {
            this.b[t] = 255 & e
        },
        blit: function(t, e, s, i) {
            if (0 > t || 0 > s || 0 > i || t + i > this.length || s + i > e.length) throw S.io.Error.OutsideBounds;
            var n = this.b,
                o = e.b;
            if (n == o && t > s)
                for (var r = i; r > 0;) r--, n[r + t] = o[r + s];
            else
                for (var a = 0; i > a;) {
                    var l = a++;
                    n[l + t] = o[l + s]
                }
        },
        getString: function(t, e) {
            if (0 > t || 0 > e || t + e > this.length) throw S.io.Error.OutsideBounds;
            for (var s = "", i = this.b, n = String.fromCharCode, o = t, r = t + e; r > o;) {
                var a = i[o++];
                if (128 > a) {
                    if (0 == a) break;
                    s += n(a)
                } else if (224 > a) s += n((63 & a) << 6 | 127 & i[o++]);
                else if (240 > a) {
                    var l = i[o++];
                    s += n((31 & a) << 12 | (127 & l) << 6 | 127 & i[o++])
                } else {
                    var h = i[o++],
                        c = i[o++],
                        _ = (15 & a) << 18 | (127 & h) << 12 | (127 & c) << 6 | 127 & i[o++];
                    s += n((_ >> 10) + 55232), s += n(1023 & _ | 56320)
                }
            }
            return s
        },
        toString: function() {
            return this.getString(0, this.length)
        },
        __class__: S.io.Bytes
    }, S.crypto.Base64 = function() {}, i["haxe.crypto.Base64"] = S.crypto.Base64, S.crypto.Base64.__name__ = !0, S.crypto.Base64.decode = function(t, e) {
        if (null == e && (e = !0), e)
            for (; 61 == h.cca(t, t.length - 1);) t = h.substr(t, 0, -1);
        return new S.crypto.BaseCode(S.crypto.Base64.BYTES).decodeBytes(S.io.Bytes.ofString(t))
    }, S.crypto.BaseCode = function(t) {
        for (var e = t.length, s = 1; e > 1 << s;) s++;
        if (s > 8 || e != 1 << s) throw "BaseCode : base length must be a power of two.";
        this.base = t, this.nbits = s
    }, i["haxe.crypto.BaseCode"] = S.crypto.BaseCode, S.crypto.BaseCode.__name__ = !0, S.crypto.BaseCode.prototype = {
        initTable: function() {
            for (var t = new Array, e = 0; 256 > e;) {
                var s = e++;
                t[s] = -1
            }
            for (var i = 0, n = this.base.length; n > i;) {
                var o = i++;
                t[this.base.b[o]] = o
            }
            this.tbl = t
        },
        decodeBytes: function(t) {
            {
                var e = this.nbits;
                this.base
            }
            null == this.tbl && this.initTable();
            for (var s = this.tbl, i = t.length * e >> 3, n = S.io.Bytes.alloc(i), o = 0, r = 0, a = 0, l = 0; i > l;) {
                for (; 8 > r;) {
                    r += e, o <<= e;
                    var h = s[t.get(a++)];
                    if (-1 == h) throw "BaseCode : invalid encoded char";
                    o |= h
                }
                r -= 8, n.set(l++, o >> r & 255)
            }
            return n
        },
        __class__: S.crypto.BaseCode
    }, S.ds = {}, S.ds.IntMap = function() {
        this.h = {}
    }, i["haxe.ds.IntMap"] = S.ds.IntMap, S.ds.IntMap.__name__ = !0, S.ds.IntMap.__interfaces__ = [f], S.ds.IntMap.prototype = {
        set: function(t, e) {
            this.h[t] = e
        },
        get: function(t) {
            return this.h[t]
        },
        exists: function(t) {
            return this.h.hasOwnProperty(t)
        },
        remove: function(t) {
            return this.h.hasOwnProperty(t) ? (delete this.h[t], !0) : !1
        },
        keys: function() {
            var t = [];
            for (var e in this.h) this.h.hasOwnProperty(e) && t.push(0 | e);
            return h.iter(t)
        },
        iterator: function() {
            return {
                ref: this.h,
                it: this.keys(),
                hasNext: function() {
                    return this.it.hasNext()
                },
                next: function() {
                    var t = this.it.next();
                    return this.ref[t]
                }
            }
        },
        __class__: S.ds.IntMap
    }, S.ds.ObjectMap = function() {
        this.h = {}, this.h.__keys__ = {}
    }, i["haxe.ds.ObjectMap"] = S.ds.ObjectMap, S.ds.ObjectMap.__name__ = !0, S.ds.ObjectMap.__interfaces__ = [f], S.ds.ObjectMap.prototype = {
        set: function(t, e) {
            var s = t.__id__ || (t.__id__ = ++S.ds.ObjectMap.count);
            this.h[s] = e, this.h.__keys__[s] = t
        },
        get: function(t) {
            return this.h[t.__id__]
        },
        exists: function(t) {
            return null != this.h.__keys__[t.__id__]
        },
        remove: function(t) {
            var e = t.__id__;
            return null == this.h.__keys__[e] ? !1 : (delete this.h[e], delete this.h.__keys__[e], !0)
        },
        keys: function() {
            var t = [];
            for (var e in this.h.__keys__) this.h.hasOwnProperty(e) && t.push(this.h.__keys__[e]);
            return h.iter(t)
        },
        iterator: function() {
            return {
                ref: this.h,
                it: this.keys(),
                hasNext: function() {
                    return this.it.hasNext()
                },
                next: function() {
                    var t = this.it.next();
                    return this.ref[t.__id__]
                }
            }
        },
        __class__: S.ds.ObjectMap
    }, S.ds.StringMap = function() {
        this.h = {}
    }, i["haxe.ds.StringMap"] = S.ds.StringMap, S.ds.StringMap.__name__ = !0, S.ds.StringMap.__interfaces__ = [f], S.ds.StringMap.prototype = {
        set: function(t, e) {
            this.h["$" + t] = e
        },
        get: function(t) {
            return this.h["$" + t]
        },
        exists: function(t) {
            return this.h.hasOwnProperty("$" + t)
        },
        remove: function(t) {
            return t = "$" + t, this.h.hasOwnProperty(t) ? (delete this.h[t], !0) : !1
        },
        keys: function() {
            var t = [];
            for (var e in this.h) this.h.hasOwnProperty(e) && t.push(e.substr(1));
            return h.iter(t)
        },
        iterator: function() {
            return {
                ref: this.h,
                it: this.keys(),
                hasNext: function() {
                    return this.it.hasNext()
                },
                next: function() {
                    var t = this.it.next();
                    return this.ref["$" + t]
                }
            }
        },
        __class__: S.ds.StringMap
    }, S.io.BytesBuffer = function() {
        this.b = new Array
    }, i["haxe.io.BytesBuffer"] = S.io.BytesBuffer, S.io.BytesBuffer.__name__ = !0, S.io.BytesBuffer.prototype = {
        addBytes: function(t, e, s) {
            if (0 > e || 0 > s || e + s > t.length) throw S.io.Error.OutsideBounds;
            for (var i = (this.b, t.b), n = e, o = e + s; o > n;) {
                var r = n++;
                this.b.push(i[r])
            }
        },
        getBytes: function() {
            var t = new S.io.Bytes(this.b.length, this.b);
            return this.b = null, t
        },
        __class__: S.io.BytesBuffer
    }, S.io.Input = function() {}, i["haxe.io.Input"] = S.io.Input, S.io.Input.__name__ = !0, S.io.Input.prototype = {
        readByte: function() {
            throw "Not implemented"
        },
        readBytes: function(t, e, s) {
            var i = s,
                n = t.b;
            if (0 > e || 0 > s || e + s > t.length) throw S.io.Error.OutsideBounds;
            for (; i > 0;) n[e] = this.readByte(), e++, i--;
            return s
        },
        read: function(t) {
            for (var e = S.io.Bytes.alloc(t), s = 0; t > 0;) {
                var i = this.readBytes(e, s, t);
                if (0 == i) throw S.io.Error.Blocked;
                s += i, t -= i
            }
            return e
        },
        readUInt16: function() {
            var t = this.readByte(),
                e = this.readByte();
            return this.bigEndian ? e | t << 8 : t | e << 8
        },
        __class__: S.io.Input
    }, S.io.BytesInput = function(t, e, s) {
        if (null == e && (e = 0), null == s && (s = t.length - e), 0 > e || 0 > s || e + s > t.length) throw S.io.Error.OutsideBounds;
        this.b = t.b, this.pos = e, this.len = s, this.totlen = s
    }, i["haxe.io.BytesInput"] = S.io.BytesInput, S.io.BytesInput.__name__ = !0, S.io.BytesInput.__super__ = S.io.Input, S.io.BytesInput.prototype = t(S.io.Input.prototype, {
        readByte: function() {
            if (0 == this.len) throw new S.io.Eof;
            return this.len--, this.b[this.pos++]
        },
        readBytes: function(t, e, s) {
            if (0 > e || 0 > s || e + s > t.length) throw S.io.Error.OutsideBounds;
            if (0 == this.len && s > 0) throw new S.io.Eof;
            this.len < s && (s = this.len);
            for (var i = this.b, n = t.b, o = 0; s > o;) {
                var r = o++;
                n[e + r] = i[this.pos + r]
            }
            return this.pos += s, this.len -= s, s
        },
        __class__: S.io.BytesInput
    }), S.io.Eof = function() {}, i["haxe.io.Eof"] = S.io.Eof, S.io.Eof.__name__ = !0, S.io.Eof.prototype = {
        toString: function() {
            return "Eof"
        },
        __class__: S.io.Eof
    }, S.io.Error = i["haxe.io.Error"] = {
        __ename__: !0,
        __constructs__: ["Blocked", "Overflow", "OutsideBounds", "Custom"]
    }, S.io.Error.Blocked = ["Blocked", 0], S.io.Error.Blocked.toString = n, S.io.Error.Blocked.__enum__ = S.io.Error, S.io.Error.Overflow = ["Overflow", 1], S.io.Error.Overflow.toString = n, S.io.Error.Overflow.__enum__ = S.io.Error, S.io.Error.OutsideBounds = ["OutsideBounds", 2], S.io.Error.OutsideBounds.toString = n, S.io.Error.OutsideBounds.__enum__ = S.io.Error, S.io.Error.Custom = function(t) {
        var e = ["Custom", 3, t];
        return e.__enum__ = S.io.Error, e.toString = n, e
    }, S.io.Path = function(t) {
        var e = t.lastIndexOf("/"),
            s = t.lastIndexOf("\\");
        s > e ? (this.dir = h.substr(t, 0, s), t = h.substr(t, s + 1, null), this.backslash = !0) : e > s ? (this.dir = h.substr(t, 0, e), t = h.substr(t, e + 1, null)) : this.dir = null;
        var i = t.lastIndexOf("."); - 1 != i ? (this.ext = h.substr(t, i + 1, null), this.file = h.substr(t, 0, i)) : (this.ext = null, this.file = t)
    }, i["haxe.io.Path"] = S.io.Path, S.io.Path.__name__ = !0, S.io.Path.withoutExtension = function(t) {
        var e = new S.io.Path(t);
        return e.ext = null, e.toString()
    }, S.io.Path.withoutDirectory = function(t) {
        var e = new S.io.Path(t);
        return e.dir = null, e.toString()
    }, S.io.Path.directory = function(t) {
        var e = new S.io.Path(t);
        return null == e.dir ? "" : e.dir
    }, S.io.Path.extension = function(t) {
        var e = new S.io.Path(t);
        return null == e.ext ? "" : e.ext
    }, S.io.Path.join = function(t) {
        var e = t.filter(function(t) {
            return null != t && "" != t
        });
        if (0 == e.length) return "";
        for (var s = e[0], i = 1, n = e.length; n > i;) {
            var o = i++;
            s = S.io.Path.addTrailingSlash(s), s += e[o]
        }
        return S.io.Path.normalize(s)
    }, S.io.Path.normalize = function(t) {
        var e = "/";
        if (t = t.split("\\").join("/"), null == t || t == e) return e;
        var s, i, n = [];
        s = t.split(e);
        for (var o = 0, r = s.length; r > o;) {
            var l = o++;
            i = s[l], ".." == i ? n.pop() : "." != i && n.push(i)
        }
        var h = n.join(e),
            c = new a("([^:])/+", "g"),
            _ = c.replace(h, "$1" + e);
        return _
    }, S.io.Path.addTrailingSlash = function(t) {
        if (0 == t.length) return "/";
        var e = t.lastIndexOf("/"),
            s = t.lastIndexOf("\\");
        return s > e ? s != t.length - 1 ? t + "\\" : t : e != t.length - 1 ? t + "/" : t
    }, S.io.Path.prototype = {
        toString: function() {
            return (null == this.dir ? "" : this.dir + (this.backslash ? "\\" : "/")) + this.file + (null == this.ext ? "" : "." + this.ext)
        },
        __class__: S.io.Path
    }, S.zip = {}, S.zip.Huffman = i["haxe.zip.Huffman"] = {
        __ename__: !0,
        __constructs__: ["Found", "NeedBit", "NeedBits"]
    }, S.zip.Huffman.Found = function(t) {
        var e = ["Found", 0, t];
        return e.__enum__ = S.zip.Huffman, e.toString = n, e
    }, S.zip.Huffman.NeedBit = function(t, e) {
        var s = ["NeedBit", 1, t, e];
        return s.__enum__ = S.zip.Huffman, s.toString = n, s
    }, S.zip.Huffman.NeedBits = function(t, e) {
        var s = ["NeedBits", 2, t, e];
        return s.__enum__ = S.zip.Huffman, s.toString = n, s
    }, S.zip.HuffTools = function() {}, i["haxe.zip.HuffTools"] = S.zip.HuffTools, S.zip.HuffTools.__name__ = !0, S.zip.HuffTools.prototype = {
        treeDepth: function(t) {
            switch (t[1]) {
                case 0:
                    return 0;
                case 2:
                    throw "assert";
                case 1:
                    var e = t[3],
                        s = t[2],
                        i = this.treeDepth(s),
                        n = this.treeDepth(e);
                    return 1 + (n > i ? i : n)
            }
        },
        treeCompress: function(t) {
            var e = this.treeDepth(t);
            if (0 == e) return t;
            if (1 == e) switch (t[1]) {
                case 1:
                    var s = t[3],
                        i = t[2];
                    return S.zip.Huffman.NeedBit(this.treeCompress(i), this.treeCompress(s));
                default:
                    throw "assert"
            }
            for (var n = 1 << e, o = new Array, r = 0; n > r;) {
                {
                    r++
                }
                o.push(S.zip.Huffman.Found(-1))
            }
            return this.treeWalk(o, 0, 0, e, t), S.zip.Huffman.NeedBits(e, o)
        },
        treeWalk: function(t, e, s, i, n) {
            switch (n[1]) {
                case 1:
                    var o = n[3],
                        r = n[2];
                    i > 0 ? (this.treeWalk(t, e, s + 1, i - 1, r), this.treeWalk(t, e | 1 << s, s + 1, i - 1, o)) : t[e] = this.treeCompress(n);
                    break;
                default:
                    t[e] = this.treeCompress(n)
            }
        },
        treeMake: function(t, e, s, i) {
            if (i > e) throw "Invalid huffman";
            var n = s << 5 | i;
            return t.exists(n) ? S.zip.Huffman.Found(t.get(n)) : (s <<= 1, i += 1, S.zip.Huffman.NeedBit(this.treeMake(t, e, s, i), this.treeMake(t, e, 1 | s, i)))
        },
        make: function(t, e, s, i) {
            var n = new Array,
                o = new Array;
            if (i > 32) throw "Invalid huffman";
            for (var r = 0; i > r;) {
                {
                    r++
                }
                n.push(0), o.push(0)
            }
            for (var a = 0; s > a;) {
                var l = a++,
                    h = t[l + e];
                if (h >= i) throw "Invalid huffman";
                n[h]++
            }
            for (var c = 0, _ = 1, m = i - 1; m > _;) {
                var u = _++;
                c = c + n[u] << 1, o[u] = c
            }
            for (var d = new S.ds.IntMap, p = 0; s > p;) {
                var y = p++,
                    f = t[y + e];
                if (0 != f) {
                    var g = o[f - 1];
                    o[f - 1] = g + 1, d.set(g << 5 | f, y)
                }
            }
            return this.treeCompress(S.zip.Huffman.NeedBit(this.treeMake(d, i, 0, 1), this.treeMake(d, i, 1, 1)))
        },
        __class__: S.zip.HuffTools
    }, S.zip._InflateImpl = {}, S.zip._InflateImpl.Window = function(t) {
        this.buffer = S.io.Bytes.alloc(65536), this.pos = 0, t && (this.crc = new S.crypto.Adler32)
    }, i["haxe.zip._InflateImpl.Window"] = S.zip._InflateImpl.Window, S.zip._InflateImpl.Window.__name__ = !0, S.zip._InflateImpl.Window.prototype = {
        slide: function() {
            null != this.crc && this.crc.update(this.buffer, 0, 32768);
            var t = S.io.Bytes.alloc(65536);
            this.pos -= 32768, t.blit(0, this.buffer, 32768, this.pos), this.buffer = t
        },
        addBytes: function(t, e, s) {
            this.pos + s > 65536 && this.slide(), this.buffer.blit(this.pos, t, e, s), this.pos += s
        },
        addByte: function(t) {
            65536 == this.pos && this.slide(), this.buffer.b[this.pos] = 255 & t, this.pos++
        },
        getLastChar: function() {
            return this.buffer.b[this.pos - 1]
        },
        available: function() {
            return this.pos
        },
        checksum: function() {
            return null != this.crc && this.crc.update(this.buffer, 0, this.pos), this.crc
        },
        __class__: S.zip._InflateImpl.Window
    }, S.zip._InflateImpl.State = i["haxe.zip._InflateImpl.State"] = {
        __ename__: !0,
        __constructs__: ["Head", "Block", "CData", "Flat", "Crc", "Dist", "DistOne", "Done"]
    }, S.zip._InflateImpl.State.Head = ["Head", 0], S.zip._InflateImpl.State.Head.toString = n, S.zip._InflateImpl.State.Head.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.Block = ["Block", 1], S.zip._InflateImpl.State.Block.toString = n, S.zip._InflateImpl.State.Block.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.CData = ["CData", 2], S.zip._InflateImpl.State.CData.toString = n, S.zip._InflateImpl.State.CData.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.Flat = ["Flat", 3], S.zip._InflateImpl.State.Flat.toString = n, S.zip._InflateImpl.State.Flat.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.Crc = ["Crc", 4], S.zip._InflateImpl.State.Crc.toString = n, S.zip._InflateImpl.State.Crc.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.Dist = ["Dist", 5], S.zip._InflateImpl.State.Dist.toString = n, S.zip._InflateImpl.State.Dist.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.DistOne = ["DistOne", 6], S.zip._InflateImpl.State.DistOne.toString = n, S.zip._InflateImpl.State.DistOne.__enum__ = S.zip._InflateImpl.State, S.zip._InflateImpl.State.Done = ["Done", 7], S.zip._InflateImpl.State.Done.toString = n, S.zip._InflateImpl.State.Done.__enum__ = S.zip._InflateImpl.State, S.zip.InflateImpl = function(t, e, s) {
        null == s && (s = !0), null == e && (e = !0), this["final"] = !1, this.htools = new S.zip.HuffTools, this.huffman = this.buildFixedHuffman(), this.huffdist = null, this.len = 0, this.dist = 0, this.state = e ? S.zip._InflateImpl.State.Head : S.zip._InflateImpl.State.Block, this.input = t, this.bits = 0, this.nbits = 0, this.needed = 0, this.output = null, this.outpos = 0, this.lengths = new Array;
        for (var i = 0; 19 > i;) {
            {
                i++
            }
            this.lengths.push(-1)
        }
        this.window = new S.zip._InflateImpl.Window(s)
    }, i["haxe.zip.InflateImpl"] = S.zip.InflateImpl, S.zip.InflateImpl.__name__ = !0, S.zip.InflateImpl.run = function(t, e) {
        null == e && (e = 65536);
        for (var s = S.io.Bytes.alloc(e), i = new S.io.BytesBuffer, n = new S.zip.InflateImpl(t);;) {
            var o = n.readBytes(s, 0, e);
            if (i.addBytes(s, 0, o), e > o) break
        }
        return i.getBytes()
    }, S.zip.InflateImpl.prototype = {
        buildFixedHuffman: function() {
            if (null != S.zip.InflateImpl.FIXED_HUFFMAN) return S.zip.InflateImpl.FIXED_HUFFMAN;
            for (var t = new Array, e = 0; 288 > e;) {
                var s = e++;
                t.push(143 >= s ? 8 : 255 >= s ? 9 : 279 >= s ? 7 : 8)
            }
            return S.zip.InflateImpl.FIXED_HUFFMAN = this.htools.make(t, 0, 288, 10), S.zip.InflateImpl.FIXED_HUFFMAN
        },
        readBytes: function(t, e, s) {
            if (this.needed = s, this.outpos = e, this.output = t, s > 0)
                for (; this.inflateLoop(););
            return s - this.needed
        },
        getBits: function(t) {
            for (; this.nbits < t;) this.bits |= this.input.readByte() << this.nbits, this.nbits += 8;
            var e = this.bits & (1 << t) - 1;
            return this.nbits -= t, this.bits >>= t, e
        },
        getBit: function() {
            0 == this.nbits && (this.nbits = 8, this.bits = this.input.readByte());
            var t = 1 == (1 & this.bits);
            return this.nbits--, this.bits >>= 1, t
        },
        getRevBits: function(t) {
            return 0 == t ? 0 : this.getBit() ? 1 << t - 1 | this.getRevBits(t - 1) : this.getRevBits(t - 1)
        },
        resetBits: function() {
            this.bits = 0, this.nbits = 0
        },
        addBytes: function(t, e, s) {
            this.window.addBytes(t, e, s), this.output.blit(this.outpos, t, e, s), this.needed -= s, this.outpos += s
        },
        addByte: function(t) {
            this.window.addByte(t), this.output.b[this.outpos] = 255 & t, this.needed--, this.outpos++
        },
        addDistOne: function(t) {
            for (var e = this.window.getLastChar(), s = 0; t > s;) {
                {
                    s++
                }
                this.addByte(e)
            }
        },
        addDist: function(t, e) {
            this.addBytes(this.window.buffer, this.window.pos - t, e)
        },
        applyHuffman: function(t) {
            switch (t[1]) {
                case 0:
                    var e = t[2];
                    return e;
                case 1:
                    var s = t[3],
                        i = t[2];
                    return this.applyHuffman(this.getBit() ? s : i);
                case 2:
                    var n = t[3],
                        o = t[2];
                    return this.applyHuffman(n[this.getBits(o)])
            }
        },
        inflateLengths: function(t, e) {
            for (var s = 0, i = 0; e > s;) {
                var n = this.applyHuffman(this.huffman);
                switch (n) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                        i = n, t[s] = n, s++;
                        break;
                    case 16:
                        var o = s + 3 + this.getBits(2);
                        if (o > e) throw "Invalid data";
                        for (; o > s;) t[s] = i, s++;
                        break;
                    case 17:
                        if (s += 3 + this.getBits(3), s > e) throw "Invalid data";
                        break;
                    case 18:
                        if (s += 11 + this.getBits(7), s > e) throw "Invalid data";
                        break;
                    default:
                        throw "Invalid data"
                }
            }
        },
        inflateLoop: function() {
            var t = this.state;
            switch (t[1]) {
                case 0:
                    var e = this.input.readByte(),
                        s = 15 & e,
                        i = e >> 4;
                    if (8 != s || 7 != i) throw "Invalid data";
                    var n = this.input.readByte(),
                        o = 0 != (32 & n);
                    if (((e << 8) + n) % 31 != 0) throw "Invalid data";
                    if (o) throw "Unsupported dictionary";
                    return this.state = S.zip._InflateImpl.State.Block, !0;
                case 4:
                    var r = this.window.checksum();
                    if (null == r) return this.state = S.zip._InflateImpl.State.Done, !0;
                    var a = S.crypto.Adler32.read(this.input);
                    if (!r.equals(a)) throw "Invalid CRC";
                    return this.state = S.zip._InflateImpl.State.Done, !0;
                case 7:
                    return !1;
                case 1:
                    this["final"] = this.getBit();
                    var l = this.getBits(2);
                    switch (l) {
                        case 0:
                            this.len = this.input.readUInt16();
                            var h = this.input.readUInt16();
                            if (h != 65535 - this.len) throw "Invalid data";
                            this.state = S.zip._InflateImpl.State.Flat;
                            var c = this.inflateLoop();
                            return this.resetBits(), c;
                        case 1:
                            return this.huffman = this.buildFixedHuffman(), this.huffdist = null, this.state = S.zip._InflateImpl.State.CData, !0;
                        case 2:
                            for (var _ = this.getBits(5) + 257, m = this.getBits(5) + 1, u = this.getBits(4) + 4, d = 0; u > d;) {
                                var p = d++;
                                this.lengths[S.zip.InflateImpl.CODE_LENGTHS_POS[p]] = this.getBits(3)
                            }
                            for (var y = u; 19 > y;) {
                                var f = y++;
                                this.lengths[S.zip.InflateImpl.CODE_LENGTHS_POS[f]] = 0
                            }
                            this.huffman = this.htools.make(this.lengths, 0, 19, 8);
                            for (var g = new Array, v = 0, x = _ + m; x > v;) {
                                {
                                    v++
                                }
                                g.push(0)
                            }
                            return this.inflateLengths(g, _ + m), this.huffdist = this.htools.make(g, _, m, 16), this.huffman = this.htools.make(g, 0, _, 16), this.state = S.zip._InflateImpl.State.CData, !0;
                        default:
                            throw "Invalid data"
                    }
                    break;
                case 3:
                    var w;
                    w = this.len < this.needed ? this.len : this.needed;
                    var b = this.input.read(w);
                    return this.len -= w, this.addBytes(b, 0, w), 0 == this.len && (this.state = this["final"] ? S.zip._InflateImpl.State.Crc : S.zip._InflateImpl.State.Block), this.needed > 0;
                case 6:
                    var B;
                    return B = this.len < this.needed ? this.len : this.needed, this.addDistOne(B), this.len -= B, 0 == this.len && (this.state = S.zip._InflateImpl.State.CData), this.needed > 0;
                case 5:
                    for (; this.len > 0 && this.needed > 0;) {
                        var A;
                        A = this.len < this.dist ? this.len : this.dist;
                        var C;
                        C = this.needed < A ? this.needed : A, this.addDist(this.dist, C), this.len -= C
                    }
                    return 0 == this.len && (this.state = S.zip._InflateImpl.State.CData), this.needed > 0;
                case 2:
                    var I = this.applyHuffman(this.huffman);
                    if (256 > I) return this.addByte(I), this.needed > 0;
                    if (256 == I) return this.state = this["final"] ? S.zip._InflateImpl.State.Crc : S.zip._InflateImpl.State.Block, !0;
                    I -= 257;
                    var k = S.zip.InflateImpl.LEN_EXTRA_BITS_TBL[I];
                    if (-1 == k) throw "Invalid data";
                    this.len = S.zip.InflateImpl.LEN_BASE_VAL_TBL[I] + this.getBits(k);
                    var M;
                    if (M = null == this.huffdist ? this.getRevBits(5) : this.applyHuffman(this.huffdist), k = S.zip.InflateImpl.DIST_EXTRA_BITS_TBL[M], -1 == k) throw "Invalid data";
                    if (this.dist = S.zip.InflateImpl.DIST_BASE_VAL_TBL[M] + this.getBits(k), this.dist > this.window.available()) throw "Invalid data";
                    return this.state = 1 == this.dist ? S.zip._InflateImpl.State.DistOne : S.zip._InflateImpl.State.Dist, !0
            }
        },
        __class__: S.zip.InflateImpl
    }, S.zip.Uncompress = function() {}, i["haxe.zip.Uncompress"] = S.zip.Uncompress, S.zip.Uncompress.__name__ = !0, S.zip.Uncompress.run = function(t, e) {
        return S.zip.InflateImpl.run(new S.io.BytesInput(t), e)
    };
    var A = {};
    A.Boot = function() {}, i["js.Boot"] = A.Boot, A.Boot.__name__ = !0, A.Boot.__unhtml = function(t) {
        return t.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;")
    }, A.Boot.__trace = function(t, e) {
        var s;
        if (s = null != e ? e.fileName + ":" + e.lineNumber + ": " : "", s += A.Boot.__string_rec(t, ""), null != e && null != e.customParams)
            for (var i = 0, n = e.customParams; i < n.length;) {
                var o = n[i];
                ++i, s += "," + A.Boot.__string_rec(o, "")
            }
        var r;
        "undefined" != typeof document && null != (r = document.getElementById("haxe:trace")) ? r.innerHTML += A.Boot.__unhtml(s) + "<br/>" : "undefined" != typeof console && null != console.log && console.log(s)
    }, A.Boot.__string_rec = function(t, e) {
        if (null == t) return "null";
        if (e.length >= 5) return "<...>";
        var s = typeof t;
        switch ("function" == s && (t.__name__ || t.__ename__) && (s = "object"), s) {
            case "object":
                if (t instanceof Array) {
                    if (t.__enum__) {
                        if (2 == t.length) return t[0];
                        var i = t[0] + "(";
                        e += "	";
                        for (var n = 2, o = t.length; o > n;) {
                            var r = n++;
                            i += 2 != r ? "," + A.Boot.__string_rec(t[r], e) : A.Boot.__string_rec(t[r], e)
                        }
                        return i + ")"
                    }
                    var a = t.length,
                        l = "[";
                    e += "	";
                    for (var h = 0; a > h;) {
                        var c = h++;
                        l += (c > 0 ? "," : "") + A.Boot.__string_rec(t[c], e)
                    }
                    return l += "]"
                }
                var _;
                try {
                    _ = t.toString
                } catch (m) {
                    return "???"
                }
                if (null != _ && _ != Object.toString) {
                    var u = t.toString();
                    if ("[object Object]" != u) return u
                }
                var d = null,
                    p = "{\n";
                e += "	";
                var y = null != t.hasOwnProperty;
                for (var d in t)(!y || t.hasOwnProperty(d)) && "prototype" != d && "__class__" != d && "__super__" != d && "__interfaces__" != d && "__properties__" != d && (2 != p.length && (p += ", \n"), p += e + d + " : " + A.Boot.__string_rec(t[d], e));
                return e = e.substring(1), p += "\n" + e + "}";
            case "function":
                return "<function>";
            case "string":
                return t;
            default:
                return String(t)
        }
    }, A.Boot.__interfLoop = function(t, e) {
        if (null == t) return !1;
        if (t == e) return !0;
        var s = t.__interfaces__;
        if (null != s)
            for (var i = 0, n = s.length; n > i;) {
                var o = i++,
                    r = s[o];
                if (r == e || A.Boot.__interfLoop(r, e)) return !0
            }
        return A.Boot.__interfLoop(t.__super__, e)
    }, A.Boot.__instanceof = function(t, e) {
        if (null == e) return !1;
        switch (e) {
            case V:
                return (0 | t) === t;
            case T:
                return "number" == typeof t;
            case P:
                return "boolean" == typeof t;
            case String:
                return "string" == typeof t;
            case Array:
                return t instanceof Array && null == t.__enum__;
            case z:
                return !0;
            default:
                if (null == t) return !1;
                if ("function" == typeof e) {
                    if (t instanceof e) return !0;
                    if (A.Boot.__interfLoop(t instanceof Array && null == t.__enum__ ? Array : t.__class__, e)) return !0
                }
                return e == D && null != t.__name__ ? !0 : e == L && null != t.__ename__ ? !0 : t.__enum__ == e
        }
    }, A.Boot.__cast = function(t, e) {
        if (A.Boot.__instanceof(t, e)) return t;
        throw "Cannot cast " + w.string(t) + " to " + w.string(e)
    }, A.html = {}, A.html._CanvasElement = {}, A.html._CanvasElement.CanvasUtil = function() {}, i["js.html._CanvasElement.CanvasUtil"] = A.html._CanvasElement.CanvasUtil, A.html._CanvasElement.CanvasUtil.__name__ = !0, A.html._CanvasElement.CanvasUtil.getContextWebGL = function(t, e) {
        for (var s = 0, i = ["webgl", "experimental-webgl"]; s < i.length;) {
            var n = i[s];
            ++s;
            // CHANGE: needed to render the image into a canvas.
            e['preserveDrawingBuffer'] = true;
            var o = t.getContext(n, e);
            if (null != o) return o
        }
        return null
    }, o.Audio = function(t) {
        this.core = t
    }, i["luxe.Audio"] = o.Audio, o.Audio.__name__ = !0, o.Audio.prototype = {
        init: function() {},
        destroy: function() {},
        create: function(t, e, s) {
            return null == s && (s = !1), null == e && (e = ""), this.core.app.audio.create(t, e, s)
        },
        create_from_bytes: function(t, e, s) {
            return null == t && (t = ""), this.core.app.audio.create_from_bytes(t, e, s)
        },
        on: function(t, e, s) {
            return this.core.app.audio.on(t, e, s)
        },
        get: function(t) {
            return this.core.app.audio.get(t)
        },
        exists: function(t) {
            return null != this.get(t)
        },
        loop: function(t) {
            return this.core.app.audio.loop(t)
        },
        play: function(t) {
            return this.core.app.audio.play(t)
        },
        volume: function(t, e) {
            return this.core.app.audio.volume(t, e)
        },
        process: function() {},
        __class__: o.Audio
    }, o.SizeMode = i["luxe.SizeMode"] = {
        __ename__: !0,
        __constructs__: ["fit", "cover", "contain"]
    }, o.SizeMode.fit = ["fit", 0], o.SizeMode.fit.toString = n, o.SizeMode.fit.__enum__ = o.SizeMode, o.SizeMode.cover = ["cover", 1], o.SizeMode.cover.toString = n, o.SizeMode.cover.__enum__ = o.SizeMode, o.SizeMode.contain = ["contain", 2], o.SizeMode.contain.toString = n, o.SizeMode.contain.__enum__ = o.SizeMode, o.Objects = function(t, e) {
        null == e && (e = ""), null == t && (t = ""), this.name = "", this.id = "", o.Emitter.call(this), this.set_name(t), this.set_id("" == e ? m.utils.uniqueid(null) : e)
    }, i["luxe.Objects"] = o.Objects, o.Objects.__name__ = !0, o.Objects.__super__ = o.Emitter, o.Objects.prototype = t(o.Emitter.prototype, {
        set_name: function(t) {
            return this.name = t
        },
        set_id: function(t) {
            return this.id = t
        },
        get_name: function() {
            return this.name
        },
        get_id: function() {
            return this.id
        },
        __class__: o.Objects,
        __properties__: {
            set_name: "set_name",
            get_name: "get_name",
            set_id: "set_id",
            get_id: "get_id"
        }
    }), o.Entity = function(t) {
        this.component_count = 0, this.active = !0, this.fixed_rate = 0, this.started = !1, this.inited = !1, this.destroyed = !1, o.Objects.call(this, "entity");
        var e = this;
        if (e.set_name(e.get_name() + ("." + this.get_id())), this.options = t, this._components = new o.components.Components(this), this.children = new Array, this.events = new o.Events, this.set_transform(null != this.options && null != this.options.transform ? this.options.transform : new I.Transform), this.get_transform().listen_pos(s(this, this.set_pos_from_transform)), this.get_transform().listen_scale(s(this, this.set_scale_from_transform)), this.get_transform().listen_origin(s(this, this.set_origin_from_transform)), this.get_transform().listen_parent(s(this, this.set_parent_from_transform)), this.get_transform().listen_rotation(s(this, this.set_rotation_from_transform)), null != this.options) {
            if (null == this.options.name_unique && (this.options.name_unique = !1), this.options.name_unique, null != this.options.name && (this.set_name(this.options.name), this.options.name_unique)) {
                var i = this;
                i.set_name(i.get_name() + ("." + this.get_id()))
            }
            if (null != this.options.pos) {
                var n = this.options.pos;
                this.set_pos(new I.Vector(n.x, n.y, n.z, n.w))
            }
            if (null != this.options.scale) {
                var r = this.options.scale;
                this.set_scale(new I.Vector(r.x, r.y, r.z, r.w))
            }
            var a = !0;
            null != this.options.no_scene && 1 == this.options.no_scene && (a = !1), null != this.options.parent && (a = !1, this.set_parent(this.options.parent)), a && this.set_scene(null != this.options.scene ? this.options.scene : m.scene)
        } else this.set_scene(m.scene);
        null != this.get_scene() && this.get_scene().add(this)
    }, i["luxe.Entity"] = o.Entity, o.Entity.__name__ = !0, o.Entity.__super__ = o.Objects, o.Entity.prototype = t(o.Objects.prototype, {
        init: function() {},
        update: function() {},
        onfixedupdate: function() {},
        onreset: function() {},
        ondestroy: function() {},
        onkeyup: function() {},
        onkeydown: function() {},
        ontextinput: function() {},
        oninputdown: function() {},
        oninputup: function() {},
        onmousedown: function() {},
        onmouseup: function() {},
        onmousemove: function() {},
        onmousewheel: function() {},
        ontouchdown: function() {},
        ontouchup: function() {},
        ontouchmove: function() {},
        ongamepadup: function() {},
        ongamepaddown: function() {},
        ongamepadaxis: function() {},
        ongamepaddevice: function() {},
        onwindowmoved: function() {},
        onwindowresized: function() {},
        onwindowsized: function() {},
        onwindowminimized: function() {},
        onwindowrestored: function() {},
        add: function(t) {
            return this.component_count++, this._components.add(t)
        },
        _init: function() {
            if (this.init(), this.emit(2), this.component_count > 0)
                for (var t = 0, e = this._components.components; t < e._keys.length;) {
                    var s = e.get(e._keys[t++]);
                    s.init()
                }
            if (this.children.length > 0)
                for (var i = 0, n = this.children; i < n.length;) {
                    var o = n[i];
                    ++i, o._init()
                }
            this.inited = !0
        },
        _reset: function(t) {
            if (this.onreset(), this.emit(3), this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.onreset()
                }
            if (this.children.length > 0)
                for (var n = 0, o = this.children; n < o.length;) {
                    var r = o[n];
                    ++n, r._reset(t)
                }
            this._set_fixed_rate_timer(this.fixed_rate), this.started = !0
        },
        destroy: function(t) {
            if (null == t && (t = !1), this.children.length > 0)
                for (var e = 0, s = this.children; e < s.length;) {
                    var i = s[e];
                    ++e, i.destroy(!0)
                }
            if (this.children = null, this.children = [], this.component_count > 0)
                for (var n = 0, o = this._components.components; n < o._keys.length;) {
                    var r = o.get(o._keys[n++]);
                    r.onremoved(), r.ondestroy()
                }
            this.emit(6), this.ondestroy(), null == this.get_parent() || t || this.get_parent()._remove_child(this), null != this.fixed_rate_timer && (this.fixed_rate_timer.stop(), this.fixed_rate_timer = null), this.destroyed = !0, this.inited = !1, this.started = !1, null != this.get_scene() && this.get_scene().remove(this), null != this.events && (this.events.destroy(), this.events = null)
        },
        _update: function(t) {
            if (!this.destroyed && this.get_active() && this.inited && this.started) {
                if (this.get_transform().clean_check(), this.update(t), null != this.events && this.events.process(), this.component_count > 0)
                    for (var e = 0, s = this._components.components; e < s._keys.length;) {
                        var i = s.get(s._keys[e++]);
                        i.update(t)
                    }
                if (this.children.length > 0)
                    for (var n = 0, o = this.children; n < o.length;) {
                        var r = o[n];
                        ++n, r._update(t)
                    }
            }
        },
        _fixed_update: function() {
            if (!this.destroyed && this.get_active() && this.inited && this.started) {
                if (this.emit(5), this.onfixedupdate(this.fixed_rate), this.component_count > 0)
                    for (var t = 0, e = this._components.components; t < e._keys.length;) {
                        var s = e.get(e._keys[t++]);
                        s.onfixedupdate(this.fixed_rate)
                    }
                if (this.children.length > 0)
                    for (var i = 0, n = this.children; i < n.length;) {
                        var o = n[i];
                        ++i, o._fixed_update()
                    }
            }
        },
        _detach_scene: function() {
            null != this.get_scene() && (this.get_scene().off(3, s(this, this._reset)), this.get_scene().off(6, s(this, this.destroy)), this.get_scene().off(11, s(this, this._keyup)), this.get_scene().off(10, s(this, this._keydown)), this.get_scene().off(12, s(this, this._textinput)), this.get_scene().off(15, s(this, this._mousedown)), this.get_scene().off(16, s(this, this._mouseup)), this.get_scene().off(17, s(this, this._mousemove)), this.get_scene().off(18, s(this, this._mousewheel)), this.get_scene().off(19, s(this, this._touchdown)), this.get_scene().off(20, s(this, this._touchup)), this.get_scene().off(21, s(this, this._touchmove)), this.get_scene().off(14, s(this, this._inputup)), this.get_scene().off(13, s(this, this._inputdown)), this.get_scene().off(23, s(this, this._gamepaddown)), this.get_scene().off(24, s(this, this._gamepadup)), this.get_scene().off(22, s(this, this._gamepadaxis)), this.get_scene().off(25, s(this, this._gamepaddevice)), this.get_scene().off(27, s(this, this._windowmoved)), this.get_scene().off(28, s(this, this._windowresized)), this.get_scene().off(29, s(this, this._windowsized)), this.get_scene().off(30, s(this, this._windowminimized)), this.get_scene().off(31, s(this, this._windowrestored)))
        },
        _attach_scene: function() {
            null != this.get_scene() && (this.get_scene().on(3, s(this, this._reset)), this.get_scene().on(6, s(this, this.destroy)))
        },
        _keyup: function(t) {
            this.get_active() && this.inited && this.started && (this.onkeyup(t), this.emit(11, t))
        },
        _keydown: function(t) {
            this.get_active() && this.inited && this.started && (this.onkeydown(t), this.emit(10, t))
        },
        _textinput: function(t) {
            this.get_active() && this.inited && this.started && (this.ontextinput(t), this.emit(12, t))
        },
        _mousedown: function(t) {
            this.get_active() && this.inited && this.started && (this.onmousedown(t), this.emit(15, t))
        },
        _mouseup: function(t) {
            this.get_active() && this.inited && this.started && (this.onmouseup(t), this.emit(16, t))
        },
        _mousewheel: function(t) {
            this.get_active() && this.inited && this.started && (this.onmousewheel(t), this.emit(18, t))
        },
        _mousemove: function(t) {
            this.get_active() && this.inited && this.started && (this.onmousemove(t), this.emit(17, t))
        },
        _touchdown: function(t) {
            this.get_active() && this.inited && this.started && (this.ontouchdown(t), this.emit(19, t))
        },
        _touchup: function(t) {
            this.get_active() && this.inited && this.started && (this.ontouchup(t), this.emit(20, t))
        },
        _touchmove: function(t) {
            this.get_active() && this.inited && this.started && (this.ontouchmove(t), this.emit(21, t))
        },
        _gamepadaxis: function(t) {
            this.get_active() && this.inited && this.started && (this.ongamepadaxis(t), this.emit(22, t))
        },
        _gamepaddown: function(t) {
            this.get_active() && this.inited && this.started && (this.ongamepaddown(t), this.emit(23, t))
        },
        _gamepadup: function(t) {
            this.get_active() && this.inited && this.started && (this.ongamepadup(t), this.emit(24, t))
        },
        _gamepaddevice: function(t) {
            this.get_active() && this.inited && this.started && (this.ongamepaddevice(t), this.emit(25, t))
        },
        _windowmoved: function(t) {
            this.get_active() && this.inited && this.started && (this.onwindowmoved(t), this.emit(27, t))
        },
        _windowresized: function(t) {
            this.get_active() && this.inited && this.started && (this.onwindowresized(t), this.emit(28, t))
        },
        _windowsized: function(t) {
            this.get_active() && this.inited && this.started && (this.onwindowsized(t), this.emit(29, t))
        },
        _windowminimized: function(t) {
            this.get_active() && this.inited && this.started && (this.onwindowminimized(t), this.emit(30, t))
        },
        _windowrestored: function(t) {
            this.get_active() && this.inited && this.started && (this.onwindowrestored(t), this.emit(31, t))
        },
        _inputdown: function(t) {
            this.get_active() && this.inited && this.started && (this.oninputdown(t.name, t.event), this.emit(13, t))
        },
        _inputup: function(t) {
            this.get_active() && this.inited && this.started && (this.oninputup(t.name, t.event), this.emit(14, t))
        },
        _set_fixed_rate_timer: function(t) {
            null != this.fixed_rate_timer && (this.fixed_rate_timer.stop(), this.fixed_rate_timer = null), 0 == t || null != this.get_parent() || this.destroyed || (this.fixed_rate_timer = new C.api.Timer(t), this.fixed_rate_timer.run = s(this, this._fixed_update))
        },
        _add_child: function(t) {
            if (this.children.push(t), null != t.get_scene()) {
                t.get_scene().remove(t)
            }
        },
        _remove_child: function(t) {
            h.remove(this.children, t)
        },
        set_pos_from_transform: function(t) {
            if (this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.entity_pos_change(t)
                }
        },
        set_rotation_from_transform: function(t) {
            if (this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.entity_rotation_change(t)
                }
        },
        set_scale_from_transform: function(t) {
            if (this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.entity_scale_change(t)
                }
        },
        set_origin_from_transform: function(t) {
            if (this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.entity_origin_change(t)
                }
        },
        set_parent_from_transform: function(t) {
            if (this.component_count > 0)
                for (var e = 0, s = this._components.components; e < s._keys.length;) {
                    var i = s.get(s._keys[e++]);
                    i.entity_parent_change(t)
                }
        },
        set_pos: function(t) {
            return this.get_transform().set_pos(t)
        },
        get_pos: function() {
            return this.get_transform().get_pos()
        },
        set_rotation: function(t) {
            return this.get_transform().set_rotation(t)
        },
        set_scale: function(t) {
            return this.get_transform().set_scale(t)
        },
        set_origin: function(t) {
            return this.get_transform().set_origin(t)
        },
        set_transform: function(t) {
            return this.transform = t
        },
        get_transform: function() {
            return this.transform
        },
        set_parent: function(t) {
            if (t == this) throw o.DebugError.assertion("other != this (Entity setting itself as parent makes no sense)");
            return null != this.get_parent() && this.get_parent()._remove_child(this), this.parent = t, null != this.get_parent() ? (this.get_parent()._add_child(this), this.get_transform().set_parent(this.get_parent().get_transform())) : this.get_transform().set_parent(null), this.get_parent()
        },
        get_parent: function() {
            return this.parent
        },
        set_scene: function(t) {
            return this._detach_scene(), this.scene = t, this._attach_scene(), this.get_scene()
        },
        get_scene: function() {
            return this.scene
        },
        set_name: function(t) {
            if (null == t) throw o.DebugError.null_assertion("_name was null");
            var e = this.get_scene();
            if (null != e) {
                var s = this.get_name();
                e.entities.remove(s), e.entities.set(t, this), e.entities.exists(t), e._has_changed = !0
            }
            return this.name = t
        },
        get_active: function() {
            return this.active
        },
        __class__: o.Entity,
        __properties__: t(o.Objects.prototype.__properties__, {
            set_origin: "set_origin",
            set_scale: "set_scale",
            set_rotation: "set_rotation",
            get_pos: "get_pos",
            set_pos: "set_pos",
            set_transform: "set_transform",
            get_transform: "get_transform",
            get_active: "get_active",
            set_scene: "set_scene",
            get_scene: "get_scene",
            set_parent: "set_parent",
            get_parent: "get_parent"
        })
    }), o.Camera = function(t) {
        this._connected = !1, this.minimum_shake = .1, this.shaking = !1, this._size_factor = new I.Vector, this._rotation_radian = new I.Vector, this._rotation_cache = new I.Quaternion, this.set_size_mode(o.SizeMode.fit);
        var e = "untitled camera";
        null != t ? null != t.name && (e = t.name) : t = {
            no_scene: !1
        }, null == t.view && (t.view = new I.Camera(t)), this.view = t.view, o.Entity.call(this, {
            name: e,
            no_scene: t.no_scene
        }), this._final_pos = this.view.get_pos()
    }, i["luxe.Camera"] = o.Camera, o.Camera.__name__ = !0, o.Camera.__super__ = o.Entity, o.Camera.prototype = t(o.Entity.prototype, {
        get_viewport: function() {
            return this.view.get_viewport()
        },
        set_viewport: function(t) {
            return this.view.set_viewport(t)
        },
        set_center: function(t) {
            return this.set_pos(new I.Vector(t.x - this.get_viewport().w / 2, t.y - this.get_viewport().h / 2)), this.view.set_center(t)
        },
        get_zoom: function() {
            return this.view.zoom
        },
        set_zoom: function(t) {
            if (this.view.set_zoom(t), null != this.get_size()) {
                var e = this.view.get_scale();
                e.set_x(e.x * (1 / this._size_factor.x));
                var s = this.view.get_scale();
                s.set_y(s.y * (1 / this._size_factor.y))
            }
            return this.view.zoom
        },
        get_size: function() {
            return this.size
        },
        get_size_mode: function() {
            return this.size_mode
        },
        set_size_mode: function(t) {
            return null != this.get_size_mode() && (this.size_mode = t, null != this.get_size() && this.set_size(this.get_size())), this.size_mode = t
        },
        _onwindowsized: function(t) {
            null != this.get_size() && (this.set_viewport(new I.Rectangle(this.get_viewport().x, this.get_viewport().y, t.event.x, t.event.y)), this.set_size(this.get_size()))
        },
        set_size: function(t) {
            if (null == t) return this.set_center(new I.Vector(this.get_viewport().w / 2, this.get_viewport().h / 2)), this.size = t, this._size_factor.set_x(this._size_factor.set_y(1)), this.set_zoom(this.get_zoom()), this._connected = !1, m.off(29, s(this, this._onwindowsized)), this.get_size();
            this._connected || (m.on(29, s(this, this._onwindowsized)), this._connected = !0);
            var e = this.get_viewport().w / t.x,
                i = this.get_viewport().h / t.y,
                n = Math.max(e, i),
                o = Math.min(e, i),
                r = this.get_size_mode();
            switch (r[1]) {
                case 0:
                    e = i = o;
                    break;
                case 1:
                    e = i = n;
                    break;
                case 2:
            }
            return this._size_factor.set_x(e), this._size_factor.set_y(i), this.view.get_scale().set_x(1 / (this._size_factor.x * this.get_zoom())), this.view.get_scale().set_y(1 / (this._size_factor.y * this.get_zoom())), this.set_center(new I.Vector(t.x / 2, t.y / 2)), this.size = new I.Vector(t.x, t.y, t.z, t.w)
        },
        set_pos_from_transform: function(t) {
            var e = this.view.get_viewport().w,
                s = this.view.get_viewport().h,
                i = e / 2,
                n = s / 2,
                r = t.x,
                a = t.y;
            null != this.bounds && (r < this.bounds.x && (r = this.bounds.x), a < this.bounds.y && (a = this.bounds.y), r + i > this.bounds.w - e && (r = this.bounds.w - e - i), a + n > this.bounds.h - s && (a = this.bounds.h - s - n));
            var l = t.ignore_listeners;
            t.ignore_listeners = !0, t.set_xy(r, a), t.ignore_listeners = l, o.Entity.prototype.set_pos_from_transform.call(this, t), this.update_view_pos = t
        },
        set_rotation_from_transform: function(t) {
            o.Entity.prototype.set_rotation_from_transform.call(this, t), null != this.view && this.view.set_rotation(t)
        },
        set_scale_from_transform: function(t) {
            o.Entity.prototype.set_scale_from_transform.call(this, t), null != this.view && this.view.set_scale(t)
        },
        update: function() {
            if (this.shaking) {
                this._final_pos.set_xyz(this.get_transform().get_pos().x, this.get_transform().get_pos().y, this.get_transform().get_pos().z), this.shake_vector = m.utils.geometry.random_point_in_unit_circle();
                var t = this.shake_vector;
                t.set_x(t.x * this.shake_amount);
                var e = this.shake_vector;
                e.set_y(e.y * this.shake_amount);
                var s = this.shake_vector;
                s.set_z(s.z * this.shake_amount), this.shake_amount *= .9, this.shake_amount <= this.minimum_shake && (this.shake_amount = 0, this.shaking = !1), this._final_pos.set_xyz(this._final_pos.x + this.shake_vector.x, this._final_pos.y + this.shake_vector.y, this._final_pos.z + this.shake_vector.z), this.update_view_pos = this._final_pos
            }
            null != this.update_view_pos && null != this.view && (this.view.set_pos(this.update_view_pos.clone()), this.update_view_pos = null)
        },
        init: function() {
            o.Entity.prototype.init.call(this)
        },
        ondestroy: function() {
            o.Entity.prototype.ondestroy.call(this)
        },
        __class__: o.Camera,
        __properties__: t(o.Entity.prototype.__properties__, {
            set_zoom: "set_zoom",
            get_zoom: "get_zoom",
            set_center: "set_center",
            set_viewport: "set_viewport",
            get_viewport: "get_viewport",
            set_size_mode: "set_size_mode",
            get_size_mode: "get_size_mode",
            set_size: "set_size",
            get_size: "get_size"
        })
    });
    var C = {};
    C.App = function() {
        this.next_render = 0, this.next_tick = 0, this.alpha = 1, this.cur_frame_start = 0, this.current_time = 0, this.last_frame_start = 0, this.delta_sim = .016666666666666666, this.delta_time = .016666666666666666, this.max_frame_time = .25, this.update_rate = 0, this.render_rate = -1, this.fixed_delta = 0, this.timescale = 1
    }, i["snow.App"] = C.App, C.App.__name__ = !0, C.App.prototype = {
        config: function(t) {
            return t
        },
        ready: function() {},
        update: function() {},
        ondestroy: function() {},
        onevent: function() {},
        onkeydown: function() {},
        onkeyup: function() {},
        ontextinput: function() {},
        onmousedown: function() {},
        onmouseup: function() {},
        onmousewheel: function() {},
        onmousemove: function() {},
        ontouchdown: function() {},
        ontouchup: function() {},
        ontouchmove: function() {},
        ongamepadaxis: function() {},
        ongamepaddown: function() {},
        ongamepadup: function() {},
        ongamepaddevice: function() {},
        on_internal_init: function() {
            this.cur_frame_start = C.Snow.core.timestamp(), this.last_frame_start = this.cur_frame_start, this.current_time = 0, this.delta_time = .016
        },
        on_internal_update: function() {
            if (0 != this.update_rate) {
                if (C.Snow.core.timestamp() < this.next_tick) return;
                this.next_tick = C.Snow.core.timestamp() + this.update_rate
            }
            this.cur_frame_start = C.Snow.core.timestamp(), this.delta_time = this.cur_frame_start - this.last_frame_start, this.last_frame_start = this.cur_frame_start, this.delta_time > this.max_frame_time && (this.delta_time = this.max_frame_time);
            var t;
            t = 0 == this.fixed_delta ? this.delta_time : this.fixed_delta, t *= this.timescale, this.delta_sim = t, this.current_time += t, this.app.do_internal_update(t)
        },
        on_internal_render: function() {
            0 != this.render_rate && (this.render_rate < 0 || this.next_render < C.Snow.core.timestamp()) && (this.app.render(), this.next_render += this.render_rate)
        },
        __class__: C.App
    }, C.AppFixedTimestep = function() {
        this.overflow = 0, this.frame_time = .0167, C.App.call(this)
    }, i["snow.AppFixedTimestep"] = C.AppFixedTimestep, C.AppFixedTimestep.__name__ = !0, C.AppFixedTimestep.__super__ = C.App, C.AppFixedTimestep.prototype = t(C.App.prototype, {
        on_internal_init: function() {
            C.App.prototype.on_internal_init.call(this), this.frame_time = .016666666666666666, this.last_frame_start = C.Snow.core.timestamp()
        },
        on_internal_update: function() {
            for (this.cur_frame_start = C.Snow.core.timestamp(), this.delta_time = this.cur_frame_start - this.last_frame_start, this.delta_sim = this.delta_time * this.timescale, this.delta_sim > this.max_frame_time && (this.delta_sim = this.max_frame_time), this.last_frame_start = this.cur_frame_start, this.overflow += this.delta_sim; this.overflow >= this.frame_time;) this.app.do_internal_update(this.frame_time * this.timescale), this.current_time += this.frame_time * this.timescale, this.overflow -= this.frame_time * this.timescale;
            this.alpha = this.overflow / this.frame_time
        },
        __class__: C.AppFixedTimestep
    }), o.Core = function(t, e) {
        this.inited = !1, this.has_shutdown = !1, this.shutting_down = !1, this.headless = !1, this.console_visible = !1, C.AppFixedTimestep.call(this), this.init_config = e, this.game = t, this.game.app = this, this.emitter = new o.Emitter, m.core = this, m.utils = new o.utils.Utils(this)
    }, i["luxe.Core"] = o.Core, o.Core.__name__ = !0, o.Core.__super__ = C.AppFixedTimestep, o.Core.prototype = t(C.AppFixedTimestep.prototype, {
        ready: function() {
            m.version = S.Resource.getString("version"), m.build = m.version + S.Resource.getString("build"), this.headless = null == this.app.window, this.init(null)
        },
        ondestroy: function() {
            this.shutting_down = !0, this.game.ondestroy(), this.emitter.emit(6), null != this.renderer && this.renderer.destroy(), this.physics.destroy(), this.input.destroy(), this.audio.destroy(), this.timer.destroy(), this.events.destroy(), this.debug.destroy(), this.emitter = null, this.input = null, this.audio = null, this.events = null, this.timer = null, this.debug = null, m.utils = null, this.has_shutdown = !0
        },
        init: function(t) {
            m.debug = this.debug = new o.Debug(this), m.io = this.io = new o.IO(this), this.draw = new o.Draw(this), this.timer = new o.Timer(this), this.events = new o.Events, this.audio = new o.Audio(this), this.input = new o.Input(this), this.physics = new o.Physics(this), this.resources = new o.Resources, m.resources = this.resources, this.headless || (this.app.window.onevent = s(this, this.window_event), this.renderer = new I.Renderer(this, t), m.renderer = this.renderer);
            var e = 0,
                i = 0;
            null != this.app.window && (e = this.app.window.width, i = this.app.window.height), this.screen = new o.Screen(this, e, i), this.debug.init(), this.io.init(), this.timer.init(), this.audio.init(), this.input.init(), this.headless || this.renderer.init(), this.physics.init(), m.audio = this.audio, m.draw = this.draw, m.events = this.events, m.timer = this.timer, m.input = this.input, this.headless || (m.camera = new o.Camera({
                name: "default camera",
                view: this.renderer.camera
            })), m.physics = this.physics, this.scene = new o.Scene("default scene"), m.scene = this.scene, this.headless || (this.scene.add(m.camera), this.debug.create_debug_console()), this.internal_pre_ready()
        },
        internal_pre_ready: function() {
            if (this.headless) this.internal_ready(null);
            else {
                var t = new o.Parcel({
                    id: "default_parcel",
                    system: this.resources,
                    bytes: this.appconfig.preload.bytes,
                    texts: this.appconfig.preload.texts,
                    jsons: this.appconfig.preload.jsons,
                    textures: this.appconfig.preload.textures,
                    fonts: this.appconfig.preload.fonts,
                    shaders: this.appconfig.preload.shaders,
                    sounds: this.appconfig.preload.sounds,
                    oncomplete: s(this, this.internal_ready),
                    onfailed: function(t) {
                        throw C.types.Error.error(t)
                    }
                });
                t.load()
            }
        },
        internal_ready: function() {
            null == this.app.window || this.headless || (this.app.window.onrender = s(this, this.render), this.debug.start(o.Tag.update, 50), this.debug.start(o.Tag.renderdt, 50)), this.game.ready(), this.shutting_down || (this.emitter.emit(2), this.inited = !0, this.physics.reset(), this.app.snow_config.has_loop || this.shutdown())
        },
        shutdown: function() {
            this.shutting_down = !0, C.Snow.next((k = this.app, s(k, k.shutdown)))
        },
        on: function(t, e) {
            this.emitter.on(t, e)
        },
        off: function(t, e) {
            return this.emitter.off(t, e)
        },
        emit: function(t, e) {
            return this.emitter.emit(t, e)
        },
        onevent: function(t) {
            this.inited && this.game.onevent(t)
        },
        update: function(t) {
            this.has_shutdown || this.inited && (this.debug.end(o.Tag.update), this.debug.start(o.Tag.update), this.timer.process(), this.input.process(), this.audio.process(), this.events.process(), this.physics.process(), this.debug.start(o.Tag.updates), this.emitter.emit(4, t), this.debug.end(o.Tag.updates), this.debug.start(o.Tag.game_update), this.game.update(t), this.debug.end(o.Tag.game_update), this.debug.process())
        },
        window_event: function(t) {
            if (!this.shutting_down && this.inited) {
                this.emitter.emit(26, t);
                var e = t.type;
                switch (e) {
                    case 5:
                        this.emitter.emit(27, t), this.game.onwindowmoved(t);
                        break;
                    case 6:
                        this.screen.internal_resized(t.event.x, t.event.y), this.renderer.internal_resized(t.event.x, t.event.y), this.emitter.emit(28, t), this.game.onwindowresized(t);
                        break;
                    case 7:
                        this.screen.internal_resized(t.event.x, t.event.y), this.renderer.internal_resized(t.event.x, t.event.y), this.emitter.emit(29, t), this.game.onwindowsized(t);
                        break;
                    case 8:
                        this.emitter.emit(30, t), this.game.onwindowminimized(t);
                        break;
                    case 10:
                        this.emitter.emit(31, t), this.game.onwindowrestored(t)
                }
            }
        },
        render: function() {
            this.shutting_down || this.inited && (this.debug.end(o.Tag.renderdt), this.debug.start(o.Tag.renderdt), this.headless || (this.debug.start(o.Tag.render), this.emitter.emit(7), this.game.onprerender(), this.emitter.emit(8), this.game.onrender(), this.renderer.process(), this.emitter.emit(9), this.game.onpostrender(), this.debug.end(o.Tag.render)))
        },
        show_console: function(t) {
            null == t && (t = !0), this.console_visible = t, this.debug.show_console(this.console_visible)
        },
        onkeydown: function(t, e, s, i, n, r) {
            if (this.inited) {
                var a = {
                    scancode: e,
                    keycode: t,
                    state: o.InteractState.down,
                    mod: i,
                    repeat: s,
                    timestamp: n,
                    window_id: r
                };
                this.shutting_down || (this.input.check_named_keys(a, !0), this.emitter.emit(10, a), this.game.onkeydown(a), e == C.system.input.Scancodes.grave && this.show_console(!this.console_visible))
            }
        },
        onkeyup: function(t, e, s, i, n, r) {
            if (this.inited) {
                var a = {
                    scancode: e,
                    keycode: t,
                    state: o.InteractState.up,
                    mod: i,
                    repeat: s,
                    timestamp: n,
                    window_id: r
                };
                this.shutting_down || (this.input.check_named_keys(a), this.emitter.emit(11, a), this.game.onkeyup(a))
            }
        },
        ontextinput: function(t, e, s, i, n, r) {
            if (this.inited) {
                var a = o.TextEventType.unknown;
                switch (i) {
                    case 1:
                        a = o.TextEventType.edit;
                        break;
                    case 2:
                        a = o.TextEventType.input;
                        break;
                    default:
                        return
                }
                var l = {
                    text: t,
                    start: e,
                    length: s,
                    type: a,
                    timestamp: n,
                    window_id: r
                };
                this.shutting_down || (this.emitter.emit(12, l), this.game.ontextinput(l))
            }
        },
        oninputdown: function(t, e) {
            this.inited && (this.shutting_down || (this.emitter.emit(13, {
                name: t,
                event: e
            }), this.game.oninputdown(t, e)))
        },
        oninputup: function(t, e) {
            this.inited && (this.shutting_down || (this.emitter.emit(14, {
                name: t,
                event: e
            }), this.game.oninputup(t, e)))
        },
        onmousedown: function(t, e, s, i, n) {
            if (this.inited) {
                this.screen.cursor.set_internal(new I.Vector(t, e));
                var r = {
                    timestamp: i,
                    window_id: n,
                    state: o.InteractState.down,
                    button: s,
                    x: t,
                    y: e,
                    xrel: t,
                    yrel: e,
                    pos: this.screen.cursor.get_pos()
                };
                this.shutting_down || (this.input.check_named_mouse(r, !0), this.emitter.emit(15, r), this.game.onmousedown(r))
            }
        },
        onmouseup: function(t, e, s, i, n) {
            if (this.inited) {
                this.screen.cursor.set_internal(new I.Vector(t, e));
                var r = {
                    timestamp: i,
                    window_id: n,
                    state: o.InteractState.up,
                    button: s,
                    x: t,
                    y: e,
                    xrel: t,
                    yrel: e,
                    pos: this.screen.cursor.get_pos()
                };
                this.shutting_down || (this.input.check_named_mouse(r), this.emitter.emit(16, r), this.game.onmouseup(r))
            }
        },
        onmousemove: function(t, e, s, i, n, r) {
            if (this.inited) {
                this.screen.cursor.set_internal(new I.Vector(t, e));
                var a = {
                    timestamp: n,
                    window_id: r,
                    state: o.InteractState.move,
                    button: 0,
                    x: t,
                    y: e,
                    xrel: s,
                    yrel: i,
                    pos: this.screen.cursor.get_pos()
                };
                this.shutting_down || (this.emitter.emit(17, a), this.game.onmousemove(a))
            }
        },
        onmousewheel: function(t, e, s, i) {
            if (this.inited) {
                var n = {
                    timestamp: s,
                    window_id: i,
                    state: o.InteractState.wheel,
                    button: 0,
                    x: t,
                    y: e,
                    xrel: t,
                    yrel: e,
                    pos: this.screen.cursor.get_pos()
                };
                this.shutting_down || (this.input.check_named_mouse(n, !1), this.emitter.emit(18, n), this.game.onmousewheel(n))
            }
        },
        ontouchdown: function(t, e, s, i) {
            if (this.inited) {
                this._touch_pos = new I.Vector(t, e);
                var n = {
                    state: o.InteractState.down,
                    timestamp: i,
                    touch_id: s,
                    x: t,
                    y: e,
                    dx: t,
                    dy: e,
                    pos: this._touch_pos
                };
                this.shutting_down || (this.emitter.emit(19, n), this.game.ontouchdown(n))
            }
        },
        ontouchup: function(t, e, s, i) {
            if (this.inited) {
                this._touch_pos = new I.Vector(t, e);
                var n = {
                    state: o.InteractState.up,
                    timestamp: i,
                    touch_id: s,
                    x: t,
                    y: e,
                    dx: t,
                    dy: e,
                    pos: this._touch_pos
                };
                this.shutting_down || (this.emitter.emit(20, n), this.game.ontouchup(n))
            }
        },
        ontouchmove: function(t, e, s, i, n, r) {
            if (this.inited) {
                this._touch_pos = new I.Vector(t, e);
                var a = {
                    state: o.InteractState.move,
                    timestamp: r,
                    touch_id: n,
                    x: t,
                    y: e,
                    dx: s,
                    dy: i,
                    pos: this._touch_pos
                };
                this.shutting_down || (this.emitter.emit(21, a), this.game.ontouchmove(a))
            }
        },
        ongamepadaxis: function(t, e, s, i) {
            if (this.inited) {
                var n = {
                    timestamp: i,
                    type: o.GamepadEventType.axis,
                    state: o.InteractState.axis,
                    gamepad: t,
                    button: -1,
                    axis: e,
                    value: s
                };
                this.shutting_down || (this.emitter.emit(22, n), this.game.ongamepadaxis(n))
            }
        },
        ongamepaddown: function(t, e, s, i) {
            if (this.inited) {
                var n = {
                    timestamp: i,
                    type: o.GamepadEventType.button,
                    state: o.InteractState.down,
                    gamepad: t,
                    button: e,
                    axis: -1,
                    value: s
                };
                this.shutting_down || (this.input.check_named_gamepad_buttons(n, !0), this.emitter.emit(23, n), this.game.ongamepaddown(n))
            }
        },
        ongamepadup: function(t, e, s, i) {
            if (this.inited) {
                var n = {
                    timestamp: i,
                    type: o.GamepadEventType.button,
                    state: o.InteractState.up,
                    gamepad: t,
                    button: e,
                    axis: -1,
                    value: s
                };
                this.shutting_down || (this.input.check_named_gamepad_buttons(n, !1), this.emitter.emit(24, n), this.game.ongamepadup(n))
            }
        },
        ongamepaddevice: function(t, e, s) {
            if (this.inited) {
                var i = o.GamepadEventType.unknown;
                switch (e) {
                    case 1:
                        i = o.GamepadEventType.device_added;
                        break;
                    case 2:
                        i = o.GamepadEventType.device_removed;
                        break;
                    case 3:
                        i = o.GamepadEventType.device_remapped
                }
                var n = {
                    timestamp: s,
                    type: i,
                    state: o.InteractState.none,
                    gamepad: t,
                    button: -1,
                    axis: -1,
                    value: 0
                };
                this.shutting_down || this.game.ongamepaddevice(n)
            }
        },
        config: function(t) {
            return this.appconfig = t, this.appconfig.window.width = this.init_config.window.width, this.appconfig.window.height = this.init_config.window.height, this.appconfig.window.fullscreen = this.init_config.window.fullscreen, this.appconfig.window.borderless = this.init_config.window.borderless, this.appconfig.window.resizable = this.init_config.window.resizable, this.appconfig.window.title = this.init_config.window.title, this.appconfig.preload = {
                bytes: [],
                texts: [],
                jsons: [],
                textures: [],
                fonts: [],
                shaders: [],
                sounds: []
            }, this.appconfig = this.game.config(this.appconfig), this.appconfig
        },
        __class__: o.Core
    }), o.Tag = function() {}, i["luxe.Tag"] = o.Tag, o.Tag.__name__ = !0, o.Debug = function(t) {
        this.last_cursor_grab = !1, this.last_cursor_shown = !0, this.last_view_index = 0, this.current_view_index = 0, this.dt_average_count = 0, this.dt_average_span = 60, this.dt_average_accum = 0, this.dt_average = 0, this.visible = !1, this.core = t
    }, i["luxe.Debug"] = o.Debug, o.Debug.__name__ = !0, o.Debug.internal_trace = function(t, e) {
        var s = b.rpad(null == e.lineNumber ? "null" : "" + e.lineNumber, " ", 4);
        if (console.log("" + e.fileName + "::" + s + " " + w.string(t)), !o.Debug.shut_down)
            for (var i = o.Debug.trace_callbacks.iterator(); i.hasNext();) {
                var n = i.next();
                n(t, e)
            }
    }, o.Debug.prototype = {
        init: function() {
            o.Debug.trace_callbacks = new S.ds.StringMap, o.Debug.views = [], S.Log.trace = o.Debug.internal_trace
        },
        get_view: function(t) {
            for (var e = 0, s = o.Debug.views; e < s.length;) {
                var i = s[e];
                if (++e, i.get_name() == t) return i
            }
            return null
        },
        start: function() {},
        end: function() {},
        create_debug_console: function() {},
        mouseup: function(t) {
            if (this.visible)
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onmouseup(t)
                }
        },
        mousedown: function(t) {
            if (this.visible)
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onmousedown(t)
                }
        },
        mousewheel: function(t) {
            if (this.visible)
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onmousewheel(t)
                }
        },
        mousemove: function(t) {
            if (this.visible)
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onmousemove(t)
                }
        },
        keyup: function(t) {
            if (this.visible)
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onkeyup(t)
                }
        },
        keydown: function(t) {
            if (this.visible) {
                t.keycode == C.system.input.Keycodes.key_1 && this.core.console_visible && this.switch_view();
                for (var e = 0, s = o.Debug.views; e < s.length;) {
                    var i = s[e];
                    ++e, i.onkeydown(t)
                }
            }
        },
        switch_view: function() {
            this.last_view_index = this.current_view_index, this.current_view_index++, this.current_view_index > o.Debug.views.length - 1 && (this.current_view_index = 0), o.Debug.views[this.last_view_index].hide(), this.current_view = o.Debug.views[this.current_view_index], this.current_view.show()
        },
        show_console: function(t) {
            null == t && (t = !0)
        },
        destroy: function() {
            this.core.off(11, s(this, this.keyup)), this.core.off(10, s(this, this.keydown)), this.core.off(16, s(this, this.mouseup)), this.core.off(15, s(this, this.mousedown)), this.core.off(17, s(this, this.mousemove)), this.core.off(18, s(this, this.mousewheel)), o.Debug.shut_down = !0
        },
        process: function() {
            if (this.dt_average_accum += m.core.delta_time, this.dt_average_count++, this.dt_average_count == this.dt_average_span - 1 && (this.dt_average = this.dt_average_accum / this.dt_average_span, this.dt_average_accum = this.dt_average, this.dt_average_count = 0), this.visible) {
                this.debug_inspector._title_text.set_text("[" + this.current_view.get_name() + "] / " + Math.round(1 / this.dt_average) + " / " + o.utils.Maths.fixed(m.core.delta_time, 5) + " / " + o.utils.Maths.fixed(this.dt_average, 5));
                for (var t = 0, e = o.Debug.views; t < e.length;) {
                    var s = e[t];
                    ++t, s.process()
                }
            }
        },
        __class__: o.Debug
    }, o.Draw = function(t) {
        this.core = t
    }, i["luxe.Draw"] = o.Draw, o.Draw.__name__ = !0, o.Draw.prototype = {
        rectangle: function(t) {
            return null == t.id && (t.id = "rectangle.geometry"), t.id, null == t.batcher && (t.batcher = m.renderer.batcher), t.batcher, new I.geometry.RectangleGeometry(t)
        },
        __class__: o.Draw
    }, o.Events = function() {
        this.event_connections = new S.ds.StringMap, this.event_slots = new S.ds.StringMap, this.event_filters = new S.ds.StringMap, this.event_queue = new S.ds.StringMap, this.event_schedules = new S.ds.StringMap
    }, i["luxe.Events"] = o.Events, o.Events.__name__ = !0, o.Events.prototype = {
        destroy: function() {
            this.clear()
        },
        clear: function() {
            for (var t = this.event_schedules.iterator(); t.hasNext();) {
                var e = t.next();
                e.stop(), e = null
            }
            for (var s = this.event_connections.keys(); s.hasNext();) {
                var i = s.next();
                this.event_connections.remove(i)
            }
            for (var n = this.event_filters.keys(); n.hasNext();) {
                var o = n.next();
                this.event_filters.remove(o)
            }
            for (var r = this.event_slots.keys(); r.hasNext();) {
                var a = r.next();
                this.event_slots.remove(a)
            }
            for (var l = this.event_queue.keys(); l.hasNext();) {
                var h = l.next();
                this.event_queue.remove(h)
            }
        },
        does_filter_event: function(t, e) {
            var s = new a("\\*", "gi"),
                i = s.replace(t, ".*?"),
                n = new a(i, "gi");
            return n.match(e)
        },
        process: function() {
            for (var t = this.event_queue.iterator(); t.hasNext();) {
                var e = t.next();
                this.fire(e.name, e.properties)
            }
            this.event_queue.keys().hasNext() && (this.event_queue = null, this.event_queue = new S.ds.StringMap)
        },
        fire: function(t, e, s) {
            null == s && (s = !1);
            for (var i = !1, n = this.event_filters.iterator(); n.hasNext();) {
                var o = n.next();
                if (o.length > 0) {
                    var r = o[0].event_name;
                    if (this.does_filter_event(r, t)) {
                        s && (e = this.tag_properties(e, t, o.length));
                        for (var a = 0; a < o.length;) {
                            var l = o[a];
                            ++a, l.listener(e)
                        }
                        i = !0
                    }
                }
            }
            if (this.event_slots.exists(t)) {
                var h = this.event_slots.get(t);
                s && (e = this.tag_properties(e, t, h.length));
                for (var c = 0; c < h.length;) {
                    var _ = h[c];
                    ++c, _.listener(e)
                }
                i = !0
            }
            return i
        },
        tag_properties: function(t, e, s) {
            return null == t && (t = {}), t._event_name_ = e, t._event_connection_count_ = s, t
        },
        __class__: o.Events
    }, o._Events = {}, o._Events.EventConnection = function() {}, i["luxe._Events.EventConnection"] = o._Events.EventConnection, o._Events.EventConnection.__name__ = !0, o._Events.EventConnection.prototype = {
        __class__: o._Events.EventConnection
    }, o._Events.EventObject = function() {}, i["luxe._Events.EventObject"] = o._Events.EventObject, o._Events.EventObject.__name__ = !0, o._Events.EventObject.prototype = {
        __class__: o._Events.EventObject
    }, o.IO = function(t) {
        this.core = t
    }, i["luxe.IO"] = o.IO, o.IO.__name__ = !0, o.IO.prototype = {
        init: function() {},
        __class__: o.IO
    }, o.InteractState = i["luxe.InteractState"] = {
        __ename__: !0,
        __constructs__: ["unknown", "none", "down", "up", "move", "wheel", "axis"]
    }, o.InteractState.unknown = ["unknown", 0], o.InteractState.unknown.toString = n, o.InteractState.unknown.__enum__ = o.InteractState, o.InteractState.none = ["none", 1], o.InteractState.none.toString = n, o.InteractState.none.__enum__ = o.InteractState, o.InteractState.down = ["down", 2], o.InteractState.down.toString = n, o.InteractState.down.__enum__ = o.InteractState, o.InteractState.up = ["up", 3], o.InteractState.up.toString = n, o.InteractState.up.__enum__ = o.InteractState, o.InteractState.move = ["move", 4], o.InteractState.move.toString = n, o.InteractState.move.__enum__ = o.InteractState, o.InteractState.wheel = ["wheel", 5], o.InteractState.wheel.toString = n, o.InteractState.wheel.__enum__ = o.InteractState, o.InteractState.axis = ["axis", 6], o.InteractState.axis.toString = n, o.InteractState.axis.__enum__ = o.InteractState, o.TextEventType = i["luxe.TextEventType"] = {
        __ename__: !0,
        __constructs__: ["unknown", "edit", "input"]
    }, o.TextEventType.unknown = ["unknown", 0], o.TextEventType.unknown.toString = n, o.TextEventType.unknown.__enum__ = o.TextEventType, o.TextEventType.edit = ["edit", 1], o.TextEventType.edit.toString = n, o.TextEventType.edit.__enum__ = o.TextEventType, o.TextEventType.input = ["input", 2], o.TextEventType.input.toString = n, o.TextEventType.input.__enum__ = o.TextEventType, o.GamepadEventType = i["luxe.GamepadEventType"] = {
        __ename__: !0,
        __constructs__: ["unknown", "axis", "button", "device_added", "device_removed", "device_remapped"]
    }, o.GamepadEventType.unknown = ["unknown", 0], o.GamepadEventType.unknown.toString = n, o.GamepadEventType.unknown.__enum__ = o.GamepadEventType, o.GamepadEventType.axis = ["axis", 1], o.GamepadEventType.axis.toString = n, o.GamepadEventType.axis.__enum__ = o.GamepadEventType, o.GamepadEventType.button = ["button", 2], o.GamepadEventType.button.toString = n, o.GamepadEventType.button.__enum__ = o.GamepadEventType, o.GamepadEventType.device_added = ["device_added", 3], o.GamepadEventType.device_added.toString = n, o.GamepadEventType.device_added.__enum__ = o.GamepadEventType, o.GamepadEventType.device_removed = ["device_removed", 4], o.GamepadEventType.device_removed.toString = n, o.GamepadEventType.device_removed.__enum__ = o.GamepadEventType, o.GamepadEventType.device_remapped = ["device_remapped", 5], o.GamepadEventType.device_remapped.toString = n, o.GamepadEventType.device_remapped.__enum__ = o.GamepadEventType, o.InputType = i["luxe.InputType"] = {
        __ename__: !0,
        __constructs__: ["mouse", "touch", "keys", "gamepad"]
    }, o.InputType.mouse = ["mouse", 0], o.InputType.mouse.toString = n, o.InputType.mouse.__enum__ = o.InputType, o.InputType.touch = ["touch", 1], o.InputType.touch.toString = n, o.InputType.touch.__enum__ = o.InputType, o.InputType.keys = ["keys", 2], o.InputType.keys.toString = n, o.InputType.keys.__enum__ = o.InputType, o.InputType.gamepad = ["gamepad", 3], o.InputType.gamepad.toString = n, o.InputType.gamepad.__enum__ = o.InputType, o.Input = function(t) {
        this.core = t
    }, i["luxe.Input"] = o.Input, o.Input.__name__ = !0, o.Input.prototype = {
        init: function() {
            this.key_bindings = new S.ds.StringMap, this.mouse_bindings = new S.ds.StringMap, this.gamepad_bindings = new S.ds.StringMap, this._named_input_down = new S.ds.StringMap, this._named_input_pressed = new S.ds.StringMap, this._named_input_released = new S.ds.StringMap
        },
        destroy: function() {},
        process: function() {
            for (var t = this._named_input_pressed.keys(); t.hasNext();) {
                var e = t.next();
                this._named_input_pressed.get(e) ? this._named_input_pressed.remove(e) : this._named_input_pressed.set(e, !0)
            }
            for (var s = this._named_input_released.keys(); s.hasNext();) {
                var i = s.next();
                this._named_input_released.get(i) ? this._named_input_released.remove(i) : this._named_input_released.set(i, !0)
            }
        },
        bind_key: function(t, e) {
            if (!this.key_bindings.exists(t)) {
                var s = new S.ds.IntMap;
                this.key_bindings.set(t, s)
            }
            var i = this.key_bindings.get(t);
            i.set(e, !0)
        },
        check_named_keys: function(t, e) {
            null == e && (e = !1);
            for (var s = [], i = this.key_bindings.keys(); i.hasNext();) {
                var n = i.next(),
                    r = this.key_bindings.get(n),
                    a = e && t.repeat;
                r.exists(t.keycode) && !a && (c.has(s, n) || s.push(n))
            }
            for (var l = 0; l < s.length;) {
                var h = s[l];
                ++l, e ? (this._named_input_pressed.set(h, !1), this._named_input_down.set(h, !0), this.core.oninputdown(h, {
                    name: h,
                    type: o.InputType.keys,
                    state: o.InteractState.down,
                    key_event: t
                })) : (this._named_input_released.set(h, !1), this._named_input_down.remove(h), this.core.oninputup(h, {
                    name: h,
                    type: o.InputType.keys,
                    state: o.InteractState.up,
                    key_event: t
                }))
            }
        },
        check_named_mouse: function(t, e) {
            null == e && (e = !1);
            for (var s = [], i = this.mouse_bindings.keys(); i.hasNext();) {
                var n = i.next(),
                    r = this.mouse_bindings.get(n);
                r.exists(t.button) && (c.has(s, n) || s.push(n))
            }
            for (var a = 0; a < s.length;) {
                var l = s[a];
                ++a, e ? (this._named_input_pressed.set(l, !1), this._named_input_down.set(l, !0), this.core.oninputdown(l, {
                    name: l,
                    type: o.InputType.mouse,
                    state: o.InteractState.down,
                    mouse_event: t
                })) : (this._named_input_released.set(l, !1), this._named_input_down.remove(l), this.core.oninputup(l, {
                    name: l,
                    type: o.InputType.mouse,
                    state: o.InteractState.up,
                    mouse_event: t
                }))
            }
        },
        check_named_gamepad_buttons: function(t, e) {
            null == e && (e = !1);
            for (var s = [], i = this.gamepad_bindings.keys(); i.hasNext();) {
                var n = i.next(),
                    r = this.gamepad_bindings.get(n);
                if (r.exists(t.button)) {
                    var a = r.get(t.button),
                        l = null == a || a == t.gamepad;
                    !c.has(s, n) && l && s.push(n)
                }
            }
            for (var h = 0; h < s.length;) {
                var _ = s[h];
                ++h, e ? (this._named_input_pressed.set(_, !1), this._named_input_down.set(_, !0), this.core.oninputdown(_, {
                    name: _,
                    type: o.InputType.gamepad,
                    state: o.InteractState.down,
                    gamepad_event: t
                })) : (this._named_input_released.set(_, !1), this._named_input_down.remove(_), this.core.oninputup(_, {
                    name: _,
                    type: o.InputType.gamepad,
                    state: o.InteractState.up,
                    gamepad_event: t
                }))
            }
        },
        __class__: o.Input
    }, o.DebugError = i["luxe.DebugError"] = {
        __ename__: !0,
        __constructs__: ["assertion", "null_assertion"]
    }, o.DebugError.assertion = function(t) {
        var e = ["assertion", 0, t];
        return e.__enum__ = o.DebugError, e.toString = n, e
    }, o.DebugError.null_assertion = function(t) {
        var e = ["null_assertion", 1, t];
        return e.__enum__ = o.DebugError, e.toString = n, e
    }, o.Visual = function(t) {
        if (this.ignore_texture_on_geometry_change = !1, this._creating_geometry = !1, this._has_custom_origin = !1, this.radians = 0, this.group = 0, this.depth = 0, this.visible = !0, this.locked = !1, null == t) throw o.DebugError.null_assertion("_options was null (Visual requires non-null options)");
        this._rotation_euler = new I.Vector, this._rotation_quat = new I.Quaternion, o.Entity.call(this, t), this.set_color(new I.Color), this.set_size(new I.Vector), null != this.options.texture && this.set_texture(this.options.texture), null != this.options.shader && this.set_shader(this.options.shader), null != this.options.color && this.set_color(this.options.color), null != this.options.depth && this.set_depth(this.options.depth), null != this.options.group && this.set_group(this.options.group), null != this.options.visible && this.set_visible(this.options.visible), null != this.options.size ? (this.set_size(this.options.size), this._create_geometry()) : null != this.texture ? (this.set_size(new I.Vector(this.texture.width, this.texture.height)), this._create_geometry()) : (this.set_size(new I.Vector(64, 64)), this._create_geometry())
    }, i["luxe.Visual"] = o.Visual, o.Visual.__name__ = !0, o.Visual.__super__ = o.Entity, o.Visual.prototype = t(o.Entity.prototype, {
        _create_geometry: function() {
            if (null == this.options.geometry) {
                if (null == this.options.no_geometry || 0 == this.options.no_geometry) {
                    this._creating_geometry = !0;
                    var t = null;
                    (null == this.options.no_batcher_add || 0 == this.options.no_batcher_add) && (t = null != this.options.batcher ? this.options.batcher : m.renderer.batcher), this.set_geometry(new I.geometry.QuadGeometry({
                        id: this.get_name() + ".visual",
                        x: 0,
                        y: 0,
                        w: this.size.x,
                        h: this.size.y,
                        scale: new I.Vector(1, 1, 1),
                        texture: this.texture,
                        color: this.color,
                        shader: this.shader,
                        batcher: t,
                        depth: null == this.options.depth ? 0 : this.options.depth,
                        group: null == this.options.group ? 0 : this.options.group,
                        visible: null == this.options.visible ? this.visible : this.options.visible
                    })), this._creating_geometry = !1, this.on_geometry_created()
                }
            } else this.set_geometry(this.options.geometry);
            null != this.geometry && (this.geometry.id = this.get_name() + ".visual", this.geometry.transform.id = this.get_name() + ".visual.transform"), null != this.options.origin && (this._has_custom_origin = !0, this.set_origin(this.options.origin)), null != this.options.rotation_z && this.set_rotation_z(this.options.rotation_z)
        },
        ondestroy: function() {
            null != this.geometry && this.geometry.added && this.geometry.drop(!0), this.set_geometry(null), this.set_texture(null)
        },
        on_geometry_created: function() {},
        set_visible: function(t) {
            return this.visible = t, null != this.geometry && this.geometry.set_visible(this.visible), this.visible
        },
        set_depth: function(t) {
            return null != this.geometry && this.geometry.set_depth(t), this.depth = t
        },
        set_group: function(t) {
            return null != this.geometry && this.geometry.set_group(t), this.group = t
        },
        set_color: function(t) {
            return null != this.color && null != this.geometry && this.geometry.set_color(t), this.color = t
        },
        set_texture: function(t) {
            return null != this.geometry && this.geometry.get_texture() != t && this.geometry.set_texture(t), this.texture = t
        },
        set_shader: function(t) {
            return null != this.geometry && this.geometry.get_shader() != t && this.geometry.set_shader(t), this.shader = t
        },
        set_geometry: function(t) {
            return this.geometry == t ? this.geometry : (null != this.geometry && this.geometry.drop(), this.geometry = t, null != this.geometry && (this.geometry.transform.set_parent(this.get_transform()), 0 == this._creating_geometry && (this.geometry.set_color(this.color), this.geometry.set_group(this.group), this.geometry.set_depth(this.depth), this.geometry.set_visible(this.visible), !this.ignore_texture_on_geometry_change)), this.geometry)
        },
        set_parent_from_transform: function(t) {
            o.Entity.prototype.set_parent_from_transform.call(this, t), null != this.geometry && this.geometry.transform.set_parent(this.get_transform())
        },
        set_rotation_from_transform: function(t) {
            o.Entity.prototype.set_rotation_from_transform.call(this, t), this._rotation_euler.setEulerFromQuaternion(t, null), this._rotation_quat.copy(t)
        },
        set_size: function(t) {
            return this.size = t, null != this.size && I.Vector.Listen(this.size, s(this, this._size_change)), this.size
        },
        set_rotation_z: function(t) {
            return this.set_radians(.017453292519943278 * t), t
        },
        set_radians: function(t) {
            return this._rotation_euler.set_z(t), this._rotation_quat.setFromEuler(this._rotation_euler), this.set_rotation(this._rotation_quat.clone()), this.radians = t
        },
        set_locked: function(t) {
            return null != this.geometry && this.geometry.set_locked(t), this.locked = t
        },
        _size_change: function() {
            this.set_size(this.size)
        },
        init: function() {
            o.Entity.prototype.init.call(this)
        },
        __class__: o.Visual,
        __properties__: t(o.Entity.prototype.__properties__, {
            set_rotation_z: "set_rotation_z",
            set_radians: "set_radians",
            set_group: "set_group",
            set_depth: "set_depth",
            set_visible: "set_visible",
            set_color: "set_color",
            set_shader: "set_shader",
            set_texture: "set_texture",
            set_locked: "set_locked",
            set_geometry: "set_geometry",
            set_size: "set_size"
        })
    }), o.Parcel = function(t) {
        this.load_start_delay = .2, this.load_time_spacing = .05, this.start_load = 0, this.time_to_load = 0, null == t && (t = {}), null == t.system && (t.system = m.resources), t.system, null == t.id && (t.id = m.utils.uniqueid(null)), t.id, null != t.oncomplete && (this.oncomplete = t.oncomplete), null != t.onprogress && (this.onprogress = t.onprogress), null != t.onfailed && (this.onfailed = t.onfailed), null != t.load_time_spacing && (this.load_time_spacing = t.load_time_spacing), null != t.load_start_delay && (this.load_start_delay = t.load_start_delay), this.state = 0, this.loaded = [], this.emitter = new o.Emitter, this.system = t.system, this.id = t.id, this.list = this.empty_list(), null != t.bytes && (this.list.bytes = t.bytes), null != t.texts && (this.list.texts = t.texts), null != t.jsons && (this.list.jsons = t.jsons), null != t.textures && (this.list.textures = t.textures), null != t.fonts && (this.list.fonts = t.fonts), null != t.shaders && (this.list.shaders = t.shaders), null != t.sounds && (this.list.sounds = t.sounds), this.system.track(this)
    }, i["luxe.Parcel"] = o.Parcel, o.Parcel.__name__ = !0, o.Parcel.prototype = {
        on: function(t, e) {
            this.emitter.on(t, e)
        },
        load: function(t) {
            var e = this;
            this.state = 1, m.timer.schedule(this.load_start_delay, function() {
                if (e.start_load = C.Snow.core.timestamp(), null == t && (t = e.id), e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length == 0) return e.state = 2, e.time_to_load = C.Snow.core.timestamp() - e.start_load, e.emitter.emit(2, e), void(null != e.oncomplete && e.oncomplete(e));
                for (var s = 0, i = 0, n = e.list.bytes; i < n.length;) {
                    var o = [n[i]];
                    ++i, -1 == h.indexOf(e.loaded, o[0].id, 0) ? (e.loaded.push(o[0].id), m.timer.schedule(e.load_time_spacing, function(i) {
                        return function() {
                            var n = i[0].id,
                                o = e.system.load_bytes(i[0].id);
                            o.then(function() {
                                return function(i) {
                                    e.one_loaded(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(o))) : e.one_loaded(o[0].id, t, e.system.cache.get(o[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var r = 0, a = e.list.texts; r < a.length;) {
                    var l = [a[r]];
                    ++r, -1 == h.indexOf(e.loaded, l[0].id, 0) ? (e.loaded.push(l[0].id), m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = i[0].id,
                                o = e.system.load_text(i[0].id);
                            o.then(function() {
                                return function(i) {
                                    e.one_loaded(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(l))) : e.one_loaded(l[0].id, t, e.system.cache.get(l[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var c = 0, _ = e.list.jsons; c < _.length;) {
                    var u = [_[c]];
                    ++c, -1 == h.indexOf(e.loaded, u[0].id, 0) ? (e.loaded.push(u[0].id), m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = i[0].id,
                                o = e.system.load_json(i[0].id);
                            o.then(function() {
                                return function(i) {
                                    e.one_loaded(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(n, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(u))) : e.one_loaded(u[0].id, t, e.system.cache.get(u[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var d = 0, p = e.list.textures; d < p.length;) {
                    var y = [p[d]];
                    ++d, -1 == h.indexOf(e.loaded, y[0].id, 0) ? (e.loaded.push(y[0].id), m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = e.system.load_texture(i[0].id, {
                                    load_premultiply_alpha: i[0].load_premultiply_alpha,
                                    filter_min: i[0].filter_min,
                                    filter_mag: i[0].filter_mag,
                                    clamp_s: i[0].clamp_s,
                                    clamp_t: i[0].clamp_t
                                }),
                                o = i[0].id;
                            n.then(function() {
                                return function(i) {
                                    e.one_loaded(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(y))) : e.one_loaded(y[0].id, t, e.system.cache.get(y[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var f = 0, g = e.list.fonts; f < g.length;) {
                    var v = [g[f]];
                    ++f, -1 == h.indexOf(e.loaded, v[0].id, 0) ? (e.loaded.push(v[0].id), m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = e.system.load_font(i[0].id, {
                                    texture_path: i[0].texture_path
                                }),
                                o = i[0].id;
                            n.then(function() {
                                return function(i) {
                                    e.one_loaded(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(v))) : e.one_loaded(v[0].id, t, e.system.cache.get(v[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var x = 0, w = e.list.shaders; x < w.length;) {
                    var b = [w[x]];
                    ++x, -1 == h.indexOf(e.loaded, b[0].id, 0) ? (e.loaded.push(b[0].id), m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = e.system.load_shader(i[0].id, {
                                    frag_id: i[0].frag_id,
                                    vert_id: i[0].vert_id
                                }),
                                o = i[0].id;
                            n.then(function() {
                                return function(i) {
                                    e.one_loaded(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(), function() {
                                return function(i) {
                                    e.one_failed(o, t, i, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }())
                        }
                    }(b))) : e.one_loaded(b[0].id, t, e.system.cache.get(b[0].id), ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                }
                for (var B = 0, S = e.list.sounds; B < S.length;) {
                    var A = [S[B]];
                    ++B, m.audio.exists(A[0].name) ? e.one_loaded(A[0].id, t, null, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length) : m.timer.schedule(e.load_time_spacing * s, function(i) {
                        return function() {
                            var n = m.audio.create(i[0].id, i[0].name, i[0].is_stream);
                            n.then(function(i) {
                                return function() {
                                    e.one_loaded(i[0].id, t, null, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(i), function(i) {
                                return function(n) {
                                    e.one_failed(i[0].id, t, n, ++s, e.list.bytes.length + e.list.texts.length + e.list.jsons.length + e.list.textures.length + e.list.shaders.length + e.list.fonts.length + e.list.sounds.length)
                                }
                            }(i))
                        }
                    }(A))
                }
            })
        },
        one_loaded: function(t, e, s, i, n) {
            var o = {
                id: t,
                load_id: e,
                resource: s,
                index: i,
                total: n
            };
            this.emitter.emit(1, o), null != this.onprogress && this.onprogress(o), i == n && (this.state = 2, this.time_to_load = C.Snow.core.timestamp() - this.start_load, this.emitter.emit(2, this), null != this.oncomplete && this.oncomplete(this))
        },
        one_failed: function(t, e, s, i, n) {
            var o = {
                id: t,
                load_id: e,
                error: s,
                index: i,
                total: n
            };
            this.emitter.emit(3, o), null != this.onfailed && this.onfailed(o)
        },
        empty_list: function() {
            return {
                bytes: [],
                texts: [],
                jsons: [],
                textures: [],
                fonts: [],
                shaders: [],
                sounds: []
            }
        },
        __class__: o.Parcel
    }, o.ParcelProgress = function(t) {
        this.height = 0, this.width = 0;
        var e = m.core.screen.get_w(),
            i = m.core.screen.get_h();
        null != m.camera.get_size() && (e = m.camera.get_size().x, i = m.camera.get_size().y); {
            var n = Math.floor(e / 2);
            Math.floor(i / 2)
        }
        this.width = Math.max(Math.floor(.75 * e), 2), this.height = Math.max(Math.floor(.002 * i), 2), this.options = t, null == this.options.no_visuals && (this.options.no_visuals = !1), this.options.no_visuals, null == this.options.bar && (this.options.bar = (new I.Color).rgb(3421236)), this.options.bar, null == this.options.bar_border && (this.options.bar_border = (new I.Color).rgb(1447446)), this.options.bar_border, null == this.options.background && (this.options.background = (new I.Color).rgb(592137)), this.options.background, null == this.options.fade_in && (this.options.fade_in = !0), this.options.fade_in, null == this.options.fade_out && (this.options.fade_out = !0), this.options.fade_out, null == this.options.fade_time && (this.options.fade_time = .3), this.options.fade_time;
        var r = this.options.background.a;
        if (this.options.fade_in && (this.options.background.a = 0, this.options.bar.a = 0, this.options.bar_border.a = 0), !this.options.no_visuals) {
            var a = Math.floor(.6 * i),
                l = Math.floor(this.width / 2),
                h = Math.floor(this.height / 2);
            this.background = new o.Sprite({
                no_scene: !0,
                size: new I.Vector(e, i),
                centered: !1,
                color: this.options.background,
                depth: 998,
                visible: !0
            }), this.progress_bar = new o.Sprite({
                pos: new I.Vector(n - l, a - h),
                size: new I.Vector(2, this.height),
                no_scene: !0,
                centered: !1,
                color: this.options.bar,
                depth: 998
            }), this.progress_border = new o.Visual({
                color: this.options.bar,
                no_scene: !0,
                pos: new I.Vector(n - l, a - h),
                geometry: m.draw.rectangle({
                    w: this.width,
                    h: this.height,
                    depth: 998.1
                }),
                depth: 998.1
            }), this.options.fade_in && (this.background.color.tween(this.options.fade_time, {
                a: r
            }, !0), this.progress_bar.color.tween(this.options.fade_time, {
                a: 1
            }, !0), this.progress_border.color.tween(this.options.fade_time, {
                a: 1
            }, !0))
        }
        this.options.parcel.on(1, s(this, this.onprogress)), this.options.parcel.on(2, s(this, this.oncomplete))
    }, i["luxe.ParcelProgress"] = o.ParcelProgress, o.ParcelProgress.__name__ = !0, o.ParcelProgress.prototype = {
        set_progress: function(t) {
            0 > t && (t = 0), t > 1 && (t = 1), this.progress_bar.size.set_x(Math.ceil(this.width * t))
        },
        onprogress: function(t) {
            var e = t.index / t.total;
            this.set_progress(e)
        },
        oncomplete: function() {
            !this.options.no_visuals && this.options.fade_out ? (this.do_complete(), this.background.color.tween(this.options.fade_time, {
                a: 0
            }, !0), this.progress_bar.color.tween(this.options.fade_time, {
                a: 0
            }, !0), this.progress_border.color.tween(this.options.fade_time, {
                a: 0
            }, !0)) : this.do_complete()
        },
        do_complete: function() {
            null != this.options.oncomplete && this.options.oncomplete(this.options.parcel)
        },
        __class__: o.ParcelProgress
    }, o.Physics = function(t) {
        this.step_rate = .016666666666666666, this.core = t
    }, i["luxe.Physics"] = o.Physics, o.Physics.__name__ = !0, o.Physics.prototype = {
        init: function() {
            this.engines = []
        },
        reset: function() {
            null != this.timer && (this.timer.stop(), this.timer = null), 0 != this.step_rate && (this.timer = m.timer.schedule(this.step_rate, s(this, this.fixed_update), !0))
        },
        fixed_update: function() {
            m.debug.start(o.Physics.tag_physics), this.update(), m.debug.end(o.Physics.tag_physics)
        },
        update: function() {
            for (var t = 0, e = this.engines; t < e.length;) {
                var s = e[t];
                ++t, s.update()
            }
        },
        process: function() {
            for (var t = 0, e = this.engines; t < e.length;) {
                var s = e[t];
                ++t, s.process()
            }
        },
        destroy: function() {
            null != this.timer && this.timer.stop(), this.timer = null;
            for (var t = 0, e = this.engines; t < e.length;) {
                var s = e[t];
                ++t, s.destroy()
            }
        },
        __class__: o.Physics
    }, o.PhysicsEngine = function() {}, i["luxe.PhysicsEngine"] = o.PhysicsEngine, o.PhysicsEngine.__name__ = !0, o.PhysicsEngine.prototype = {
        process: function() {},
        update: function() {},
        destroy: function() {},
        __class__: o.PhysicsEngine
    }, o.Resources = function() {
        this.parcels = [], this.emitter = new o.Emitter, this.cache = new S.ds.StringMap, this.stats = new o.ResourceStats
    }, i["luxe.Resources"] = o.Resources, o.Resources.__name__ = !0, o.Resources.prototype = {
        track: function(t) {
            if (null == t) throw o.DebugError.null_assertion("_cache was null");
            if (-1 != h.indexOf(this.parcels, t, 0)) throw o.DebugError.assertion("parcels.indexOf(_cache) == -1");
            this.parcels.push(t), this.emit(11, t)
        },
        add: function(t) {
            if (this.cache.exists(t.id)) throw o.DebugError.assertion("!cache.exists(resource.id)");
            this.cache.set(t.id, t), this.emit(2, t), this.update_stats(t, 1)
        },
        remove: function(t) {
            if (!this.cache.exists(t.id)) throw o.DebugError.assertion("cache.exists(resource.id)");
            return this.emit(7, t), this.update_stats(t, -1), this.cache.remove(t.id)
        },
        emit: function(t, e) {
            this.emitter.emit(1, e), this.emitter.emit(t, e)
        },
        load_bytes: function(t) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var e = this.cache.get(t);
            if (null != e) {
                var s = e,
                    i = s.ref;
                return s.set_ref(i + 1), C.api.Promise.resolve(e)
            }
            return e = new o.resource.BytesResource({
                id: t,
                system: this,
                asset: null
            }), this.add(e), e.reload()
        },
        load_text: function(t) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var e = this.cache.get(t);
            if (null != e) {
                var s = e,
                    i = s.ref;
                return s.set_ref(i + 1), C.api.Promise.resolve(e)
            }
            return e = new o.resource.TextResource({
                id: t,
                system: this,
                asset: null
            }), this.add(e), e.reload()
        },
        load_json: function(t) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var e = this.cache.get(t);
            if (null != e) {
                var s = e,
                    i = s.ref;
                return s.set_ref(i + 1), C.api.Promise.resolve(e)
            }
            return e = new o.resource.JSONResource({
                id: t,
                system: this,
                asset: null
            }), this.add(e), e.reload()
        },
        load_texture: function(t, e) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var s = this.cache.get(t);
            if (null != s) {
                var i = s,
                    n = i.ref;
                return i.set_ref(n + 1), C.api.Promise.resolve(s)
            }
            var r = null,
                a = null,
                l = null,
                h = null,
                c = null;
            return null != e && (r = e.filter_min, a = e.filter_mag, l = e.clamp_s, h = e.clamp_t, c = e.load_premultiply_alpha), s = new I.Texture({
                id: t,
                system: this,
                filter_min: r,
                filter_mag: a,
                clamp_s: l,
                clamp_t: h,
                load_premultiply_alpha: c
            }), this.add(s), s.reload()
        },
        load_font: function(t, e) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var s = this.cache.get(t);
            if (null != s) {
                var i = s,
                    n = i.ref;
                return i.set_ref(n + 1), C.api.Promise.resolve(s)
            }
            var r = null;
            return null != e && (r = e.texture_path), s = new I.BitmapFont({
                id: t,
                system: this,
                texture_path: r
            }), this.add(s), s.reload()
        },
        load_shader: function(t, e) {
            if (null == t) throw o.DebugError.null_assertion("_id was null");
            var s = this.cache.get(t);
            if (null != s) {
                var i = s,
                    n = i.ref;
                return i.set_ref(n + 1), C.api.Promise.resolve(s)
            }
            return s = new I.Shader({
                id: t,
                system: this,
                frag_id: e.frag_id,
                vert_id: e.vert_id
            }), this.add(s), s.reload()
        },
        update_stats: function(t, e) {
            var s = t.resource_type;
            switch (s) {
                case 0:
                    this.stats.unknown += e;
                    break;
                case 3:
                    this.stats.bytes += e;
                    break;
                case 1:
                    this.stats.texts += e;
                    break;
                case 2:
                    this.stats.jsons += e;
                    break;
                case 4:
                    this.stats.textures += e;
                    break;
                case 5:
                    this.stats.render_textures += e;
                    break;
                case 6:
                    this.stats.fonts += e;
                    break;
                case 7:
                    this.stats.shaders += e
            }
            this.stats.total += e
        },
        __class__: o.Resources
    }, o.ResourceStats = function() {
        this.unknown = 0, this.bytes = 0, this.jsons = 0, this.texts = 0, this.shaders = 0, this.render_textures = 0, this.textures = 0, this.fonts = 0, this.total = 0
    }, i["luxe.ResourceStats"] = o.ResourceStats, o.ResourceStats.__name__ = !0, o.ResourceStats.prototype = {
        __class__: o.ResourceStats
    }, o.Scene = function(t) {
        null == t && (t = "untitled scene"), this.entity_count = 0, this._has_changed = !1, this.started = !1, this.inited = !1, o.Objects.call(this, t), this.entities = new S.ds.StringMap, this._delayed_init_entities = [], this._delayed_reset_entities = [], m.core.on(2, s(this, this.init)), m.core.on(6, s(this, this._destroy)), m.core.on(4, s(this, this.update)), m.core.on(7, s(this, this.prerender)), m.core.on(9, s(this, this.postrender)), m.core.on(8, s(this, this.render)), m.core.on(10, s(this, this.keydown)), m.core.on(11, s(this, this.keyup)), m.core.on(12, s(this, this.textinput)), m.core.on(14, s(this, this.inputup)), m.core.on(13, s(this, this.inputdown)), m.core.on(16, s(this, this.mouseup)), m.core.on(15, s(this, this.mousedown)), m.core.on(17, s(this, this.mousemove)), m.core.on(18, s(this, this.mousewheel)), m.core.on(20, s(this, this.touchup)), m.core.on(19, s(this, this.touchdown)), m.core.on(21, s(this, this.touchmove)), m.core.on(24, s(this, this.gamepadup)), m.core.on(23, s(this, this.gamepaddown)), m.core.on(22, s(this, this.gamepadaxis)), m.core.on(25, s(this, this.gamepaddevice)), m.core.on(27, s(this, this.windowmoved)), m.core.on(28, s(this, this.windowresized)), m.core.on(29, s(this, this.windowsized)), m.core.on(30, s(this, this.windowminimized)), m.core.on(31, s(this, this.windowrestored)), m.core.inited && this.init(null);
        var e = m.core.debug.get_view("Scenes");
        null != e && e.add_scene(this)
    }, i["luxe.Scene"] = o.Scene, o.Scene.__name__ = !0, o.Scene.__super__ = o.Objects, o.Scene.prototype = t(o.Objects.prototype, {
        handle_duplicate_warning: function(t) {
            this.entities.exists(t)
        },
        add: function(t) {
            if (null == t) throw o.DebugError.null_assertion("entity was null (can't put entity in a scene if the entity is null.)");
            this.handle_duplicate_warning(t.get_name()), t.set_scene(this);
            var e = t.get_name();
            this.entities.set(e, t), this.entity_count++, this.inited && this._delayed_init_entities.push(t), this.started && this._delayed_reset_entities.push(t), this._has_changed = !0
        },
        remove: function(t) {
            if (null == t) throw o.DebugError.null_assertion("entity was null (can't remove entity from a scene if the entity is null.)");
            if (this._has_changed = !0, t.get_scene() == this) {
                t.set_scene(null), this.entity_count--;
                var e = t.get_name();
                return this.entities.remove(e)
            }
            return !1
        },
        render: function() {
            this.emit(8)
        },
        prerender: function() {
            this.emit(7)
        },
        postrender: function() {
            this.emit(9)
        },
        keydown: function(t) {
            this.emit(10, t)
        },
        keyup: function(t) {
            this.emit(11, t)
        },
        textinput: function(t) {
            this.emit(12, t)
        },
        mousedown: function(t) {
            this.emit(15, t)
        },
        mousewheel: function(t) {
            this.emit(18, t)
        },
        mouseup: function(t) {
            this.emit(16, t)
        },
        mousemove: function(t) {
            this.emit(17, t)
        },
        touchdown: function(t) {
            this.emit(19, t)
        },
        touchup: function(t) {
            this.emit(20, t)
        },
        touchmove: function(t) {
            this.emit(21, t)
        },
        gamepadaxis: function(t) {
            this.emit(22, t)
        },
        gamepadup: function(t) {
            this.emit(24, t)
        },
        gamepaddown: function(t) {
            this.emit(23, t)
        },
        gamepaddevice: function(t) {
            this.emit(25, t)
        },
        windowmoved: function(t) {
            this.emit(27, t)
        },
        windowresized: function(t) {
            this.emit(28, t)
        },
        windowsized: function(t) {
            this.emit(29, t)
        },
        windowminimized: function(t) {
            this.emit(30, t)
        },
        windowrestored: function(t) {
            this.emit(31, t)
        },
        inputdown: function(t) {
            this.emit(13, t)
        },
        inputup: function(t) {
            this.emit(14, t)
        },
        _destroy: function() {
            this.destroy()
        },
        destroy: function() {
            m.core.off(2, s(this, this.init)), m.core.off(6, s(this, this._destroy)), m.core.off(4, s(this, this.update)), m.core.off(7, s(this, this.prerender)), m.core.off(9, s(this, this.postrender)), m.core.off(8, s(this, this.render)), m.core.off(10, s(this, this.keydown)), m.core.off(11, s(this, this.keyup)), m.core.off(12, s(this, this.textinput)), m.core.off(14, s(this, this.inputup)), m.core.off(13, s(this, this.inputdown)), m.core.off(16, s(this, this.mouseup)), m.core.off(15, s(this, this.mousedown)), m.core.off(17, s(this, this.mousemove)), m.core.off(18, s(this, this.mousewheel)), m.core.off(20, s(this, this.touchup)), m.core.off(19, s(this, this.touchdown)), m.core.off(21, s(this, this.touchmove)), m.core.off(24, s(this, this.gamepadup)), m.core.off(23, s(this, this.gamepaddown)), m.core.off(22, s(this, this.gamepadaxis)), m.core.off(25, s(this, this.gamepaddevice)), m.core.off(27, s(this, this.windowmoved)), m.core.off(28, s(this, this.windowresized)), m.core.off(29, s(this, this.windowsized)), m.core.off(30, s(this, this.windowminimized)), m.core.off(31, s(this, this.windowrestored)), this.emit(6);
            var t = m.core.debug.get_view("Scenes");
            null != t && t.remove_scene(this)
        },
        _do_init: function() {
            var t = this.get_length();
            if (this.entity_count > 0)
                for (var e = this.entities.iterator(); e.hasNext();) {
                    var s = e.next();
                    null != s && (s.inited || s._init())
                }
            var i = this.get_length();
            return t != i
        },
        init: function() {
            for (var t = !0; t;) t = this._do_init();
            this.inited = !0, this.emit(2), this.reset()
        },
        reset: function() {
            this.started = !1, this.emit(3), this.started = !0
        },
        update: function(t) {
            if (m.core.debug.start("scene." + this.get_name()), this.handle_delayed_additions(), this.emit(4, t), this.entity_count > 0)
                for (var e = this.entities.iterator(); e.hasNext();) {
                    var s = e.next();
                    null != s && s._update(t)
                }
            m.core.debug.end("scene." + this.get_name())
        },
        handle_delayed_additions: function() {
            if (0 != this._delayed_init_entities.length || 0 != this._delayed_reset_entities.length, this._delayed_init_entities.length > 0) {
                for (var t = 0, e = this._delayed_init_entities; t < e.length;) {
                    var s = e[t];
                    ++t, s.inited || s._init()
                }
                this._delayed_init_entities.splice(0, this._delayed_init_entities.length)
            }
            if (this._delayed_reset_entities.length > 0) {
                for (var i = 0, n = this._delayed_reset_entities; i < n.length;) {
                    var o = n[i];
                    ++i, o._reset(null)
                }
                this._delayed_reset_entities.splice(0, this._delayed_reset_entities.length)
            }
        },
        get_length: function() {
            return c.count(this.entities)
        },
        __class__: o.Scene,
        __properties__: t(o.Objects.prototype.__properties__, {
            get_length: "get_length"
        })
    }), o.Screen = function(t, e, s) {
        this.core = t, this.cursor = new o.Cursor(this), this.width = e, this.height = s
    }, i["luxe.Screen"] = o.Screen, o.Screen.__name__ = !0, o.Screen.prototype = {
        internal_resized: function(t, e) {
            this.width = t, this.height = e
        },
        get_w: function() {
            return 0 | this.width
        },
        get_h: function() {
            return 0 | this.height
        },
        __class__: o.Screen,
        __properties__: {
            get_h: "get_h",
            get_w: "get_w"
        }
    }, o.Cursor = function(t) {
        this.ignore = !1, this.grab = !1, this.visible = !0, this.screen = t, this.set_pos(new I.Vector)
    }, i["luxe.Cursor"] = o.Cursor, o.Cursor.__name__ = !0, o.Cursor.prototype = {
        set_internal: function(t) {
            this.ignore = !0, this.set_pos(t), this.ignore = !1
        },
        get_visible: function() {
            return this.visible
        },
        set_visible: function(t) {
            return this.screen.core.app.windowing.enable_cursor(t), this.visible = t
        },
        get_grab: function() {
            return this.grab
        },
        set_grab: function(t) {
            return this.screen.core.app.window.set_grab(t), this.grab = t
        },
        get_pos: function() {
            return this.pos
        },
        set_pos: function(t) {
            return null == this.get_pos() || null == t || this.ignore || this.screen.core.app.window.set_cursor_position(0 | t.x, 0 | t.y), this.pos = t
        },
        __class__: o.Cursor,
        __properties__: {
            set_pos: "set_pos",
            get_pos: "get_pos",
            set_grab: "set_grab",
            get_grab: "get_grab",
            set_visible: "set_visible",
            get_visible: "get_visible"
        }
    }, o.Sprite = function(t) {
        if (this.flipy = !1, this.flipx = !1, this.centered = !0, this.set_uv(new I.Rectangle), null == t) throw o.DebugError.null_assertion("options was null (Sprite requires non-null options)");
        null != t.centered && this.set_centered(t.centered), null != t.flipx && this.set_flipx(t.flipx), null != t.flipy && this.set_flipy(t.flipy), o.Visual.call(this, t)
    }, i["luxe.Sprite"] = o.Sprite, o.Sprite.__name__ = !0, o.Sprite.__super__ = o.Visual, o.Sprite.prototype = t(o.Visual.prototype, {
        on_geometry_created: function() {
            o.Visual.prototype.on_geometry_created.call(this), null != this.texture && (this.set_uv(function(t) {
                var e;
                return null == t.options.uv && (t.options.uv = new I.Rectangle(0, 0, t.texture.width, t.texture.height)), e = t.options.uv
            }(this)), 5 == this.texture.resource_type && this.set_flipy(!0)), this.set_centered(!!this.centered), this.set_flipx(!!this.flipx), this.set_flipy(!!this.flipy)
        },
        set_geometry: function(t) {
            return this.geometry_quad = t, o.Visual.prototype.set_geometry.call(this, t)
        },
        point_inside: function(t) {
            return null == this.geometry ? !1 : m.utils.geometry.point_in_geometry(t, this.geometry)
        },
        set_uv: function(t) {
            return null != this.geometry_quad && this.geometry_quad.uv(t), this.uv = t, I.Rectangle.listen(this.uv, s(this, this._uv_change)), this.uv
        },
        set_flipy: function(t) {
            return t == this.flipy ? this.flipy : (null != this.geometry_quad && this.geometry_quad.set_flipy(t), this.flipy = t)
        },
        set_flipx: function(t) {
            return t == this.flipx ? this.flipx : (null != this.geometry_quad && this.geometry_quad.set_flipx(t), this.flipx = t)
        },
        set_size: function(t) {
            return null != this.geometry_quad && (this.geometry_quad.resize(new I.Vector(t.x, t.y)), this._has_custom_origin || this.centered && this.set_origin(new I.Vector(t.x, t.y, t.z, t.w).divideScalar(2))), o.Visual.prototype.set_size.call(this, t)
        },
        set_centered: function(t) {
            return null != this.size && this.set_origin(t ? new I.Vector(this.size.x / 2, this.size.y / 2) : new I.Vector), this.centered = t
        },
        _uv_change: function() {
            this.set_uv(this.uv)
        },
        init: function() {
            o.Visual.prototype.init.call(this)
        },
        ondestroy: function() {
            o.Visual.prototype.ondestroy.call(this)
        },
        __class__: o.Sprite,
        __properties__: t(o.Visual.prototype.__properties__, {
            set_uv: "set_uv",
            set_flipy: "set_flipy",
            set_flipx: "set_flipx",
            set_centered: "set_centered"
        })
    }), o.Text = function(t) {
        this.text_options = t, this.text_bounds = new I.Rectangle;
        var e = null;
        (null == t.no_batcher_add || 0 == t.no_batcher_add) && (e = null != t.batcher ? t.batcher : m.renderer.batcher), this.geom = new I.geometry.TextGeometry({
            batcher: e,
            depth: t.depth,
            group: t.group,
            visible: t.visible,
            immediate: t.immediate,
            color: t.color,
            shader: t.shader,
            texture: t.texture,
            text: t.text,
            font: t.font,
            point_size: t.point_size,
            line_spacing: t.line_spacing,
            letter_spacing: t.letter_spacing,
            bounds: t.bounds,
            bounds_wrap: t.bounds_wrap,
            align: t.align,
            align_vertical: t.align_vertical,
            sdf: t.sdf,
            smoothness: t.smoothness,
            thickness: t.thickness,
            outline: t.outline,
            outline_color: t.outline_color,
            glow_threshold: t.glow_threshold,
            glow_amount: t.glow_amount,
            glow_color: t.glow_color
        }), this.geom.emitter.on(1, s(this, this.on_geom_text_update)), t.geometry = this.geom, t.shader = this.geom.get_shader(), o.Visual.call(this, t), this._update_bounds()
    }, i["luxe.Text"] = o.Text, o.Text.__name__ = !0, o.Text.__super__ = o.Visual, o.Text.prototype = t(o.Visual.prototype, {
        set_text: function(t) {
            return this.geom.set_text(t)
        },
        get_bounds: function() {
            return this.geom.bounds
        },
        get_align: function() {
            return this.geom.align
        },
        get_align_vertical: function() {
            return this.geom.align_vertical
        },
        set_pos_from_transform: function(t) {
            o.Visual.prototype.set_pos_from_transform.call(this, t), this._update_bounds(), this.text_options.pos = this.get_pos()
        },
        on_geom_text_update: function() {
            this._update_bounds()
        },
        _update_bounds: function() {
            var t = this.get_pos().x,
                e = this.get_pos().y,
                s = this.geom.text_width,
                i = this.geom.text_height,
                n = this.geom.text_width,
                o = this.geom.text_height;
            if (null != this.get_bounds()) {
                o = this.get_bounds().h, n = this.get_bounds().w, t = this.get_bounds().x, e = this.get_bounds().y;
                var r = this.get_align();
                switch (r) {
                    case 2:
                        t += s / 2;
                        break;
                    case 1:
                        t += s;
                        break;
                    default:
                        t += 0
                }
                var a = this.get_align_vertical();
                switch (a) {
                    case 2:
                        e += o / 2 - i / 2;
                        break;
                    case 4:
                        e += o - i;
                        break;
                    default:
                        e += 0
                }
            } else {
                var l = this.get_align();
                switch (l) {
                    case 2:
                        t -= s / 2;
                        break;
                    case 1:
                        t -= s;
                        break;
                    default:
                        t -= 0
                }
                var h = this.get_align_vertical();
                switch (h) {
                    case 2:
                        e -= i / 2;
                        break;
                    case 4:
                        e -= i;
                        break;
                    default:
                        e -= 0
                }
            }
            this.text_bounds.set(t, e, s, i)
        },
        init: function() {
            o.Visual.prototype.init.call(this)
        },
        ondestroy: function() {
            o.Visual.prototype.ondestroy.call(this)
        },
        __class__: o.Text,
        __properties__: t(o.Visual.prototype.__properties__, {
            get_align_vertical: "get_align_vertical",
            get_align: "get_align",
            get_bounds: "get_bounds",
            set_text: "set_text"
        })
    }), o.Timer = function(t) {
        this.core = t, this.timers = []
    }, i["luxe.Timer"] = o.Timer, o.Timer.__name__ = !0, o.Timer.prototype = {
        init: function() {},
        destroy: function() {
            this.reset()
        },
        process: function() {},
        reset: function() {
            for (var t = 0, e = this.timers; t < e.length;) {
                var s = e[t];
                ++t, s.stop(), s = null
            }
            this.timers = null, this.timers = []
        },
        schedule: function(t, e, s) {
            null == s && (s = !1);
            var i = this,
                n = new C.api.Timer(t);
            return n.run = function() {
                s || (n.stop(), h.remove(i.timers, n)), e()
            }, this.timers.push(n), n
        },
        __class__: o.Timer
    }, o.components = {}, o.components.Components = function(t) {
        var e = new S.ds.StringMap;
        this.components = new o.structural.OrderedMap(e), this.entity = t
    }, i["luxe.components.Components"] = o.components.Components, o.components.Components.__name__ = !0, o.components.Components.prototype = {
        add: function(t) {
            return null == t ? t : (t.set_entity(this.entity), this.components.set(t.name, t), t.onadded(), this.entity.inited && t.init(), this.entity.started && t.onreset(), t)
        },
        get: function(t, e) {
            if (null == e && (e = !1), e) {
                var s = this.components.map.get(t);
                if (null != s) return s;
                for (var i = 0, n = this.entity.children; i < n.length;) {
                    var o = n[i];
                    ++i;
                    var r = o._components.get(t, !0);
                    if (null != r) return r
                }
                return null
            }
            return this.components.map.get(t)
        },
        __class__: o.components.Components
    }, o.debug = {}, o.debug.DebugView = function() {
        this.visible = !1
    }, i["luxe.debug.DebugView"] = o.debug.DebugView, o.debug.DebugView.__name__ = !0, o.debug.DebugView.__super__ = o.Objects, o.debug.DebugView.prototype = t(o.Objects.prototype, {
        process: function() {},
        onmousedown: function() {},
        onmousewheel: function() {},
        onmouseup: function() {},
        onmousemove: function() {},
        onkeydown: function() {},
        onkeyup: function() {},
        show: function() {
            this.visible = !0
        },
        hide: function() {
            this.visible = !1
        },
        __class__: o.debug.DebugView
    }), o.debug.Inspector = function() {}, i["luxe.debug.Inspector"] = o.debug.Inspector, o.debug.Inspector.__name__ = !0, o.debug.Inspector.prototype = {
        refresh: function() {
            null == this._window && this._create_window(), null != this.onrefresh && this.onrefresh()
        },
        show: function() {
            this.refresh(), this._window.set_visible(!0), this._title_text.set_visible(!0), this._version_text.set_visible(!0)
        },
        hide: function() {
            this._window.set_visible(!1), this._title_text.set_visible(!1), this._version_text.set_visible(!1)
        },
        _create_window: function() {
            null != this._window && this._window.destroy(), this._window = new o.Sprite({
                centered: !1,
                depth: 999.1,
                color: (new I.Color).rgb(1447449),
                size: this.size,
                pos: this.pos,
                no_scene: !0,
                batcher: this._batcher
            }), this._window.geometry.id = "debug.Inspector", this._window.set_locked(!0), this._title_text = new o.Text({
                name: "debug.title",
                batcher: this._batcher,
                no_scene: !0,
                depth: 999.2,
                color: (new I.Color).rgb(16121979),
                pos: new I.Vector(this.pos.x + 14, this.pos.y + 6),
                align: 0,
                font: this.font,
                text: this.title,
                point_size: 15,
                visible: !1
            }), this._version_text = new o.Text({
                name: "debug.version",
                batcher: this._batcher,
                no_scene: !0,
                depth: 999.2,
                color: (new I.Color).rgb(3355443),
                pos: new I.Vector(this.pos.x + (this.size.x - 14), this.pos.y + 6),
                align: 1,
                font: this.font,
                text: "" + m.build,
                point_size: 16,
                visible: !1
            }), null != this._title_text.geometry && (this._title_text.geometry.id = "debug.title.text"), null != this._version_text.geometry && (this._version_text.geometry.id = "debug.version.text")
        },
        __class__: o.debug.Inspector
    };
    var I = {};
    I.Color = function(t, e, s, i) {
        null == i && (i = 1), null == s && (s = 1), null == e && (e = 1), null == t && (t = 1), this.refreshing = !1, this.is_hsv = !1, this.is_hsl = !1, this.a = 1, this.b = 1, this.g = 1, this.r = 1, this.set_r(t), this.set_g(e), this.set_b(s), this.a = i
    }, i["phoenix.Color"] = I.Color, I.Color.__name__ = !0, I.Color.prototype = {
        set_r: function(t) {
            if (this.r = t, !this.refreshing)
                if (this.is_hsl) {
                    var e = this;
                    e.fromColor(this)
                } else if (this.is_hsv) {
                var s = this;
                s.fromColor(this)
            }
            return this.r
        },
        set_g: function(t) {
            if (this.g = t, !this.refreshing)
                if (this.is_hsl) {
                    var e = this;
                    e.fromColor(this)
                } else if (this.is_hsv) {
                var s = this;
                s.fromColor(this)
            }
            return this.g
        },
        set_b: function(t) {
            if (this.b = t, !this.refreshing)
                if (this.is_hsl) {
                    var e = this;
                    e.fromColor(this)
                } else if (this.is_hsv) {
                var s = this;
                s.fromColor(this)
            }
            return this.b
        },
        maxRGB: function() {
            return Math.max(this.r, Math.max(this.g, this.b))
        },
        minRGB: function() {
            return Math.min(this.r, Math.min(this.g, this.b))
        },
        tween: function(t, e, s) {
            if (null == s && (s = !0), null == t && (t = .5), null != e) {
                var i = this.r,
                    n = this.g,
                    r = this.b,
                    a = this.a,
                    l = !1,
                    h = !1,
                    c = !1,
                    _ = !1;
                A.Boot.__instanceof(e, I.Color) ? (i = e.r, n = e.g, r = e.b, a = e.a, l = !0, h = !0, c = !0, _ = !0) : (null != e.r && (i = e.r, l = !0), null != e.g && (n = e.g, h = !0), null != e.b && (r = e.b, c = !0), null != e.a && (a = e.a, _ = !0));
                var m = {};
                return l && (m.r = i), h && (m.g = n), c && (m.b = r), _ && (m.a = a), o.tween.Actuate.tween(this, t, m, s)
            }
            throw " Warning: Color.tween passed a null destination "
        },
        rgb: function(t) {
            return null == t && (t = 16777215), this.from_int(t), this
        },
        fromColorHSV: function(t) {
            var e = t.h % 360 / 60;
            0 > e && (e += 6);
            var s = Math.floor(e),
                i = s % 6,
                n = e - s,
                o = t.v,
                r = t.v * (1 - t.s),
                a = t.v * (1 - n * t.s),
                l = t.v * (1 - (1 - n) * t.s);
            switch (i) {
                case 0:
                    this.set_r(o), this.set_g(l), this.set_b(r);
                    break;
                case 1:
                    this.set_r(a), this.set_g(o), this.set_b(r);
                    break;
                case 2:
                    this.set_r(r), this.set_g(o), this.set_b(l);
                    break;
                case 3:
                    this.set_r(r), this.set_g(a), this.set_b(o);
                    break;
                case 4:
                    this.set_r(l), this.set_g(r), this.set_b(o);
                    break;
                case 5:
                    this.set_r(o), this.set_g(r), this.set_b(a)
            }
            this.a = t.a
        },
        fromColorHSL: function(t) {
            var e = 1;
            e = t.l < .5 ? t.l * (1 + t.s) : t.l + t.s - t.l * t.s;
            for (var s = 2 * t.l - e, i = t.h % 360 / 360, n = i + .3333333333333333, o = i, r = i - .3333333333333333, a = [n, o, r], l = 0, h = a.length; h > l;) {
                var c = l++,
                    _ = a[c];
                0 > _ && (_ += 1), _ > 1 && (_ -= 1), a[c] = .16666666666666666 > _ ? s + 6 * (e - s) * _ : .5 > _ ? e : .6666666666666666 > _ ? s + 6 * (e - s) * (.6666666666666666 - _) : s
            }
            return this.set_r(a[0]), this.set_g(a[1]), this.set_b(a[2]), this.a = t.a, this
        },
        from_int: function(t) {
            var e = t >> 16,
                s = t >> 8 & 255,
                i = 255 & t;
            this.set_r(e / 255), this.set_g(s / 255), this.set_b(i / 255)
        },
        __class__: I.Color,
        __properties__: {
            set_b: "set_b",
            set_g: "set_g",
            set_r: "set_r"
        }
    }, o.debug.SceneDebugView = function() {
        this.hide_ids = !0, this.margin = 32
    }, i["luxe.debug.SceneDebugView"] = o.debug.SceneDebugView, o.debug.SceneDebugView.__name__ = !0, o.debug.SceneDebugView.__super__ = o.debug.DebugView, o.debug.SceneDebugView.prototype = t(o.debug.DebugView.prototype, {
        add_scene: function(t) {
            if (-1 != h.indexOf(this.scenes, t, 0)) throw o.DebugError.assertion("scenes.indexOf(_scene) == -1");
            this.scenes.push(t)
        },
        remove_scene: function(t) {
            if (-1 == h.indexOf(this.scenes, t, 0)) throw o.DebugError.assertion("scenes.indexOf(_scene) != -1");
            var e = h.remove(this.scenes, t);
            return this.refresh(), e
        },
        onkeydown: function(t) {
            t.keycode == C.system.input.Keycodes.key_2 && this.visible && this.toggle_ids()
        },
        toggle_ids: function() {
            this.hide_ids = !this.hide_ids, this.refresh()
        },
        tabs: function(t) {
            for (var e = "", s = 0; t > s;) {
                {
                    s++
                }
                e += "    "
            }
            return e
        },
        list_entity: function(t, e, s) {
            null == s && (s = 1);
            var i;
            i = e.get_active() ? "" : "/ inactive";
            var n;
            n = 1 == s ? this.tabs(s) : this.tabs(s) + "> ";
            var o;
            o = this.hide_ids ? "" : e.get_id();
            var r = c.count(e._components.components),
                a = "??????? " + r,
                l = "> " + e.children.length;
            t += "" + n + o + " " + e.get_name() + " " + l + " " + a + " " + i + "\n";
            for (var _ = h.iter(e._components.components._keys); _.hasNext();) {
                var m, u = _.next(),
                    d = e._components.components.map.get(u);
                m = this.hide_ids ? "" : " " + d.id, t += this.tabs(s + 1) + ("???????" + m + " " + d.name + "\n")
            }
            for (var p = 0, y = e.children; p < y.length;) {
                var f = y[p];
                ++p, t = this.list_entity(t, f, s + 2)
            }
            return t
        },
        get_list: function() {
            for (var t = "", e = 0, s = this.scenes; e < s.length;) {
                var i = s[e];
                ++e;
                var n;
                n = this.hide_ids ? "" : "" + i.get_id() + " ", t += n, t += "" + i.get_name() + " ", t += "( " + i.get_length() + " )\n";
                for (var o = i.entities.iterator(); o.hasNext();) {
                    var r = o.next();
                    t = this.list_entity(t, r, null)
                }
            }
            return t
        },
        refresh: function() {
            this.items_list.set_text(this.get_list())
        },
        process: function() {
            if (this.visible) {
                for (var t = !1, e = 0, s = this.scenes; e < s.length;) {
                    var i = s[e];
                    ++e, i._has_changed && (t = !0, i._has_changed = !1)
                }
                t && this.refresh()
            }
        },
        onmousewheel: function(t) {
            var e = this.items_list.text_bounds.h,
                s = m.debug.debug_inspector.size.y - this.margin,
                i = e - s,
                n = this.items_list.get_pos().y,
                o = m.debug.padding.y + 1.5 * this.margin,
                r = o;
            i > 0 && (r = o - (i + 2 * this.margin)), n -= this.margin / 2 * t.y, n = r > n ? r : n > o ? o : n, this.items_list.get_pos().set_y(n)
        },
        show: function() {
            o.debug.DebugView.prototype.show.call(this), this.refresh(), this.items_list.set_visible(!0)
        },
        hide: function() {
            o.debug.DebugView.prototype.hide.call(this), this.items_list.set_visible(!1)
        },
        __class__: o.debug.SceneDebugView
    }), o.importers = {}, o.importers.bitmapfont = {}, o.importers.bitmapfont.BitmapFontParser = function() {}, i["luxe.importers.bitmapfont.BitmapFontParser"] = o.importers.bitmapfont.BitmapFontParser, o.importers.bitmapfont.BitmapFontParser.__name__ = !0, o.importers.bitmapfont.BitmapFontParser.parse = function(t) {
        if (0 == t.length) throw "BitmapFont:Parser: _font_data is 0 length";
        var e = {
                face: null,
                chars: new S.ds.IntMap,
                point_size: 0,
                base_size: 0,
                char_count: 0,
                line_height: 0,
                pages: [],
                kernings: new S.ds.IntMap
            },
            s = t.split("\n");
        if (0 == s.length) throw "BitmapFont; invalid font data specified for parser.";
        var i = s[0];
        if ("info" != function() {
                var t, e = b.ltrim(i);
                return t = h.substr(e, 0, 4)
            }(this)) throw "BitmapFont; invalid font data specified for parser. Format should be plain ascii text .fnt file only currently.";
        for (var n = 0; n < s.length;) {
            var r = s[n];
            ++n;
            for (var a = r.split(" "), l = 0; l < a.length;) {
                var c = a[l];
                ++l, o.importers.bitmapfont.BitmapFontParser.parse_token(c, a, e)
            }
        }
        return e
    }, o.importers.bitmapfont.BitmapFontParser.parse_token = function(t, e, s) {
        e.shift();
        var i = o.importers.bitmapfont.BitmapFontParser.tokenize_line(e);
        switch (t) {
            case "info":
                s.face = o.importers.bitmapfont.BitmapFontParser.unquote(i.get("face")), s.point_size = w.parseFloat(i.get("size"));
                break;
            case "common":
                s.line_height = w.parseFloat(i.get("lineHeight")), s.base_size = w.parseFloat(i.get("base"));
                break;
            case "page":
                s.pages.push({
                    id: w.parseInt(i.get("id")),
                    file: o.importers.bitmapfont.BitmapFontParser.trim(o.importers.bitmapfont.BitmapFontParser.unquote(i.get("file")))
                });
                break;
            case "chars":
                s.char_count = w.parseInt(i.get("count"));
                break;
            case "char":
                var n = {
                    id: w.parseInt(i.get("id")),
                    x: w.parseFloat(i.get("x")),
                    y: w.parseFloat(i.get("y")),
                    width: w.parseFloat(i.get("width")),
                    height: w.parseFloat(i.get("height")),
                    xoffset: w.parseFloat(i.get("xoffset")),
                    yoffset: w.parseFloat(i.get("yoffset")),
                    xadvance: w.parseFloat(i.get("xadvance")),
                    page: w.parseInt(i.get("page"))
                };
                s.chars.set(n.id, n);
                break;
            case "kerning":
                var r = w.parseInt(i.get("first")),
                    a = w.parseInt(i.get("second")),
                    l = w.parseFloat(i.get("amount")),
                    h = s.kernings.get(r);
                null == h && (h = new S.ds.IntMap, s.kernings.set(r, h)), h.set(a, l)
        }
    }, o.importers.bitmapfont.BitmapFontParser.tokenize_line = function(t) {
        for (var e = new S.ds.StringMap, s = 0; s < t.length;) {
            var i = t[s];
            ++s;
            var n = i.split("=");
            e.set(n[0], n[1])
        }
        return e
    }, o.importers.bitmapfont.BitmapFontParser.trim = function(t) {
        return b.trim(t)
    }, o.importers.bitmapfont.BitmapFontParser.unquote = function(t) {
        return -1 != t.indexOf('"') && (t = b.replace(t, '"', "")), t
    }, o.importers.texturepacker = {}, o.importers.texturepacker.TexturePackerData = function(t, e) {
        this.frames = e, this.meta = t, this.frame_map = new S.ds.StringMap;
        for (var s = 0, i = this.frames; s < i.length;) {
            var n = i[s];
            ++s;
            var o = S.io.Path.withoutExtension(n.filename);
            this.frame_map.set(o, n)
        }
    }, i["luxe.importers.texturepacker.TexturePackerData"] = o.importers.texturepacker.TexturePackerData, o.importers.texturepacker.TexturePackerData.__name__ = !0, o.importers.texturepacker.TexturePackerData.prototype = {
        __class__: o.importers.texturepacker.TexturePackerData
    }, o.importers.texturepacker.TexturePackerJSONType = i["luxe.importers.texturepacker.TexturePackerJSONType"] = {
        __ename__: !0,
        __constructs__: ["hash", "array"]
    }, o.importers.texturepacker.TexturePackerJSONType.hash = ["hash", 0], o.importers.texturepacker.TexturePackerJSONType.hash.toString = n, o.importers.texturepacker.TexturePackerJSONType.hash.__enum__ = o.importers.texturepacker.TexturePackerJSONType, o.importers.texturepacker.TexturePackerJSONType.array = ["array", 1], o.importers.texturepacker.TexturePackerJSONType.array.toString = n, o.importers.texturepacker.TexturePackerJSONType.array.__enum__ = o.importers.texturepacker.TexturePackerJSONType, o.importers.texturepacker.TexturePackerJSON = function() {}, i["luxe.importers.texturepacker.TexturePackerJSON"] = o.importers.texturepacker.TexturePackerJSON, o.importers.texturepacker.TexturePackerJSON.__name__ = !0, o.importers.texturepacker.TexturePackerJSON.parse = function(t, e) {
        var s = null != x.field(t, "frames"),
            i = null != x.field(t, "meta");
        if (!s) return null;
        var n = null,
            r = null;
        if (i && (n = o.importers.texturepacker.TexturePackerJSON.parse_meta(t.meta)), null == e) {
            var a = t.frames instanceof Array && null == t.frames.__enum__;
            if (a) e = o.importers.texturepacker.TexturePackerJSONType.array;
            else {
                {
                    A.Boot.__instanceof(t.frames, z)
                }
                e = o.importers.texturepacker.TexturePackerJSONType.hash
            }
        }
        switch (e[1]) {
            case 0:
                r = o.importers.texturepacker.TexturePackerJSON.parse_frames_hash(t.frames);
                break;
            case 1:
                r = o.importers.texturepacker.TexturePackerJSON.parse_frames_array(t.frames)
        }
        return r.sort(function(t, e) {
            return t.filename < e.filename ? -1 : 1
        }), new o.importers.texturepacker.TexturePackerData(n, r)
    }, o.importers.texturepacker.TexturePackerJSON.parse_frame = function(t, e) {
        if (null == e) return null;
        var s = o.importers.texturepacker.TexturePackerJSON.parse_rect(x.field(e, "frame")),
            i = o.importers.texturepacker.TexturePackerJSON.parse_rect(x.field(e, "spriteSourceSize")),
            n = o.importers.texturepacker.TexturePackerJSON.parse_size(x.field(e, "sourceSize")),
            r = x.field(e, "rotated"),
            a = x.field(e, "trimmed");
        return {
            filename: t,
            frame: s,
            sourceSize: n,
            spriteSourceSize: i,
            rotated: r,
            trimmed: a,
            uv: new I.Rectangle(s.x, s.y, s.w, s.h),
            size: new I.Vector(i.w, i.h),
            origin: new I.Vector(n.w - i.w, n.h - i.h)
        }
    }, o.importers.texturepacker.TexturePackerJSON.parse_frames_hash = function(t) {
        if (null == t) return null;
        for (var e = [], s = 0, i = x.fields(t); s < i.length;) {
            var n = i[s];
            ++s;
            var r = x.field(t, n);
            e.push(o.importers.texturepacker.TexturePackerJSON.parse_frame(n, r))
        }
        return e
    }, o.importers.texturepacker.TexturePackerJSON.parse_frames_array = function(t) {
        if (null == t) return null;
        for (var e = [], s = t, i = 0; i < s.length;) {
            var n = s[i];
            ++i;
            var r = x.field(n, "filename");
            e.push(o.importers.texturepacker.TexturePackerJSON.parse_frame(r, n))
        }
        return e
    }, o.importers.texturepacker.TexturePackerJSON.parse_meta = function(t) {
        if (null == t) return null;
        var e = x.field(t, "app"),
            s = x.field(t, "version"),
            i = x.field(t, "image"),
            n = x.field(t, "format"),
            r = x.field(t, "size"),
            a = x.field(t, "scale");
        return {
            app: e,
            version: s,
            image: i,
            format: n,
            size: o.importers.texturepacker.TexturePackerJSON.parse_size(r),
            scale: w.parseFloat(a)
        }
    }, o.importers.texturepacker.TexturePackerJSON.parse_rect = function(t) {
        if (null == t) return null;
        var e = w.parseFloat(x.field(t, "x")),
            s = w.parseFloat(x.field(t, "y")),
            i = w.parseFloat(x.field(t, "w")),
            n = w.parseFloat(x.field(t, "h"));
        return {
            x: e,
            y: s,
            w: i,
            h: n
        }
    }, o.importers.texturepacker.TexturePackerJSON.parse_size = function(t) {
        if (null == t) return null;
        var e = w.parseFloat(x.field(t, "w")),
            s = w.parseFloat(x.field(t, "h"));
        return {
            w: e,
            h: s
        }
    }, o.resource = {}, o.resource.Resource = function(t) {
        if (this.ref = 0, null == t) throw o.DebugError.null_assertion("_options was null");
        if (null == t.id) throw o.DebugError.null_assertion("_options.id was null");
        null == t.system && (t.system = m.resources), t.system, null == t.resource_type && (t.resource_type = 0), t.resource_type, this.id = t.id, this.system = t.system, this.resource_type = t.resource_type, this.set_state(0), this.set_ref(1)
    }, i["luxe.resource.Resource"] = o.resource.Resource, o.resource.Resource.__name__ = !0, o.resource.Resource.prototype = {
        destroy: function(t) {
            if (null == t && (t = !1), 6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            if (!t) {
                if (!(this.ref > 0)) throw o.DebugError.assertion("ref > 0");
                var e = this,
                    s = e.ref;
                if (e.set_ref(s - 1), !(this.ref >= 0)) throw o.DebugError.assertion("ref >= 0")
            }(0 == this.ref || t) && (this.clear(), this.set_state(6), this.system.remove(this), this.system.emit(8, this))
        },
        set_ref: function(t) {
            var e = this.ref;
            return this.ref = t, this.ref > e ? this.system.emit(9, this) : this.ref < e && this.system.emit(10, this), this.ref
        },
        set_state: function(t) {
            this.state = t;
            var e = this.state;
            switch (e) {
                case 2:
                    this.system.emit(3, this);
                    break;
                case 3:
                    this.system.emit(4, this);
                    break;
                case 4:
                    this.system.emit(5, this)
            }
            return this.state
        },
        clear: function() {},
        __class__: o.resource.Resource,
        __properties__: {
            set_ref: "set_ref",
            set_state: "set_state"
        }
    }, o.resource.BytesResource = function(t) {
        if (null == t) throw o.DebugError.null_assertion("_options was null");
        t.resource_type = 3, o.resource.Resource.call(this, t), this.asset = t.asset
    }, i["luxe.resource.BytesResource"] = o.resource.BytesResource, o.resource.BytesResource.__name__ = !0, o.resource.BytesResource.__super__ = o.resource.Resource, o.resource.BytesResource.prototype = t(o.resource.Resource.prototype, {
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = C.system.assets.AssetBytes.load(m.core.app.assets, t.id);
                i.then(function(s) {
                    t.asset = s, t.set_state(3), e(t)
                }), i.error(function(e) {
                    t.set_state(4), s(e)
                })
            })
        },
        clear: function() {
            null != this.asset && (this.asset.destroy(), this.asset = null)
        },
        __class__: o.resource.BytesResource
    }), o.resource.TextResource = function(t) {
        if (null == t) throw o.DebugError.null_assertion("_options was null");
        t.resource_type = 1, o.resource.Resource.call(this, t), this.asset = t.asset
    }, i["luxe.resource.TextResource"] = o.resource.TextResource, o.resource.TextResource.__name__ = !0, o.resource.TextResource.__super__ = o.resource.Resource, o.resource.TextResource.prototype = t(o.resource.Resource.prototype, {
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = C.system.assets.AssetText.load(m.core.app.assets, t.id);
                i.then(function(s) {
                    t.asset = s, t.set_state(3), e(t)
                }), i.error(function(e) {
                    t.set_state(4), s(e)
                })
            })
        },
        clear: function() {
            null != this.asset && (this.asset.destroy(), this.asset = null)
        },
        __class__: o.resource.TextResource
    }), o.resource.JSONResource = function(t) {
        if (null == t) throw o.DebugError.null_assertion("_options was null");
        t.resource_type = 2, o.resource.Resource.call(this, t), this.asset = t.asset
    }, i["luxe.resource.JSONResource"] = o.resource.JSONResource, o.resource.JSONResource.__name__ = !0, o.resource.JSONResource.__super__ = o.resource.Resource, o.resource.JSONResource.prototype = t(o.resource.Resource.prototype, {
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = C.system.assets.AssetJSON.load(m.core.app.assets, t.id);
                i.then(function(s) {
                    t.asset = s, t.set_state(3), e(t)
                }), i.error(function(e) {
                    t.set_state(4), s(e)
                })
            })
        },
        clear: function() {
            null != this.asset && (this.asset.destroy(), this.asset = null)
        },
        __class__: o.resource.JSONResource
    }), o.structural = {}, o.structural.BalancedBSTTraverseMethod = i["luxe.structural.BalancedBSTTraverseMethod"] = {
        __ename__: !0,
        __constructs__: ["order_pre", "order_retain", "order_post"]
    }, o.structural.BalancedBSTTraverseMethod.order_pre = ["order_pre", 0], o.structural.BalancedBSTTraverseMethod.order_pre.toString = n, o.structural.BalancedBSTTraverseMethod.order_pre.__enum__ = o.structural.BalancedBSTTraverseMethod, o.structural.BalancedBSTTraverseMethod.order_retain = ["order_retain", 1], o.structural.BalancedBSTTraverseMethod.order_retain.toString = n, o.structural.BalancedBSTTraverseMethod.order_retain.__enum__ = o.structural.BalancedBSTTraverseMethod, o.structural.BalancedBSTTraverseMethod.order_post = ["order_post", 2], o.structural.BalancedBSTTraverseMethod.order_post.toString = n, o.structural.BalancedBSTTraverseMethod.order_post.__enum__ = o.structural.BalancedBSTTraverseMethod, o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry = function(t, e, s, i) {
        this.left = null, this.right = null, this.key = t, this.value = e, this.nodecount = s, this.color = i
    }, i["luxe.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"] = o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry, o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry.__name__ = !0, o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry.prototype = {
        __class__: o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry
    }, o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry = function(t) {
        this.compare = t, this._array = []
    }, i["luxe.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry"] = o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry, o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry.__name__ = !0, o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry.prototype = {
        size: function() {
            return this.node_count(this.root)
        },
        insert: function(t, e) {
            this.root = this.node_insert(this.root, t, e), this.root.color = !1, this._array = null, this._array = this.toArray()
        },
        contains: function(t) {
            return null != this.find(t)
        },
        find: function(t) {
            return this.node_find(this.root, t)
        },
        remove: function(t) {
            return this.is_red(this.root.left) || this.is_red(this.root.right) || (this.root.color = !0), this.contains(t) ? (this.root = this.node_remove(this.root, t), null != this.root && (this.root.color = !1), this._array = null, this._array = this.toArray(), !0) : !1
        },
        toArray: function() {
            var t = new Array;
            return this.traverse_node(this.root, o.structural.BalancedBSTTraverseMethod.order_retain, function(e) {
                t.push(e.value)
            }), t
        },
        iterator: function() {
            return h.iter(this._array)
        },
        traverse_node: function(t, e, s) {
            if (null != t) switch (e[1]) {
                case 0:
                    s(t), this.traverse_node(t.left, e, s), this.traverse_node(t.right, e, s);
                    break;
                case 1:
                    this.traverse_node(t.left, e, s), s(t), this.traverse_node(t.right, e, s);
                    break;
                case 2:
                    this.traverse_node(t.left, e, s), this.traverse_node(t.right, e, s), s(t)
            }
        },
        node_count: function(t) {
            return null == t ? 0 : t.nodecount
        },
        node_insert: function(t, e, s) {
            if (null == t) return new o.structural.BalancedBSTNode_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry(e, s, 1, !0);
            var i = this.compare(e, t.key);
            return 0 > i ? t.left = this.node_insert(t.left, e, s) : i > 0 ? t.right = this.node_insert(t.right, e, s) : t.value = s, this.is_red(t.right) && !this.is_red(t.left) && (t = this.rotate_left(t)), this.is_red(t.left) && this.is_red(t.left.left) && (t = this.rotate_right(t)), this.is_red(t.left) && this.is_red(t.right) && this.swap_color(t), this.node_update_count(t), t
        },
        node_update_count: function(t) {
            return t.nodecount = this.node_count(t.left) + this.node_count(t.right) + 1, t
        },
        node_find: function(t, e) {
            if (null == t) return null;
            var s = this.compare(e, t.key);
            return 0 > s ? this.node_find(t.left, e) : s > 0 ? this.node_find(t.right, e) : t.value
        },
        node_smallest: function(t) {
            return null == t.left ? t : this.node_smallest(t.left)
        },
        node_remove_smallest: function(t) {
            return null == t.left ? null : (this.is_red(t.left) || this.is_red(t.left.left) || (t = this.move_red_left(t)), t.left = this.node_remove_smallest(t.left), this.node_update_count(t), this.balance(t))
        },
        node_remove: function(t, e) {
            var s = this.compare(e, t.key);
            if (0 > s) this.is_red(t.left) || this.is_red(t.left.left) || (t = this.move_red_left(t)), t.left = this.node_remove(t.left, e);
            else {
                this.is_red(t.left) && (t = this.rotate_right(t));
                var i = this.compare(e, t.key);
                if (0 == i && null == t.right) return null;
                this.is_red(t.right) || this.is_red(t.right.left) || (t = this.move_red_right(t));
                var n = this.compare(e, t.key);
                if (0 == n) {
                    var o = this.node_smallest(t.right);
                    t.key = o.key, t.value = o.value, t.right = this.node_remove_smallest(t.right)
                } else t.right = this.node_remove(t.right, e)
            }
            return this.balance(t)
        },
        is_red: function(t) {
            return null == t ? !1 : 1 == t.color
        },
        rotate_left: function(t) {
            var e = t.right;
            return e.color = t.color, t.color = !0, t.right = e.left, e.left = t, e.nodecount = t.nodecount, this.node_update_count(t), e
        },
        rotate_right: function(t) {
            var e = t.left;
            return e.color = t.color, t.color = !0, t.left = e.right, e.right = t, e.nodecount = t.nodecount, this.node_update_count(t), e
        },
        swap_color: function(t) {
            t.color = !t.color, t.left.color = !t.left.color, t.right.color = !t.right.color
        },
        move_red_left: function(t) {
            return this.swap_color(t), this.is_red(t.right.left) && (t.right = this.rotate_right(t.right), t = this.rotate_left(t)), t
        },
        move_red_right: function(t) {
            return this.swap_color(t), this.is_red(t.left.left) && (t = this.rotate_right(t)), t
        },
        balance: function(t) {
            return this.is_red(t.right) && (t = this.rotate_left(t)), this.is_red(t.left) && this.is_red(t.left.left) && (t = this.rotate_right(t)), this.is_red(t.left) && this.is_red(t.right) && this.swap_color(t), this.node_update_count(t), t
        },
        __class__: o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry
    }, o.structural.OrderedMapIterator = function(t) {
        this.index = 0, this.map = t
    }, i["luxe.structural.OrderedMapIterator"] = o.structural.OrderedMapIterator, o.structural.OrderedMapIterator.__name__ = !0, o.structural.OrderedMapIterator.prototype = {
        hasNext: function() {
            return this.index < this.map._keys.length
        },
        next: function() {
            return this.map.get(this.map._keys[this.index++])
        },
        __class__: o.structural.OrderedMapIterator
    }, o.structural.OrderedMap = function(t) {
        this._keys = [], this.map = t
    }, i["luxe.structural.OrderedMap"] = o.structural.OrderedMap, o.structural.OrderedMap.__name__ = !0, o.structural.OrderedMap.__interfaces__ = [f], o.structural.OrderedMap.prototype = {
        set: function(t, e) {
            this.map.exists(t) || this._keys.push(t), this.map.set(t, e)
        },
        iterator: function() {
            return new o.structural.OrderedMapIterator(this)
        },
        remove: function(t) {
            return this.map.remove(t) && h.remove(this._keys, t)
        },
        exists: function(t) {
            return this.map.exists(t)
        },
        get: function(t) {
            return this.map.get(t)
        },
        __class__: o.structural.OrderedMap
    }, o.tween = {}, o.tween.actuators = {}, o.tween.actuators.IGenericActuator = function() {}, i["luxe.tween.actuators.IGenericActuator"] = o.tween.actuators.IGenericActuator, o.tween.actuators.IGenericActuator.__name__ = !0, o.tween.actuators.IGenericActuator.prototype = {
        __class__: o.tween.actuators.IGenericActuator
    }, o.tween.actuators.GenericActuator = function(t, e, s) {
        this.timescaled = !1, this._autoVisible = !0, this._delay = 0, this._reflect = !1, this._repeat = 0, this._reverse = !1, this._smartRotation = !1, this._snapping = !1, this.special = !1, this.target = t, this.properties = s, this.duration = e, this._ease = o.tween.Actuate.defaultEase
    }, i["luxe.tween.actuators.GenericActuator"] = o.tween.actuators.GenericActuator, o.tween.actuators.GenericActuator.__name__ = !0, o.tween.actuators.GenericActuator.__interfaces__ = [o.tween.actuators.IGenericActuator], o.tween.actuators.GenericActuator.prototype = {
        apply: function() {
            for (var t = 0, e = x.fields(this.properties); t < e.length;) {
                var s = e[t];
                ++t, Object.prototype.hasOwnProperty.call(this.target, s) ? x.setField(this.target, s, x.field(this.properties, s)) : x.setProperty(this.target, s, x.field(this.properties, s))
            }
        },
        autoVisible: function(t) {
            return null == t && (t = !0), this._autoVisible = t, this
        },
        callMethod: function(t, e) {
            return null == e && (e = []), t.apply(t, e)
        },
        change: function() {
            null != this._onUpdate && this.callMethod(this._onUpdate, this._onUpdateParams)
        },
        complete: function(t) {
            null == t && (t = !0), t && (this.change(), null != this._onComplete && this.callMethod(this._onComplete, this._onCompleteParams)), o.tween.Actuate.unload(this)
        },
        delay: function(t) {
            return this._delay = t, this
        },
        ease: function(t) {
            return this._ease = t, this
        },
        move: function() {},
        timescale: function(t) {
            return null == t && (t = !0), this.timescaled = t, this
        },
        onComplete: function(t, e) {
            return this._onComplete = t, this._onCompleteParams = null == e ? [] : e, 0 == this.duration && this.complete(), this
        },
        onRepeat: function(t, e) {
            return this._onRepeat = t, this._onRepeatParams = null == e ? [] : e, this
        },
        onUpdate: function(t, e) {
            return this._onUpdate = t, this._onUpdateParams = null == e ? [] : e, this
        },
        pause: function() {},
        reflect: function(t) {
            return null == t && (t = !0), this._reflect = t, this.special = !0, this
        },
        repeat: function(t) {
            return null == t && (t = -1), this._repeat = t, this
        },
        resume: function() {},
        reverse: function(t) {
            return null == t && (t = !0), this._reverse = t, this.special = !0, this
        },
        smartRotation: function(t) {
            return null == t && (t = !0), this._smartRotation = t, this.special = !0, this
        },
        snapping: function(t) {
            return null == t && (t = !0), this._snapping = t, this.special = !0, this
        },
        stop: function() {},
        __class__: o.tween.actuators.GenericActuator
    }, o.tween.actuators.SimpleActuator = function(t, e, s) {
        this.has_timescaled_starttime = !1, this.active = !0, this.propertyDetails = new Array, this.sendChange = !1, this.paused = !1, this.cacheVisible = !1, this.initialized = !1, this.setVisible = !1, this.toggleVisible = !1, this.startTime = C.Snow.core.timestamp(), o.tween.actuators.GenericActuator.call(this, t, e, s), o.tween.actuators.SimpleActuator.addedEvent || (o.tween.actuators.SimpleActuator.addedEvent = !0, m.on(4, o.tween.actuators.SimpleActuator.on_internal_update))
    }, i["luxe.tween.actuators.SimpleActuator"] = o.tween.actuators.SimpleActuator, o.tween.actuators.SimpleActuator.__name__ = !0, o.tween.actuators.SimpleActuator.on_internal_update = function(t) {
        o.tween.actuators.SimpleActuator.update_timer += t, o.tween.actuators.SimpleActuator.current_time = C.Snow.core.timestamp();
        for (var e, s = o.tween.actuators.SimpleActuator.current_time, i = 0, n = 0, r = o.tween.actuators.SimpleActuator.actuatorsLength; r > n;) {
            {
                n++
            }
            e = o.tween.actuators.SimpleActuator.actuators[i], null != e && e.active ? (s = e.timescaled ? o.tween.actuators.SimpleActuator.update_timer : o.tween.actuators.SimpleActuator.current_time, e.timescaled && !e.has_timescaled_starttime && (e.has_timescaled_starttime = !0, e.startTime = o.tween.actuators.SimpleActuator.update_timer, e.timeOffset = e.startTime), s > e.timeOffset && e.update(s), i++) : (o.tween.actuators.SimpleActuator.actuators.splice(i, 1), --o.tween.actuators.SimpleActuator.actuatorsLength)
        }
    }, o.tween.actuators.SimpleActuator.__super__ = o.tween.actuators.GenericActuator, o.tween.actuators.SimpleActuator.prototype = t(o.tween.actuators.GenericActuator.prototype, {
        autoVisible: function(t) {
            return null == t && (t = !0), this._autoVisible = t, t || (this.toggleVisible = !1, this.setVisible && this.setField(this.target, "visible", this.cacheVisible)), this
        },
        delay: function(t) {
            return this._delay = t, this.timeOffset = this.startTime + t, this
        },
        getField: function(t, e) {
            var s = null;
            return s = Object.prototype.hasOwnProperty.call(t, e) ? x.field(t, e) : x.getProperty(t, e)
        },
        initialize: function() {
            for (var t, e, s = 0, i = x.fields(this.properties); s < i.length;) {
                var n = i[s];
                ++s;
                var r = !0;
                !Object.prototype.hasOwnProperty.call(this.target, n) || this.target.__properties__ && this.target.__properties__["set_" + n] ? (r = !1, e = x.getProperty(this.target, n)) : e = x.field(this.target, n), "number" == typeof e && (t = new o.tween.actuators.PropertyDetails(this.target, n, e, this.getField(this.properties, n) - e, r), this.propertyDetails.push(t))
            }
            this.detailsLength = this.propertyDetails.length, this.initialized = !0
        },
        move: function() {
            this.toggleVisible = Object.prototype.hasOwnProperty.call(this.properties, "alpha") && Object.prototype.hasOwnProperty.call(this.properties, "visible"), this.toggleVisible && 0 != this.properties.alpha && !this.getField(this.target, "visible") && (this.setVisible = !0, this.cacheVisible = this.getField(this.target, "visible"), this.setField(this.target, "visible", !0)), this.timeOffset = this.startTime, o.tween.actuators.SimpleActuator.actuators.push(this), ++o.tween.actuators.SimpleActuator.actuatorsLength
        },
        onUpdate: function(t, e) {
            return this._onUpdate = t, this._onUpdateParams = null == e ? [] : e, this.sendChange = !0, this
        },
        pause: function() {
            this.paused = !0, this.pauseTime = this.timescaled ? o.tween.actuators.SimpleActuator.update_timer : o.tween.actuators.SimpleActuator.current_time
        },
        resume: function() {
            this.paused && (this.paused = !1, this.timeOffset += ((this.timescaled ? o.tween.actuators.SimpleActuator.update_timer : o.tween.actuators.SimpleActuator.current_time) - this.pauseTime) / 1e3)
        },
        setField: function(t, e, s) {
            Object.prototype.hasOwnProperty.call(t, e) ? t[e] = s : x.setProperty(t, e, s)
        },
        setProperty: function(t, e) {
            t.isField ? x.setProperty(t.target, t.propertyName, e) : x.setProperty(t.target, t.propertyName, e)
        },
        stop: function(t, e, s) {
            if (this.active) {
                if (null == t) return this.active = !1, e && this.apply(), void this.complete(s);
                for (var i = 0, n = x.fields(t); i < n.length;) {
                    var o = n[i];
                    if (++i, Object.prototype.hasOwnProperty.call(this.properties, o)) return this.active = !1, e && this.apply(), void this.complete(s)
                }
            }
        },
        update: function(t) {
            if (!this.paused) {
                var e, s, i = (t - this.timeOffset) / this.duration;
                if (i > 1 && (i = 1), this.initialized || this.initialize(), this.special) {
                    s = this._ease.calculate(this._reverse ? 1 - i : i);
                    for (var n, o = 0, r = this.detailsLength; r > o;) {
                        var a = o++;
                        if (e = this.propertyDetails[a], !this._smartRotation || "rotation" != e.propertyName && "rotationX" != e.propertyName && "rotationY" != e.propertyName && "rotationZ" != e.propertyName) n = e.start + e.change * s;
                        else {
                            var l = e.change % 360;
                            l > 180 ? l -= 360 : -180 > l && (l += 360), n = e.start + l * s
                        }
                        this._snapping ? this.setProperty(e, Math.round(n)) : e.isField ? x.setProperty(e.target, e.propertyName, n) : x.setProperty(e.target, e.propertyName, n)
                    }
                } else {
                    s = this._ease.calculate(i);
                    for (var h = 0, c = this.detailsLength; c > h;) {
                        var _ = h++;
                        e = this.propertyDetails[_], this.setProperty(e, e.start + e.change * s)
                    }
                }
                if (1 == i) {
                    if (0 == this._repeat) return this.active = !1, this.toggleVisible && 0 == this.getField(this.target, "alpha") && this.setField(this.target, "visible", !1), void this.complete(!0);
                    null != this._onRepeat && this.callMethod(this._onRepeat, this._onRepeatParams), this._reflect && (this._reverse = !this._reverse), this.startTime = t, this.timeOffset = this.startTime + this._delay, this._repeat > 0 && this._repeat--
                }
                this.sendChange && this.change()
            }
        },
        __class__: o.tween.actuators.SimpleActuator
    }), o.tween.easing = {}, o.tween.easing.Quad = function() {}, i["luxe.tween.easing.Quad"] = o.tween.easing.Quad, o.tween.easing.Quad.__name__ = !0, o.tween.easing.Quad.__properties__ = {
        get_easeOut: "get_easeOut",
        get_easeIn: "get_easeIn"
    }, o.tween.easing.Quad.get_easeIn = function() {
        return new o.tween.easing.QuadEaseIn
    }, o.tween.easing.Quad.get_easeOut = function() {
        return new o.tween.easing.QuadEaseOut
    }, o.tween.easing.IEasing = function() {}, i["luxe.tween.easing.IEasing"] = o.tween.easing.IEasing, o.tween.easing.IEasing.__name__ = !0, o.tween.easing.IEasing.prototype = {
        __class__: o.tween.easing.IEasing
    }, o.tween.easing.QuadEaseOut = function() {}, i["luxe.tween.easing.QuadEaseOut"] = o.tween.easing.QuadEaseOut, o.tween.easing.QuadEaseOut.__name__ = !0, o.tween.easing.QuadEaseOut.__interfaces__ = [o.tween.easing.IEasing], o.tween.easing.QuadEaseOut.prototype = {
        calculate: function(t) {
            return -t * (t - 2)
        },
        __class__: o.tween.easing.QuadEaseOut
    }, o.tween.Actuate = function() {}, i["luxe.tween.Actuate"] = o.tween.Actuate, o.tween.Actuate.__name__ = !0, o.tween.Actuate.apply = function(t, e, s) {
        o.tween.Actuate.stop(t, e), null == s && (s = o.tween.Actuate.defaultActuator);
        var i = B.createInstance(s, [t, 0, e]);
        return i.apply(), i
    }, o.tween.Actuate.getLibrary = function(t, e) {
        return null == e && (e = !0), !o.tween.Actuate.targetLibraries.exists(t) && e && o.tween.Actuate.targetLibraries.set(t, new Array), o.tween.Actuate.targetLibraries.get(t)
    }, o.tween.Actuate.stop = function(t, e, s, i) {
        if (null == i && (i = !0), null == s && (s = !1), null != t)
            if (A.Boot.__instanceof(t, o.tween.actuators.GenericActuator)) A.Boot.__cast(t, o.tween.actuators.GenericActuator).stop(null, s, i);
            else {
                var n = o.tween.Actuate.getLibrary(t, !1);
                if (null != n) {
                    if ("string" == typeof e) {
                        var r = {};
                        x.setField(r, e, null), e = r
                    } else if (e instanceof Array && null == e.__enum__) {
                        var a, l = {},
                            h = 0;
                        for (a = A.Boot.__cast(e, Array); h < a.length;) {
                            var c = a[h];
                            ++h, x.setField(l, c, null)
                        }
                        e = l
                    }
                    for (var _ = n.length - 1; _ >= 0;) n[_].stop(e, s, i), _--
                }
            }
    }, o.tween.Actuate.tween = function(t, e, s, i, n) {
        if (null == i && (i = !0), null != t) {
            if (e > 0) {
                null == n && (n = o.tween.Actuate.defaultActuator);
                var r = B.createInstance(n, [t, e, s]),
                    a = o.tween.Actuate.getLibrary(r.target);
                if (i) {
                    for (var l = a.length - 1; l >= 0;) a[l].stop(r.properties, !1, !1), l--;
                    a = o.tween.Actuate.getLibrary(r.target)
                }
                return a.push(r), r.move(), r
            }
            return o.tween.Actuate.apply(t, s, n)
        }
        return null
    }, o.tween.Actuate.unload = function(t) {
        var e = t.target;
        null != o.tween.Actuate.targetLibraries.h.__keys__[e.__id__] && (h.remove(o.tween.Actuate.targetLibraries.h[e.__id__], t), 0 == o.tween.Actuate.targetLibraries.h[e.__id__].length && o.tween.Actuate.targetLibraries.remove(e))
    }, o.tween.IComponentPath = function() {}, i["luxe.tween.IComponentPath"] = o.tween.IComponentPath, o.tween.IComponentPath.__name__ = !0, o.tween.IComponentPath.prototype = {
        __class__: o.tween.IComponentPath
    }, o.tween.actuators.MethodActuator = function(t, e, s) {
        this.currentParameters = new Array, this.tweenProperties = {}, o.tween.actuators.SimpleActuator.call(this, t, e, s), Object.prototype.hasOwnProperty.call(s, "start") || (this.properties.start = new Array), Object.prototype.hasOwnProperty.call(s, "end") || (this.properties.end = this.properties.start);
        for (var i = 0, n = this.properties.start.length; n > i;) {
            {
                i++
            }
            this.currentParameters.push(null)
        }
    }, i["luxe.tween.actuators.MethodActuator"] = o.tween.actuators.MethodActuator, o.tween.actuators.MethodActuator.__name__ = !0, o.tween.actuators.MethodActuator.__super__ = o.tween.actuators.SimpleActuator, o.tween.actuators.MethodActuator.prototype = t(o.tween.actuators.SimpleActuator.prototype, {
        apply: function() {
            this.callMethod(this.target, this.properties.end)
        },
        complete: function(t) {
            null == t && (t = !0);
            for (var e = 0, s = this.properties.start.length; s > e;) {
                var i = e++;
                this.currentParameters[i] = x.field(this.tweenProperties, "param" + i)
            }
            this.callMethod(this.target, this.currentParameters), o.tween.actuators.SimpleActuator.prototype.complete.call(this, t)
        },
        initialize: function() {
            for (var t, e, s, i = 0, n = this.properties.start.length; n > i;) {
                var r = i++;
                e = "param" + r, s = this.properties.start[r], this.tweenProperties[e] = s, ("number" == typeof s || (0 | s) === s) && (t = new o.tween.actuators.PropertyDetails(this.tweenProperties, e, s, this.properties.end[r] - s), this.propertyDetails.push(t))
            }
            this.detailsLength = this.propertyDetails.length, this.initialized = !0
        },
        update: function(t) {
            if (o.tween.actuators.SimpleActuator.prototype.update.call(this, t), this.active) {
                for (var e = 0, s = this.properties.start.length; s > e;) {
                    var i = e++;
                    this.currentParameters[i] = x.field(this.tweenProperties, "param" + i)
                }
                this.callMethod(this.target, this.currentParameters)
            }
        },
        __class__: o.tween.actuators.MethodActuator
    }), o.tween.actuators.MotionPathActuator = function(t, e, s) {
        o.tween.actuators.SimpleActuator.call(this, t, e, s)
    }, i["luxe.tween.actuators.MotionPathActuator"] = o.tween.actuators.MotionPathActuator, o.tween.actuators.MotionPathActuator.__name__ = !0, o.tween.actuators.MotionPathActuator.__super__ = o.tween.actuators.SimpleActuator, o.tween.actuators.MotionPathActuator.prototype = t(o.tween.actuators.SimpleActuator.prototype, {
        apply: function() {
            for (var t = 0, e = x.fields(this.properties); t < e.length;) {
                var s = e[t];
                ++t, Object.prototype.hasOwnProperty.call(this.target, s) ? x.setField(this.target, s, A.Boot.__cast(x.field(this.properties, s), o.tween.IComponentPath).get_end()) : x.setProperty(this.target, s, A.Boot.__cast(x.field(this.properties, s), o.tween.IComponentPath).get_end())
            }
        },
        initialize: function() {
            for (var t, e, s = 0, i = x.fields(this.properties); s < i.length;) {
                var n = i[s];
                if (++s, e = A.Boot.__cast(x.field(this.properties, n), o.tween.IComponentPath), null != e) {
                    var r = !0;
                    Object.prototype.hasOwnProperty.call(this.target, n) ? e.start = x.field(this.target, n) : (r = !1, e.start = x.getProperty(this.target, n)), t = new o.tween.actuators.PropertyPathDetails(this.target, n, e, r), this.propertyDetails.push(t)
                }
            }
            this.detailsLength = this.propertyDetails.length, this.initialized = !0
        },
        update: function(t) {
            if (!this.paused) {
                var e, s = (t - this.timeOffset) / this.duration;
                if (s > 1 && (s = 1), this.initialized || this.initialize(), this.special) {
                    e = this._ease.calculate(this._reverse ? 1 - s : s);
                    for (var i = 0, n = this.propertyDetails; i < n.length;) {
                        var r = n[i];
                        ++i, this._snapping ? r.isField ? x.setField(r.target, r.propertyName, Math.round(A.Boot.__cast(r, o.tween.actuators.PropertyPathDetails).path.calculate(e))) : x.setProperty(r.target, r.propertyName, Math.round(A.Boot.__cast(r, o.tween.actuators.PropertyPathDetails).path.calculate(e))) : r.isField ? x.setField(r.target, r.propertyName, A.Boot.__cast(r, o.tween.actuators.PropertyPathDetails).path.calculate(e)) : x.setProperty(r.target, r.propertyName, A.Boot.__cast(r, o.tween.actuators.PropertyPathDetails).path.calculate(e))
                    }
                } else {
                    e = this._ease.calculate(s);
                    for (var a = 0, l = this.propertyDetails; a < l.length;) {
                        var h = l[a];
                        ++a, h.isField ? x.setField(h.target, h.propertyName, A.Boot.__cast(h, o.tween.actuators.PropertyPathDetails).path.calculate(e)) : x.setProperty(h.target, h.propertyName, A.Boot.__cast(h, o.tween.actuators.PropertyPathDetails).path.calculate(e))
                    }
                }
                if (1 == s) {
                    if (0 == this._repeat) return this.active = !1, this.toggleVisible && 0 == this.getField(this.target, "alpha") && this.setField(this.target, "visible", !1), void this.complete(!0);
                    this._reflect && (this._reverse = !this._reverse), this.startTime = t, this.timeOffset = this.startTime + this._delay, this._repeat > 0 && this._repeat--
                }
                this.sendChange && this.change()
            }
        },
        __class__: o.tween.actuators.MotionPathActuator
    }), o.tween.actuators.PropertyDetails = function(t, e, s, i, n) {
        null == n && (n = !0), this.target = t, this.propertyName = e, this.start = s, this.change = i, this.isField = n
    }, i["luxe.tween.actuators.PropertyDetails"] = o.tween.actuators.PropertyDetails, o.tween.actuators.PropertyDetails.__name__ = !0, o.tween.actuators.PropertyDetails.prototype = {
        __class__: o.tween.actuators.PropertyDetails
    }, o.tween.actuators.PropertyPathDetails = function(t, e, s, i) {
        null == i && (i = !0), o.tween.actuators.PropertyDetails.call(this, t, e, 0, 0, i), this.path = s
    }, i["luxe.tween.actuators.PropertyPathDetails"] = o.tween.actuators.PropertyPathDetails, o.tween.actuators.PropertyPathDetails.__name__ = !0, o.tween.actuators.PropertyPathDetails.__super__ = o.tween.actuators.PropertyDetails, o.tween.actuators.PropertyPathDetails.prototype = t(o.tween.actuators.PropertyDetails.prototype, {
        __class__: o.tween.actuators.PropertyPathDetails
    }), o.tween.easing.QuadEaseIn = function() {}, i["luxe.tween.easing.QuadEaseIn"] = o.tween.easing.QuadEaseIn, o.tween.easing.QuadEaseIn.__name__ = !0, o.tween.easing.QuadEaseIn.__interfaces__ = [o.tween.easing.IEasing], o.tween.easing.QuadEaseIn.prototype = {
        calculate: function(t) {
            return t * t
        },
        __class__: o.tween.easing.QuadEaseIn
    }, o.utils = {}, o.utils.GeometryUtils = function() {}, i["luxe.utils.GeometryUtils"] = o.utils.GeometryUtils, o.utils.GeometryUtils.__name__ = !0, o.utils.GeometryUtils.prototype = {
        random_point_in_unit_circle: function() {
            var t = Math.sqrt(Math.random()),
                e = 6.283185307179586 * (-1 + 2 * Math.random());
            return new I.Vector(t * Math.cos(e), t * Math.sin(e))
        },
        point_in_geometry: function(t, e) {
            for (var s = !1, i = e.vertices.length, n = i - 1, o = 0; i > o;) {
                var r = o++,
                    a = e.vertices[r].pos.clone().transform(e.transform.get_world().get_matrix()),
                    l = e.vertices[n].pos.clone().transform(e.transform.get_world().get_matrix());
                a.y > t.y != l.y > t.y && t.x < (l.x - a.x) * (t.y - a.y) / (l.y - a.y) + a.x && (s = !s), n = r
            }
            return s
        },
        __class__: o.utils.GeometryUtils
    }, o.utils.Maths = function() {}, i["luxe.utils.Maths"] = o.utils.Maths, o.utils.Maths.__name__ = !0, o.utils.Maths.fixed = function(t, e) {
        var s = Math.pow(10, e);
        return (t * s | 0) / s
    }, o.utils.Maths.clamp = function(t, e, s) {
        return e > t ? e : t > s ? s : t
    }, o.utils.Random = function(t) {
        this.initial = this.seed = t, this.seed = this.initial
    }, i["luxe.utils.Random"] = o.utils.Random, o.utils.Random.__name__ = !0, o.utils.Random.prototype = {
        __class__: o.utils.Random
    }, o.utils.Utils = function(t) {
        this.core = t, this.geometry = new o.utils.GeometryUtils, this.random = new o.utils.Random(16777215 * Math.random()), this._byte_levels = ["bytes", "Kb", "MB", "GB", "TB"]
    }, i["luxe.utils.Utils"] = o.utils.Utils, o.utils.Utils.__name__ = !0, o.utils.Utils.prototype = {
        uniqueid: function(t) {
            null == t && (t = w.random(2147483647));
            var e = function(t) {
                    if (t > 9) {
                        var e = 65 + (t - 10);
                        return e > 90 && (e += 6), String.fromCharCode(e)
                    }
                    return (null == t ? "null" : "" + t).charAt(0)
                },
                s = t % 62 | 0,
                i = t / 62 | 0;
            return i > 0 ? this.uniqueid(i) + e(s) : w.string(e(s))
        },
        bytes_to_string: function(t, e) {
            null == e && (e = 3);
            var s = Math.floor(Math.log(t) / Math.log(1024)),
                i = t / Math.pow(1024, s);
            return i = o.utils.Maths.fixed(i, e), i + " " + this._byte_levels[s]
        },
        premultiply_alpha: function(t) {
            for (var e = t.length, s = (t[0], 0); e > s;) {
                var i, n = t[s],
                    o = t[s + 1],
                    r = t[s + 2];
                i = function() {
                    var e, i = t[s + 3];
                    return e = 0 > i ? 4294967296 + i : i + 0
                }(this) / 255, t[s] = function() {
                    var t, e = n;
                    return t = 0 > e ? 4294967296 + e : e + 0
                }(this) * i | 0, t[s + 1] = function() {
                    var t, e = o;
                    return t = 0 > e ? 4294967296 + e : e + 0
                }(this) * i | 0, t[s + 2] = function() {
                    var t, e = r;
                    return t = 0 > e ? 4294967296 + e : e + 0
                }(this) * i | 0, s += 4
            }
            return t
        },
        __class__: o.utils.Utils
    }, o.utils.unifill = {}, o.utils.unifill.CodePointIter = function(t) {
        this.s = t, this.itr = new o.utils.unifill.InternalEncodingIter(t, 0, t.length)
    }, i["luxe.utils.unifill.CodePointIter"] = o.utils.unifill.CodePointIter, o.utils.unifill.CodePointIter.__name__ = !0, o.utils.unifill.CodePointIter.prototype = {
        hasNext: function() {
            return this.itr.hasNext()
        },
        next: function() {
            return o.utils.unifill.InternalEncoding.codePointAt(this.s, this.itr.next())
        },
        __class__: o.utils.unifill.CodePointIter
    }, o.utils.unifill.Exception = i["luxe.utils.unifill.Exception"] = {
        __ename__: !0,
        __constructs__: ["InvalidCodePoint", "InvalidCodeUnitSequence"]
    }, o.utils.unifill.Exception.InvalidCodePoint = function(t) {
        var e = ["InvalidCodePoint", 0, t];
        return e.__enum__ = o.utils.unifill.Exception, e.toString = n, e
    }, o.utils.unifill.Exception.InvalidCodeUnitSequence = function(t) {
        var e = ["InvalidCodeUnitSequence", 1, t];
        return e.__enum__ = o.utils.unifill.Exception, e.toString = n, e
    }, o.utils.unifill.InternalEncoding = function() {}, i["luxe.utils.unifill.InternalEncoding"] = o.utils.unifill.InternalEncoding, o.utils.unifill.InternalEncoding.__name__ = !0, o.utils.unifill.InternalEncoding.codePointAt = function(t, e) {
        var s = new o.utils.unifill.Utf16(t);
        return s.codePointAt(e)
    }, o.utils.unifill.InternalEncoding.charAt = function(t, e) {
        var s = new o.utils.unifill.Utf16(t);
        return s.charAt(e).toString()
    }, o.utils.unifill.InternalEncoding.codePointCount = function(t, e, s) {
        var i = new o.utils.unifill.Utf16(t);
        return i.codePointCount(e, s)
    }, o.utils.unifill.InternalEncoding.codePointWidthAt = function(t, e) {
        var s = new o.utils.unifill.Utf16(t);
        return s.codePointWidthAt(e)
    }, o.utils.unifill.InternalEncoding.offsetByCodePoints = function(t, e, s) {
        var i = new o.utils.unifill.Utf16(t);
        return s >= 0 ? i.forward_offset_by_code_points(e, s) : i.backward_offset_by_code_points(e, -s)
    }, o.utils.unifill.InternalEncodingIter = function(t, e, s) {
        this.string = t, this.index = e, this.endIndex = s
    }, i["luxe.utils.unifill.InternalEncodingIter"] = o.utils.unifill.InternalEncodingIter, o.utils.unifill.InternalEncodingIter.__name__ = !0, o.utils.unifill.InternalEncodingIter.prototype = {
        hasNext: function() {
            return this.index < this.endIndex
        },
        next: function() {
            var t = this.index;
            return this.index += o.utils.unifill.InternalEncoding.codePointWidthAt(this.string, this.index), t
        },
        __class__: o.utils.unifill.InternalEncodingIter
    }, o.utils.unifill.Unifill = function() {}, i["luxe.utils.unifill.Unifill"] = o.utils.unifill.Unifill, o.utils.unifill.Unifill.__name__ = !0, o.utils.unifill.Unifill.uCharCodeAt = function(t, e) {
        var s = o.utils.unifill.InternalEncoding.offsetByCodePoints(t, 0, e);
        return o.utils.unifill.InternalEncoding.codePointAt(t, s)
    }, o.utils.unifill.Unifill.uIndexOf = function(t, e, s) {
        null == s && (s = 0);
        var i = t.indexOf(e, o.utils.unifill.InternalEncoding.offsetByCodePoints(t, 0, s));
        return i >= 0 ? o.utils.unifill.InternalEncoding.codePointCount(t, 0, i) : -1
    }, o.utils.unifill.Unifill.uSplit = function(t, e) {
        if (0 == e.length) {
            for (var s = [], i = new o.utils.unifill.InternalEncodingIter(t, 0, t.length); i.index < i.endIndex;) {
                var n = i.next();
                s.push(o.utils.unifill.InternalEncoding.charAt(t, n))
            }
            return s
        }
        return t.split(e)
    }, o.utils.unifill.Utf = function() {}, i["luxe.utils.unifill.Utf"] = o.utils.unifill.Utf, o.utils.unifill.Utf.__name__ = !0, o.utils.unifill.Utf16 = function(t) {
        this.str = t
    }, i["luxe.utils.unifill.Utf16"] = o.utils.unifill.Utf16, o.utils.unifill.Utf16.__name__ = !0, o.utils.unifill.Utf16.__interfaces__ = [o.utils.unifill.Utf], o.utils.unifill.Utf16.prototype = {
        codeUnitAt: function(t) {
            return this.str.charCodeAt(t)
        },
        codePointAt: function(t) {
            return o.utils.unifill._Utf16.Utf16Impl.decode_code_point(this.str.length, s(this, this.codeUnitAt), t)
        },
        charAt: function(t) {
            return new o.utils.unifill.Utf16(function(e) {
                var s, i = e.codePointWidthAt(t);
                return s = function(e) {
                    var s, n = h.substr(e.str, t, i);
                    return s = n
                }(e)
            }(this))
        },
        codePointCount: function(t, e) {
            for (var s = t, i = 0; e > s;) s += this.codePointWidthAt(s), ++i;
            return i
        },
        codePointWidthAt: function(t) {
            var e = this.str.charCodeAt(t);
            return e >= 55296 && 56319 >= e ? 2 : 1
        },
        toString: function() {
            return this.str
        },
        forward_offset_by_code_points: function(t, e) {
            for (var s = this.str.length, i = 0; e > i && s > t;) t += this.codePointWidthAt(t), ++i;
            return t
        },
        backward_offset_by_code_points: function(t, e) {
            for (var i = 0; e > i && t > 0;) t -= o.utils.unifill._Utf16.Utf16Impl.find_prev_code_point(s(this, this.codeUnitAt), t), ++i;
            return t
        },
        __class__: o.utils.unifill.Utf16
    }, o.utils.unifill._Utf16 = {}, o.utils.unifill._Utf16.Utf16Impl = function() {}, i["luxe.utils.unifill._Utf16.Utf16Impl"] = o.utils.unifill._Utf16.Utf16Impl, o.utils.unifill._Utf16.Utf16Impl.__name__ = !0, o.utils.unifill._Utf16.Utf16Impl.find_prev_code_point = function(t, e) {
        var s = t(e - 1);
        return s >= 56320 && 57343 >= s ? 2 : 1
    }, o.utils.unifill._Utf16.Utf16Impl.decode_code_point = function(t, e, s) {
        if (0 > s || s >= t) throw o.utils.unifill.Exception.InvalidCodeUnitSequence(s);
        var i = e(s);
        if (i >= 55296 && 56319 >= i) {
            if (0 > s + 1 || s + 1 >= t) throw o.utils.unifill.Exception.InvalidCodeUnitSequence(s);
            var n = e(s + 1);
            if (n >= 56320 && 57343 >= n) return i - 55232 << 10 | 1023 & n;
            throw o.utils.unifill.Exception.InvalidCodeUnitSequence(s)
        }
        if (i >= 56320 && 57343 >= i) throw o.utils.unifill.Exception.InvalidCodeUnitSequence(s);
        return i
    }, I.BatchState = function(t) {
        this.last_group = -1, this.batcher = t, this.geom_state = new I.geometry.GeometryState, this.last_geom_state = new I.geometry.GeometryState
    }, i["phoenix.BatchState"] = I.BatchState, I.BatchState.__name__ = !0, I.BatchState.prototype = {
        activate: function(t) {
            if (this.geom_state.dirty && (null != this.geom_state.texture ? this.last_texture_id != this.geom_state.texture.id && (this.last_texture_id = this.geom_state.texture.id, null != this.geom_state.texture.texture && this.geom_state.texture.bind()) : (m.renderer.state.bindTexture2D(null), this.last_texture_id = null), null != this.geom_state.shader ? this.last_shader_id != this.geom_state.shader.program && (t.shader_activate(this.geom_state.shader), this.last_shader_id = this.geom_state.shader.program) : null != this.geom_state.texture ? (t.shader_activate(t.renderer.shaders.textured.shader), this.last_shader_id = t.renderer.shaders.textured.shader.program) : (t.shader_activate(t.renderer.shaders.plain.shader), this.last_shader_id = t.renderer.shaders.plain.shader.program), this.geom_state.group != this.last_group)) {
                var e = t.groups.get(this.last_group);
                if (null != e)
                    for (var s = 0; s < e.length;) {
                        var i = e[s];
                        ++s, null != i.post_render && i.post_render(t)
                    }
                var n = t.groups.get(this.geom_state.group);
                if (null != n)
                    for (var o = 0; o < n.length;) {
                        var r = n[o];
                        ++o, null != r.pre_render && r.pre_render(t)
                    }
                this.last_group = this.geom_state.group
            }
            if (this.geom_state.clip) {
                if (this.is_clipping || (C.modules.opengl.web.GL.enable(3089), this.is_clipping = !0), null != this.clip_rect && !this.clip_rect.equal(this.last_clip_rect)) {
                    var a = t.view.get_viewport().h - (this.clip_rect.y + this.clip_rect.h);
                    C.modules.opengl.web.GL.scissor(0 | this.clip_rect.x, 0 | a, 0 | this.clip_rect.w, 0 | this.clip_rect.h)
                }
            } else this.is_clipping && (C.modules.opengl.web.GL.disable(3089), this.is_clipping = !1);
            this.geom_state.clean()
        },
        deactivate: function(t) {
            null != this.last_texture_id && m.renderer.state.bindTexture2D(null), m.renderer.state.useProgram(null);
            var e = t.groups.get(this.last_group);
            if (null != e)
                for (var s = 0; s < e.length;) {
                    var i = e[s];
                    ++s, null != i.post_render && i.post_render(t)
                }
            this.is_clipping && C.modules.opengl.web.GL.disable(3089)
        },
        update: function(t) {
            return this.geom_state.clone_onto(this.last_geom_state), this.geom_state.update(t.state), this.geom_state.clip && (this.last_clip_rect = this.clip_rect, this.clip_rect = t.get_clip_rect()), this.geom_state.dirty || this.last_clip_rect != this.clip_rect
        },
        __class__: I.BatchState
    }, I.BatchGroup = function() {}, i["phoenix.BatchGroup"] = I.BatchGroup, I.BatchGroup.__name__ = !0, I.BatchGroup.prototype = {
        __class__: I.BatchGroup
    }, I.Batcher = function(t, e) {
        null == e && (e = ""), this.sequence = -1, this.name = "", this.visible_count = 0, this.static_batched_count = 0, this.dynamic_batched_count = 0, this.draw_calls = 0, this.color_attribute = 2, this.tcoord_attribute = 1, this.vert_attribute = 0, this.vert_count = 0, this.max_floats = 0, this.max_verts = 0, this.buffer_index = 0, this.buffer_count = 2, this.static_normal_floats = 0, this.static_color_floats = 0, this.static_tcoord_floats = 0, this.static_vert_floats = 0, this.normal_floats = 0, this.color_floats = 0, this.tcoord_floats = 0, this.vert_floats = 0, this.tree_changed = !1, this.enabled = !0, this.layer = 0, this.id = m.utils.uniqueid(null), this.renderer = t, this.sequence = ++I.Batcher._sequence_key, this.geometry = new o.structural.BalancedBST_phoenix_geometry_GeometryKey_phoenix_geometry_Geometry(s(this, this.geometry_compare)), this.groups = new S.ds.IntMap, this.max_verts = w["int"](Math.pow(2, 16)), this.max_floats = 4 * this.max_verts;
        var i, n = this.max_floats;
        i = null != n ? new Float32Array(n) : null, this.vertlist = i;
        var r, a = this.max_floats;
        r = null != a ? new Float32Array(a) : null, this.tcoordlist = r;
        var l, h = this.max_floats;
        l = null != h ? new Float32Array(h) : null, this.colorlist = l;
        var c, _ = this.max_floats;
        c = null != _ ? new Float32Array(_) : null, this.static_vertlist = c;
        var u, d = this.max_floats;
        u = null != d ? new Float32Array(d) : null, this.static_tcoordlist = u;
        var p, y = this.max_floats;
        p = null != y ? new Float32Array(y) : null, this.static_colorlist = p, this.view = this.renderer.camera, this.vertexBuffers = [], this.tcoordBuffers = [], this.vcolorBuffers = [];
        for (var f = 0, g = this.buffer_count; g > f;) {
            {
                var v = (f++, C.modules.opengl.web.GL.createBuffer()),
                    x = C.modules.opengl.web.GL.createBuffer(),
                    b = C.modules.opengl.web.GL.createBuffer();
                C.modules.opengl.web.GL.createBuffer()
            }
            C.modules.opengl.web.GL.bindBuffer(34962, v), C.modules.opengl.web.GL.bufferData(34962, this.vertlist, 35044), C.modules.opengl.web.GL.bindBuffer(34962, x), C.modules.opengl.web.GL.bufferData(34962, this.tcoordlist, 35044), C.modules.opengl.web.GL.bindBuffer(34962, b), C.modules.opengl.web.GL.bufferData(34962, this.colorlist, 35044), this.vertexBuffers.push(v), this.tcoordBuffers.push(x), this.vcolorBuffers.push(b)
        }
        C.modules.opengl.web.GL.enableVertexAttribArray(this.vert_attribute), C.modules.opengl.web.GL.enableVertexAttribArray(this.tcoord_attribute), C.modules.opengl.web.GL.enableVertexAttribArray(this.color_attribute), this.name = 0 == e.length ? m.utils.uniqueid(null) : e
    }, i["phoenix.Batcher"] = I.Batcher, I.Batcher.__name__ = !0, I.Batcher.prototype = {
        set_layer: function(t) {
            return this.layer = t, this.renderer.batchers.sort((k = this.renderer, s(k, k.sort_batchers))), this.layer
        },
        geometry_compare: function(t, e) {
            if (t.uuid == e.uuid) return 0;
            if (t.depth < e.depth) return -1;
            if (t.depth > e.depth) return 1;
            if (null != t.shader && null != e.shader) {
                if (t.shader.id < e.shader.id) return -1;
                if (t.shader.id > e.shader.id) return 1
            } else {
                if (null != t.shader && null == e.shader) return 1;
                if (null == t.shader && null != e.shader) return -1
            }
            if (null != t.texture && null != e.texture) {
                if (t.texture.id < e.texture.id) return -1;
                if (t.texture.id > e.texture.id) return 1
            } else {
                if (null != t.texture && null == e.texture) return 1;
                if (null == t.texture && null != e.texture) return -1
            }
            var s = t.primitive_type,
                i = e.primitive_type;
            if (i > s) return -1;
            if (s > i) return 1;
            if (t.clip != e.clip) {
                if (0 == t.clip && 1 == e.clip) return 1;
                if (1 == t.clip && 0 == e.clip) return -1
            }
            return t.timestamp < e.timestamp ? -1 : t.timestamp >= e.timestamp ? 1 : t.sequence < e.sequence ? -1 : t.sequence > e.sequence ? 1 : 1
        },
        add: function(t, e) {
            null == e && (e = !1), (null == this.geometry.find(t.key) || e) && (c.has(t.batchers, this) || t.batchers.push(this), this.geometry.insert(t.key, t), t.added = !0, this.tree_changed = !0)
        },
        remove: function(t, e) {
            null == e && (e = !0), e && (h.remove(t.batchers, this), 0 == t.batchers.length && (t.added = !1));
            this.geometry.size();
            this.geometry.remove(t.key);
            this.geometry.size();
            this.tree_changed = !0
        },
        shader_activate: function(t) {
            t.activate(), this.projectionmatrix_attribute = t.projectionmatrix_attribute, this.modelviewmatrix_attribute = t.modelviewmatrix_attribute, this.tex0_attribute = t.tex0_attribute, this.tex1_attribute = t.tex1_attribute, this.tex2_attribute = t.tex2_attribute, this.tex3_attribute = t.tex3_attribute, this.tex4_attribute = t.tex4_attribute, this.tex5_attribute = t.tex5_attribute, this.tex6_attribute = t.tex6_attribute, this.tex7_attribute = t.tex7_attribute, t.apply_uniforms(), m.renderer.state.activeTexture(33984)
        },
        batch: function(t) {
            null == t && (t = !1), this.dynamic_batched_count = 0, this.static_batched_count = 0, this.visible_count = 0, this.vert_floats = 0, this.tcoord_floats = 0, this.color_floats = 0, this.normal_floats = 0, this.state = new I.BatchState(this);
            for (var e = null, s = this.geometry.iterator(); s.hasNext();) {
                var i = s.next();
                e = i, null == e || e.dropped || (this.state.update(e) && this.vert_floats > 0 && this.submit_current_vertex_list(this.state.last_geom_state.primitive_type), this.state.activate(this), e.visible && (this.visible_count++, e.get_locked() ? (this.submit_static_geometry(e), this.vert_count += e.vertices.length) : 3 == e.get_primitive_type() || 2 == e.get_primitive_type() || 5 == e.get_primitive_type() || 6 == e.get_primitive_type() ? (this.geometry_batch(e), this.submit_current_vertex_list(e.get_primitive_type()), this.vert_count += e.vertices.length) : (this.geometry_batch(e), this.dynamic_batched_count++, this.vert_count += e.vertices.length), !t && e.immediate && e.drop()))
            }
            this.vert_floats > 0 && null != e && (this.state.update(e), this.state.activate(this), this.submit_current_vertex_list(this.state.last_geom_state.primitive_type)), this.state.deactivate(this), this.state = null
        },
        draw: function(t) {
            null == t && (t = !1), this.draw_calls = 0, this.vert_count = 0, this.view.process(), this.renderer.state.viewport(this.view.get_viewport().x, this.view.get_viewport().y, this.view.get_viewport().w, this.view.get_viewport().h), this.batch(t)
        },
        submit_static_geometry: function(t) {
            0 != t.vertices.length && (this.static_vert_floats = 0, this.static_tcoord_floats = 0, this.static_color_floats = 0, !t.submitted || t.get_dirty() ? this.geometry_batch_static(t) : (this.static_vert_floats = 4 * t.vertices.length, this.static_tcoord_floats = 4 * t.vertices.length, this.static_color_floats = 4 * t.vertices.length), null == t.static_vertex_buffer && (t.static_vertex_buffer = C.modules.opengl.web.GL.createBuffer(), t.static_tcoord_buffer = C.modules.opengl.web.GL.createBuffer(), t.static_vcolor_buffer = C.modules.opengl.web.GL.createBuffer()), this._enable_attributes(), C.modules.opengl.web.GL.bindBuffer(34962, t.static_vertex_buffer), C.modules.opengl.web.GL.vertexAttribPointer(this.vert_attribute, 4, 5126, !1, 0, 0), (!t.submitted || t.get_dirty()) && C.modules.opengl.web.GL.bufferData(34962, this.static_vertlist, 35044), C.modules.opengl.web.GL.bindBuffer(34962, t.static_tcoord_buffer), C.modules.opengl.web.GL.vertexAttribPointer(this.tcoord_attribute, 4, 5126, !1, 0, 0), (!t.submitted || t.get_dirty()) && C.modules.opengl.web.GL.bufferData(34962, this.static_tcoordlist, 35044), C.modules.opengl.web.GL.bindBuffer(34962, t.static_vcolor_buffer), C.modules.opengl.web.GL.vertexAttribPointer(this.color_attribute, 4, 5126, !1, 0, 0), (!t.submitted || t.get_dirty()) && C.modules.opengl.web.GL.bufferData(34962, this.static_colorlist, 35044), C.modules.opengl.web.GL.drawArrays(t.get_primitive_type(), 0, I.utils.Rendering.get_elements_for_type(t.get_primitive_type(), this.static_vert_floats)), this._disable_attributes(), this.draw_calls++, this.static_batched_count++, this.static_vert_floats = 0, this.static_tcoord_floats = 0, this.static_color_floats = 0, t.set_dirty(!1), t.submitted = !0)
        },
        submit_current_vertex_list: function(t) {
            if (0 != this.vert_floats) {
                if (this.vert_floats > this.max_floats) throw "uh oh, somehow too many floats are being submitted (max:$max_floats, attempt:$vert_floats).";
                this._enable_attributes(), C.modules.opengl.web.GL.bindBuffer(34962, this.vertexBuffers[this.buffer_index]), C.modules.opengl.web.GL.vertexAttribPointer(0, 4, 5126, !1, 0, 0), C.modules.opengl.web.GL.bufferSubData(34962, 0, function(t) {
                    var e, s, i = t.vertlist.buffer,
                        n = t.vert_floats;
                    return s = null != i ? null == n ? new Float32Array(i, 0) : new Float32Array(i, 0, n) : null, e = s
                }(this)), C.modules.opengl.web.GL.bindBuffer(34962, this.tcoordBuffers[this.buffer_index]), C.modules.opengl.web.GL.vertexAttribPointer(1, 4, 5126, !1, 0, 0), C.modules.opengl.web.GL.bufferSubData(34962, 0, function(t) {
                    var e, s, i = t.tcoordlist.buffer,
                        n = t.tcoord_floats;
                    return s = null != i ? null == n ? new Float32Array(i, 0) : new Float32Array(i, 0, n) : null, e = s
                }(this)), C.modules.opengl.web.GL.bindBuffer(34962, this.vcolorBuffers[this.buffer_index]), C.modules.opengl.web.GL.vertexAttribPointer(2, 4, 5126, !1, 0, 0), C.modules.opengl.web.GL.bufferSubData(34962, 0, function(t) {
                    var e, s, i = t.colorlist.buffer,
                        n = t.color_floats;
                    return s = null != i ? null == n ? new Float32Array(i, 0) : new Float32Array(i, 0, n) : null, e = s
                }(this)), C.modules.opengl.web.GL.drawArrays(t, 0, I.utils.Rendering.get_elements_for_type(t, this.vert_floats)), this._disable_attributes(), this.buffer_index++, this.buffer_index >= this.buffer_count && (this.buffer_index = 0), this.vert_floats = 0, this.tcoord_floats = 0, this.color_floats = 0, this.normal_floats = 0, this.draw_calls++
            }
        },
        geometry_batch: function(t) {
            var e = t.vertices.length + this.vert_floats / 4;
            e > this.max_verts && this.submit_current_vertex_list(t.get_primitive_type()), t.batch(this.vert_floats, this.tcoord_floats, this.color_floats, this.normal_floats, this.vertlist, this.tcoordlist, this.colorlist, this.normallist), this.vert_floats += 4 * t.vertices.length, this.tcoord_floats += 4 * t.vertices.length, this.color_floats += 4 * t.vertices.length
        },
        geometry_batch_static: function(t) {
            t.batch(this.static_vert_floats, this.static_tcoord_floats, this.static_color_floats, this.static_normal_floats, this.static_vertlist, this.static_tcoordlist, this.static_colorlist, this.static_normallist), this.static_vert_floats += 4 * t.vertices.length, this.static_tcoord_floats += 4 * t.vertices.length, this.static_color_floats += 4 * t.vertices.length
        },
        _enable_attributes: function() {
            C.modules.opengl.web.GL.uniformMatrix4fv(this.projectionmatrix_attribute, !1, this.view.projection_float32array), C.modules.opengl.web.GL.uniformMatrix4fv(this.modelviewmatrix_attribute, !1, this.view.view_inverse_float32array)
        },
        _disable_attributes: function() {},
        __class__: I.Batcher,
        __properties__: {
            set_layer: "set_layer"
        }
    }, I.BitmapFont = function(t) {
        if (null == t) throw o.DebugError.null_assertion("_options was null");
        if (t.resource_type = 6, o.resource.Resource.call(this, t), this.texture_path = null != t.texture_path ? t.texture_path : S.io.Path.directory(this.id), this.pages = new S.ds.IntMap, null != t.pages && null == t.font_data) throw o.DebugError.null_assertion("_options.font_data was null (BitmapFont create from pages + font_data requires both of those options)");
        if (null != t.font_data) {
            if (null == t.pages) throw o.DebugError.null_assertion("_options.pages was null (BitmapFont create from pages + font_data requires both of those options)");
            this.set_info(o.importers.bitmapfont.BitmapFontParser.parse(t.font_data)), this.apply_pages(t.pages)
        }
    }, i["phoenix.BitmapFont"] = I.BitmapFont, I.BitmapFont.__name__ = !0, I.BitmapFont.__super__ = o.resource.Resource, I.BitmapFont.prototype = t(o.resource.Resource.prototype, {
        kerning: function(t, e) {
            var s = this.info.kernings.get(t);
            return null != s && s.exists(e) ? s.get(e) : 0
        },
        wrap_string_to_bounds: function(t, e, s, i) {
            null == i && (i = 0), null == s && (s = 1);
            var n = this;
            if (null == e) return t;
            for (var r = 0, a = 0, l = "", h = n.width_of(" ", s, i, null), c = t.split(" "), _ = c.length, m = 0; m < c.length;) {
                var u = c[m];
                if (++m, -1 == o.utils.unifill.Unifill.uIndexOf(u, "\n", null)) {
                    "" == u && (u = " ");
                    var d = n.width_of(u, s, i, null);
                    r + d > e.w && (r = 0, l += "\n"), r += d, l += u
                } else
                    for (var p = 0, y = u.split("\n"), f = 0; f < y.length;) {
                        var g = y[f];
                        if (++f, "" != g) {
                            var v = n.width_of(g, s, i, null);
                            r + v > e.w && (r = 0, l += "\n"), r += v, l += g
                        } else r = 0;
                        p < y.length - 1 && (l += "\n", r = 0), p++
                    }
                _ - 1 > a && (l += " ", r += h + i), a++
            }
            return l
        },
        width_of_line: function(t, e, s) {
            null == s && (s = 0), null == e && (e = 1);
            for (var i = 0, n = 0, r = e / this.info.point_size, a = 0, l = o.utils.unifill.InternalEncoding.codePointCount(t, 0, t.length), h = new o.utils.unifill.CodePointIter(t); h.hasNext();) {
                var c = h.next(),
                    _ = c,
                    m = this.info.chars.get(_);
                null == m && (m = this.space_char);
                var u = (m.xoffset + Math.max(m.width, m.xadvance)) * r,
                    d = i + m.xoffset * r,
                    p = m.xadvance;
                if (l - 1 > a) {
                    var y = o.utils.unifill.Unifill.uCharCodeAt(t, a + 1);
                    p += this.kerning(_, y), y >= 32 && (p += s)
                }
                i += p * r, n = Math.max(n, d + u), ++a
            }
            return n
        },
        width_of: function(t, e, s, i) {
            null == s && (s = 0), null == e && (e = 1);
            for (var n = 0, r = null != i, a = o.utils.unifill.Unifill.uSplit(t, "\n"), l = 0; l < a.length;) {
                var h = a[l];
                ++l;
                var c = this.width_of_line(h, e, s);
                n = Math.max(n, c), r && i.push(c)
            }
            return n
        },
        height_of_lines: function(t, e, s) {
            null == s && (s = 0);
            var i = e / this.info.point_size;
            return t.length * (this.info.line_height + s) * i
        },
        clear: function() {
            this.set_info(null);
            for (var t = this.pages.keys(); t.hasNext();) {
                var e = t.next(),
                    s = this.pages.get(e);
                s.destroy(), this.pages.remove(e), s = null
            }
        },
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = C.system.assets.AssetText.load(m.core.app.assets, t.id);
                i.then(function(i) {
                    if (t.set_info(o.importers.bitmapfont.BitmapFontParser.parse(i.text)), null == t.info) throw o.DebugError.null_assertion("info was null");
                    for (var n = [], r = 0, a = t.info.pages; r < a.length;) {
                        var l = a[r];
                        ++r;
                        var h = S.io.Path.join([t.texture_path, l.file]),
                            c = t.system.cache.get(h);
                        n.push(null != c ? c.reload() : t.system.load_texture(h))
                    }
                    C.api.Promise.all(n).then(function(s) {
                        t.apply_pages(s), t.set_state(3), e(t)
                    }).error(function(e) {
                        t.set_state(4), s(e)
                    })
                }).error(function(e) {
                    t.set_state(4), s(e)
                })
            })
        },
        apply_pages: function(t) {
            for (var e = 0, s = 0; s < t.length;) {
                var i = t[s];
                ++s, i.slot = e, this.pages.set(e, i), ++e
            }
        },
        set_info: function(t) {
            return this.info = t, null != this.info && (this.space_char = this.info.chars.get(32)), this.info
        },
        __class__: I.BitmapFont,
        __properties__: t(o.resource.Resource.prototype.__properties__, {
            set_info: "set_info"
        })
    }), I.ProjectionType = i["phoenix.ProjectionType"] = {
        __ename__: !0,
        __constructs__: ["ortho", "perspective", "custom"]
    }, I.ProjectionType.ortho = ["ortho", 0], I.ProjectionType.ortho.toString = n, I.ProjectionType.ortho.__enum__ = I.ProjectionType, I.ProjectionType.perspective = ["perspective", 1], I.ProjectionType.perspective.toString = n, I.ProjectionType.perspective.__enum__ = I.ProjectionType, I.ProjectionType.custom = ["custom", 2], I.ProjectionType.custom.toString = n, I.ProjectionType.custom.__enum__ = I.ProjectionType, I.Camera = function(t) {
        this._refresh_pos = !1, this._setup = !0, this.look_at_dirty = !0, this.projection_dirty = !0, this.transform_dirty = !0, this.minimum_zoom = .01, this.aspect = 1.5, this.fov_type = I.FOVType.horizontal, this.fov = 60, this.far = -1e3, this.near = 1e3, this.zoom = 1, this.name = "camera", this.transform = new I.Transform, this.options = t, null == this.options && (this.options = this.default_camera_options()), this.options, null != this.options.camera_name && (this.name = this.options.camera_name), this.projection = null != this.options.projection ? this.options.projection : I.ProjectionType.ortho, this.set_center(new I.Vector(m.core.screen.get_w() / 2, m.core.screen.get_h() / 2)), this.set_pos(new I.Vector), this.set_viewport(null != this.options.viewport ? this.options.viewport : new I.Rectangle(0, 0, m.core.screen.get_w(), m.core.screen.get_h())), this.up = new I.Vector(0, 1, 0), this.projection_matrix = new I.Matrix, this.view_matrix = new I.Matrix, this.view_matrix_inverse = new I.Matrix, this.look_at_matrix = new I.Matrix, this.transform.listen(s(this, this.on_transform_cleaned)), this.apply_default_camera_options();
        var e = this.projection;
        switch (e[1]) {
            case 0:
                this.set_ortho(this.options);
                break;
            case 1:
                this.set_perspective(this.options);
                break;
            case 2:
        }
        this._setup = !1
    }, i["phoenix.Camera"] = I.Camera, I.Camera.__name__ = !0, I.Camera.prototype = {
        set_ortho: function(t) {
            this.projection = I.ProjectionType.ortho, this._merge_options(t)
        },
        set_perspective: function(t) {
            this.projection = I.ProjectionType.perspective, this._merge_options(t), this.transform.origin.set_xyz(0, 0, 0)
        },
        process: function() {
            null != this.target && this.update_look_at(), this.update_projection_matrix(), this.update_view_matrix(), this.apply_state(2884, this.options.cull_backfaces), this.apply_state(2929, this.options.depth_test)
        },
        on_transform_cleaned: function() {
            this.transform_dirty = !0
        },
        update_look_at: function() {
            this.look_at_dirty && null != this.target && (this.look_at_matrix.lookAt(this.target, this.get_pos(), this.up), this.get_rotation().setFromRotationMatrix(this.look_at_matrix))
        },
        update_view_matrix: function() {
            this.view_matrix = this.transform.get_world().get_matrix(), this.transform_dirty && (this.view_matrix_inverse = this.view_matrix.inverse(), this.view_inverse_float32array = this.view_matrix_inverse.float32array(), this.transform_dirty = !1)
        },
        update_projection_matrix: function() {
            if (this.projection_dirty) {
                var t = this.projection;
                switch (t[1]) {
                    case 1:
                        this.projection_matrix.makePerspective(this.fov_y, this.aspect, this.near, this.far);
                        break;
                    case 0:
                        this.projection_matrix.makeOrthographic(0, this.get_viewport().w, 0, this.get_viewport().h, this.near, this.far);
                        break;
                    case 2:
                }
                this.projection_float32array = this.projection_matrix.float32array(), this.projection_dirty = !1
            }
        },
        apply_state: function(t, e) {
            e ? m.renderer.state.enable(t) : m.renderer.state.disable(t)
        },
        apply_default_camera_options: function() {
            var t = this.projection;
            switch (t[1]) {
                case 0:
                    null == this.options.cull_backfaces && (this.options.cull_backfaces = !1), this.options.cull_backfaces, null == this.options.depth_test && (this.options.depth_test = !1), this.options.depth_test;
                    break;
                case 1:
                    null == this.options.cull_backfaces && (this.options.cull_backfaces = !0), this.options.cull_backfaces, null == this.options.depth_test && (this.options.depth_test = !0), this.options.depth_test;
                    break;
                case 2:
            }
        },
        default_camera_options: function() {
            return {
                projection: I.ProjectionType.ortho,
                depth_test: !1,
                cull_backfaces: !1,
                near: 1e3,
                far: -1e3
            }
        },
        set_fov: function(t) {
            return this.projection_dirty = !0, this.options.fov = t, this.fov_y = this.fov_type == I.FOVType.horizontal ? 180 / Math.PI * 2 * Math.atan(Math.tan(t * (Math.PI / 180) / 2) * (1 / this.aspect)) : t, this.fov = t
        },
        set_fov_type: function(t) {
            return this.options.fov_type = t, this.fov_type = t, this.set_fov(this.fov), this.fov_type
        },
        set_aspect: function(t) {
            return this.projection_dirty = !0, this.options.aspect = t, this.aspect = t
        },
        set_near: function(t) {
            return this.projection_dirty = !0, this.options.near = t, this.near = t
        },
        set_far: function(t) {
            return this.projection_dirty = !0, this.options.far = t, this.far = t
        },
        set_zoom: function(t) {
            var e = t;
            e < this.minimum_zoom && (e = this.minimum_zoom);
            var s = this.projection;
            switch (s[1]) {
                case 0:
                    this.transform.local.scale.set_x(1 / e), this.transform.local.scale.set_y(1 / e), this.transform.local.scale.set_z(1 / e);
                    break;
                case 1:
                    break;
                case 2:
            }
            return this.zoom = e
        },
        set_center: function(t) {
            this.center = t;
            var e = this.projection;
            switch (e[1]) {
                case 0:
                    this._refresh_pos || this._setup || (this.get_pos().ignore_listeners = !0, this.get_pos().set_x(t.x - this.get_viewport().w / 2), this.get_pos().set_y(t.y - this.get_viewport().h / 2), this.get_pos().ignore_listeners = !1, this.transform.local.pos.copy_from(t));
                    break;
                case 1:
                    break;
                case 2:
            }
            return I.Vector.Listen(this.get_center(), s(this, this._center_changed)), this.get_center()
        },
        get_center: function() {
            return this.center
        },
        get_pos: function() {
            return this.pos
        },
        get_rotation: function() {
            return this.transform.local.rotation
        },
        get_scale: function() {
            return this.transform.local.scale
        },
        get_viewport: function() {
            return this.viewport
        },
        set_viewport: function(t) {
            this.projection_dirty = !0, this.viewport = t;
            var e = this.projection;
            switch (e[1]) {
                case 0:
                    this.transform.set_origin(new I.Vector(t.w / 2, t.h / 2)), this.set_pos(this.get_pos());
                    break;
                case 1:
                    break;
                case 2:
            }
            return this.get_viewport()
        },
        set_rotation: function(t) {
            return this.transform.local.set_rotation(t)
        },
        set_scale: function(t) {
            return this.transform.local.set_scale(t)
        },
        set_pos: function(t) {
            this.pos = t;
            var e = this.projection;
            switch (e[1]) {
                case 0:
                    var i = this.get_center().x,
                        n = this.get_center().y;
                    null != this.get_viewport() && (i = t.x + this.get_viewport().w / 2, n = t.y + this.get_viewport().h / 2), this._refresh_pos = !0, this.get_center().ignore_listeners = !0, this.get_center().set_x(i), this.get_center().set_y(n), this.get_center().ignore_listeners = !1, this._refresh_pos = !1, this.transform.local.pos.set_x(i), this.transform.local.pos.set_y(n);
                    break;
                case 1:
                    this.transform.set_pos(this.get_pos());
                    break;
                case 2:
            }
            return I.Vector.Listen(this.get_pos(), s(this, this._pos_changed)), this.get_pos()
        },
        _merge_options: function(t) {
            null != t.aspect && (this.options.aspect = t.aspect, this.set_aspect(this.options.aspect)), null != t.far && (this.options.far = t.far, this.set_far(this.options.far)), null != t.fov && (this.options.fov = t.fov, this.set_fov(this.options.fov)), null != t.fov_type ? (this.options.fov_type = t.fov_type, this.set_fov_type(t.fov_type)) : (this.options.fov_type = I.FOVType.horizontal, this.set_fov_type(I.FOVType.horizontal)), null != t.near && (this.options.near = t.near, this.set_near(this.options.near)), null != t.viewport && (this.options.viewport = t.viewport, this.set_viewport(this.options.viewport)), this.apply_default_camera_options(), null != t.cull_backfaces && (this.options.cull_backfaces = t.cull_backfaces), null != t.depth_test && (this.options.depth_test = t.depth_test)
        },
        _pos_changed: function() {
            this.set_pos(this.get_pos())
        },
        _center_changed: function() {
            this.set_center(this.get_center())
        },
        __class__: I.Camera,
        __properties__: {
            set_scale: "set_scale",
            set_rotation: "set_rotation",
            get_scale: "get_scale",
            get_rotation: "get_rotation",
            set_pos: "set_pos",
            get_pos: "get_pos",
            set_aspect: "set_aspect",
            set_fov_type: "set_fov_type",
            set_fov: "set_fov",
            set_far: "set_far",
            set_near: "set_near",
            set_zoom: "set_zoom",
            set_center: "set_center",
            get_center: "get_center",
            set_viewport: "set_viewport",
            get_viewport: "get_viewport"
        }
    }, I.FOVType = i["phoenix.FOVType"] = {
        __ename__: !0,
        __constructs__: ["vertical", "horizontal"]
    }, I.FOVType.vertical = ["vertical", 0], I.FOVType.vertical.toString = n, I.FOVType.vertical.__enum__ = I.FOVType, I.FOVType.horizontal = ["horizontal", 1], I.FOVType.horizontal.toString = n, I.FOVType.horizontal.__enum__ = I.FOVType, I.ColorHSL = function() {
        this.l = 1, this.s = 1, this.h = 0
    }, i["phoenix.ColorHSL"] = I.ColorHSL, I.ColorHSL.__name__ = !0, I.ColorHSL.__super__ = I.Color, I.ColorHSL.prototype = t(I.Color.prototype, {
        set_h: function(t) {
            return this.h = t, this._refresh(), t
        },
        set_s: function(t) {
            return this.s = t, this._refresh(), t
        },
        set_l: function(t) {
            return this.l = t, this._refresh(), t
        },
        tween: function(t, e, s) {
            if (null == s && (s = !0), null == t && (t = .5), I.Color.prototype.tween.call(this, t, e, s), null != e) {
                var i = this.h,
                    n = this.s,
                    r = this.l,
                    a = this.a,
                    l = !1,
                    h = !1,
                    c = !1,
                    _ = !1;
                A.Boot.__instanceof(e, I.ColorHSL) ? (i = e.h, n = e.s, r = e.l, a = e.a, l = !0, h = !0, c = !0, _ = !0) : (null != e.h && (i = e.h, l = !0), null != e.s && (n = e.s, h = !0), null != e.l && (r = e.l, c = !0), null != e.a && (a = e.a, _ = !0));
                var m = {};
                return l && (m.h = i), h && (m.s = n), c && (m.l = r), _ && (m.a = a), o.tween.Actuate.tween(this, t, m, s)
            }
            throw " Warning: Color.tween passed a null destination "
        },
        _refresh: function() {
            return this.refreshing = !0, I.Color.prototype.fromColorHSL.call(this, this), this.refreshing = !1, this
        },
        fromColor: function(t) {
            var e = t.maxRGB(),
                s = t.minRGB(),
                i = e + s,
                n = e - s,
                o = 0;
            e == s ? o = 0 : e == t.r ? o = (60 * (t.g - t.b) / n + 360) % 360 : e == t.g ? o = 60 * (t.b - t.r) / n + 120 : e == t.b && (o = 60 * (t.r - t.g) / n + 240);
            var r, a = i / 2;
            return r = e == s ? 0 : this.l <= .5 ? n / i : n / (2 - i), this.set_h(o), this.set_s(r), this.set_l(a), this.a = t.a, this
        },
        __class__: I.ColorHSL,
        __properties__: t(I.Color.prototype.__properties__, {
            set_l: "set_l",
            set_s: "set_s",
            set_h: "set_h"
        })
    }), I.ColorHSV = function() {
        this.v = 1, this.s = 0, this.h = 0
    }, i["phoenix.ColorHSV"] = I.ColorHSV, I.ColorHSV.__name__ = !0, I.ColorHSV.__super__ = I.Color, I.ColorHSV.prototype = t(I.Color.prototype, {
        set_h: function(t) {
            return this.h = t, this._refresh(), t
        },
        set_s: function(t) {
            return this.s = t, this._refresh(), this.s
        },
        set_v: function(t) {
            return this.v = t, this._refresh(), this.v
        },
        tween: function(t, e, s) {
            if (null == s && (s = !0), null == t && (t = .5), I.Color.prototype.tween.call(this, t, e, s), null != e) {
                var i = this.h,
                    n = this.s,
                    r = this.v,
                    a = this.a,
                    l = !1,
                    h = !1,
                    c = !1,
                    _ = !1;
                A.Boot.__instanceof(e, I.ColorHSV) ? (i = e.h, n = e.s, r = e.v, a = e.a, l = !0, h = !0, c = !0, _ = !0) : (null != e.h && (i = e.h, l = !0), null != e.s && (n = e.s, h = !0), null != e.v && (r = e.v, c = !0), null != e.a && (a = e.a, _ = !0));
                var m = {};
                return l && (m.h = i), h && (m.s = n), c && (m.v = r), _ && (m.a = a), o.tween.Actuate.tween(this, t, m, s)
            }
            throw " Warning: Color.tween passed a null destination "
        },
        _refresh: function() {
            return this.refreshing = !0, I.Color.prototype.fromColorHSV.call(this, this), this.refreshing = !1, this
        },
        fromColorHSL: function(t) {
            return t._refresh(), this.fromColor(t)
        },
        fromColor: function(t) {
            var e = t.maxRGB(),
                s = t.minRGB(),
                i = e - s,
                n = 0;
            e == s ? n = 0 : e == t.r ? n = (60 * (t.g - t.b) / i + 360) % 360 : e == t.g ? n = 60 * (t.b - t.r) / i + 120 : e == t.b && (n = 60 * (t.r - t.g) / i + 240);
            var o;
            return o = 0 == e ? 0 : 1 - s / e, this.set_h(n), this.set_s(o), this.set_v(e), this.a = t.a, this
        },
        __class__: I.ColorHSV,
        __properties__: t(I.Color.prototype.__properties__, {
            set_v: "set_v",
            set_s: "set_s",
            set_h: "set_h"
        })
    }), I.MatrixTransform = function(t, e, s) {
        this.pos = t, this.rotation = e, this.scale = s
    }, i["phoenix.MatrixTransform"] = I.MatrixTransform, I.MatrixTransform.__name__ = !0, I.MatrixTransform.prototype = {
        __class__: I.MatrixTransform
    }, I.Matrix = function(t, e, s, i, n, o, r, a, l, h, c, _, m, u, d, p) {
        null == p && (p = 1), null == d && (d = 0), null == u && (u = 0), null == m && (m = 0), null == _ && (_ = 0), null == c && (c = 1), null == h && (h = 0), null == l && (l = 0), null == a && (a = 0), null == r && (r = 0), null == o && (o = 1), null == n && (n = 0), null == i && (i = 0), null == s && (s = 0), null == e && (e = 0), null == t && (t = 1), this.elements = new Array;
        for (var y = 0; y++ < 16;) this.elements.push(0);
        this.set(t, e, s, i, n, o, r, a, l, h, c, _, m, u, d, p);
        var f, g = this.elements;
        f = null != g ? new Float32Array(g) : null, this._float32array = f
    }, i["phoenix.Matrix"] = I.Matrix, I.Matrix.__name__ = !0, I.Matrix.prototype = {
        set: function(t, e, s, i, n, o, r, a, l, h, c, _, m, u, d, p) {
            var y = this.elements;
            return y[0] = t, y[4] = e, y[8] = s, y[12] = i, y[1] = n, y[5] = o, y[9] = r, y[13] = a, y[2] = l, y[6] = h, y[10] = c, y[14] = _, y[3] = m, y[7] = u, y[11] = d, y[15] = p, this
        },
        float32array: function() {
            var t, e = this.elements;
            return t = null != e ? new Float32Array(e) : null
        },
        makeRotationFromQuaternion: function(t) {
            var e = this.elements,
                s = t.x + t.x,
                i = t.y + t.y,
                n = t.z + t.z,
                o = t.x * s,
                r = t.x * i,
                a = t.x * n,
                l = t.y * i,
                h = t.y * n,
                c = t.z * n,
                _ = t.w * s,
                m = t.w * i,
                u = t.w * n;
            return e[0] = 1 - (l + c), e[4] = r - u, e[8] = a + m, e[1] = r + u, e[5] = 1 - (o + c), e[9] = h - _, e[2] = a - m, e[6] = h + _, e[10] = 1 - (o + l), e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this
        },
        lookAt: function(t, e, s) {
            var i = new I.Vector,
                n = new I.Vector,
                o = new I.Vector,
                r = this.elements;
            if (o = new I.Vector(e.x - t.x, e.y - t.y, e.z - t.z).get_normalized(), 0 == Math.sqrt(o.x * o.x + o.y * o.y + o.z * o.z) && (o.z = 1, o._construct ? o.z : (null == o.listen_z || o.ignore_listeners || o.listen_z(1), o.z)), i = new I.Vector(s.y * o.z - s.z * o.y, s.z * o.x - s.x * o.z, s.x * o.y - s.y * o.x).get_normalized(), 0 == Math.sqrt(i.x * i.x + i.y * i.y + i.z * i.z)) {
                var a = o;
                a.set_x(a.x + 1e-4), i = new I.Vector(s.y * o.z - s.z * o.y, s.z * o.x - s.x * o.z, s.x * o.y - s.y * o.x).get_normalized()
            }
            return n = new I.Vector(o.y * i.z - o.z * i.y, o.z * i.x - o.x * i.z, o.x * i.y - o.y * i.x), r[0] = i.x, r[4] = n.x, r[8] = o.x, r[1] = i.y, r[5] = n.y, r[9] = o.y, r[2] = i.z, r[6] = n.z, r[10] = o.z, this
        },
        multiply: function(t) {
            return this.multiplyMatrices(this, t)
        },
        multiplyMatrices: function(t, e) {
            var s = t.elements,
                i = e.elements,
                n = this.elements,
                o = s[0],
                r = s[4],
                a = s[8],
                l = s[12],
                h = s[1],
                c = s[5],
                _ = s[9],
                m = s[13],
                u = s[2],
                d = s[6],
                p = s[10],
                y = s[14],
                f = s[3],
                g = s[7],
                v = s[11],
                x = s[15],
                w = i[0],
                b = i[4],
                B = i[8],
                S = i[12],
                A = i[1],
                C = i[5],
                I = i[9],
                k = i[13],
                M = i[2],
                V = i[6],
                z = i[10],
                T = i[14],
                P = i[3],
                D = i[7],
                L = i[11],
                F = i[15];
            return n[0] = o * w + r * A + a * M + l * P, n[4] = o * b + r * C + a * V + l * D, n[8] = o * B + r * I + a * z + l * L, n[12] = o * S + r * k + a * T + l * F, n[1] = h * w + c * A + _ * M + m * P, n[5] = h * b + c * C + _ * V + m * D, n[9] = h * B + c * I + _ * z + m * L, n[13] = h * S + c * k + _ * T + m * F, n[2] = u * w + d * A + p * M + y * P, n[6] = u * b + d * C + p * V + y * D, n[10] = u * B + d * I + p * z + y * L, n[14] = u * S + d * k + p * T + y * F, n[3] = f * w + g * A + v * M + x * P, n[7] = f * b + g * C + v * V + x * D, n[11] = f * B + g * I + v * z + x * L, n[15] = f * S + g * k + v * T + x * F, this
        },
        multiplyScalar: function(t) {
            var e = this.elements;
            return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this
        },
        setPosition: function(t) {
            var e = this.elements;
            return e[12] = t.x, e[13] = t.y, e[14] = t.z, this
        },
        inverse: function() {
            return this.clone().getInverse(this)
        },
        getInverse: function(t) {
            var e = this.elements,
                s = t.elements,
                i = s[0],
                n = s[4],
                o = s[8],
                r = s[12],
                a = s[1],
                l = s[5],
                h = s[9],
                c = s[13],
                _ = s[2],
                m = s[6],
                u = s[10],
                d = s[14],
                p = s[3],
                y = s[7],
                f = s[11],
                g = s[15];
            e[0] = h * d * y - c * u * y + c * m * f - l * d * f - h * m * g + l * u * g, e[4] = r * u * y - o * d * y - r * m * f + n * d * f + o * m * g - n * u * g, e[8] = o * c * y - r * h * y + r * l * f - n * c * f - o * l * g + n * h * g, e[12] = r * h * m - o * c * m - r * l * u + n * c * u + o * l * d - n * h * d, e[1] = c * u * p - h * d * p - c * _ * f + a * d * f + h * _ * g - a * u * g, e[5] = o * d * p - r * u * p + r * _ * f - i * d * f - o * _ * g + i * u * g, e[9] = r * h * p - o * c * p - r * a * f + i * c * f + o * a * g - i * h * g, e[13] = o * c * _ - r * h * _ + r * a * u - i * c * u - o * a * d + i * h * d, e[2] = l * d * p - c * m * p + c * _ * y - a * d * y - l * _ * g + a * m * g, e[6] = r * m * p - n * d * p - r * _ * y + i * d * y + n * _ * g - i * m * g, e[10] = n * c * p - r * l * p + r * a * y - i * c * y - n * a * g + i * l * g, e[14] = r * l * _ - n * c * _ - r * a * m + i * c * m + n * a * d - i * l * d, e[3] = h * m * p - l * u * p - h * _ * y + a * u * y + l * _ * f - a * m * f, e[7] = n * u * p - o * m * p + o * _ * y - i * u * y - n * _ * f + i * m * f, e[11] = o * l * p - n * h * p - o * a * y + i * h * y + n * a * f - i * l * f, e[15] = n * h * _ - o * l * _ + o * a * m - i * h * m - n * a * u + i * l * u;
            var v = s[0] * e[0] + s[1] * e[4] + s[2] * e[8] + s[3] * e[12];
            return 0 == v ? (this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this) : (this.multiplyScalar(1 / v), this)
        },
        scale: function(t) {
            var e = this.elements,
                s = t.x,
                i = t.y,
                n = t.z;
            return e[0] *= s, e[4] *= i, e[8] *= n, e[1] *= s, e[5] *= i, e[9] *= n, e[2] *= s, e[6] *= i, e[10] *= n, e[3] *= s, e[7] *= i, e[11] *= n, this
        },
        makeTranslation: function(t, e, s) {
            return this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, s, 0, 0, 0, 1), this
        },
        decompose: function(t, e, s) {
            var i = this.elements,
                n = new I.Matrix,
                o = i[0],
                r = i[1],
                a = i[2],
                l = i[4],
                h = i[5],
                c = i[6],
                _ = i[8],
                m = i[9],
                u = i[10],
                d = Math.sqrt(o * o + r * r + a * a),
                p = Math.sqrt(l * l + h * h + c * c),
                y = Math.sqrt(_ * _ + m * m + u * u);
            null == e && (e = new I.Quaternion), null == t ? t = new I.Vector(i[12], i[13], i[14]) : (t.set_x(i[12]), t.set_y(i[13]), t.set_z(i[14])), null == s ? s = new I.Vector(d, p, y) : (s.x = d, s._construct ? s.x : (null == s.listen_x || s.ignore_listeners || s.listen_x(d), s.x), s.y = p, s._construct ? s.y : (null == s.listen_y || s.ignore_listeners || s.listen_y(p), s.y), s.z = y, s._construct ? s.z : (null == s.listen_z || s.ignore_listeners || s.listen_z(y), s.z)), n.elements = this.elements.concat([]);
            var f = n.elements;
            return f[0] /= d, f[1] /= d, f[2] /= d, f[4] /= p, f[5] /= p, f[6] /= p, f[8] /= y, f[9] /= y, f[10] /= y, e.setFromRotationMatrix(n), null == this._transform ? this._transform = new I.MatrixTransform(t, e, s) : (this._transform.pos = t, this._transform.rotation = e, this._transform.scale = s), this._transform
        },
        makeFrustum: function(t, e, s, i, n, o) {
            var r = this.elements,
                a = 2 * n / (e - t),
                l = 2 * n / (i - s),
                h = (e + t) / (e - t),
                c = (i + s) / (i - s),
                _ = -(o + n) / (o - n),
                m = -2 * o * n / (o - n);
            return r[0] = a, r[4] = 0, r[8] = h, r[12] = 0, r[1] = 0, r[5] = l, r[9] = c, r[13] = 0, r[2] = 0, r[6] = 0, r[10] = _, r[14] = m, r[3] = 0, r[7] = 0, r[11] = -1, r[15] = 0, this
        },
        makePerspective: function(t, e, s, i) {
            var n = s * Math.tan(.5 * t * .017453292519943278),
                o = -n,
                r = o * e,
                a = n * e;
            return this.makeFrustum(r, a, o, n, s, i)
        },
        makeOrthographic: function(t, e, s, i, n, o) {
            var r = this.elements,
                a = e - t,
                l = s - i,
                h = o - n,
                c = (e + t) / a,
                _ = (s + i) / l,
                m = (o + n) / h;
            return r[0] = 2 / a, r[4] = 0, r[8] = 0, r[12] = -c, r[1] = 0, r[5] = 2 / l, r[9] = 0, r[13] = -_, r[2] = 0, r[6] = 0, r[10] = -2 / h, r[14] = -m, r[3] = 0, r[7] = 0, r[11] = 0, r[15] = 1, this
        },
        clone: function() {
            var t = this.elements;
            return new I.Matrix(t[0], t[4], t[8], t[12], t[1], t[5], t[9], t[13], t[2], t[6], t[10], t[14], t[3], t[7], t[11], t[15])
        },
        __class__: I.Matrix
    }, I.Quaternion = function(t, e, s, i) {
        null == i && (i = 1), null == s && (s = 0), null == e && (e = 0), null == t && (t = 0), this.ignore_euler = !1, this._construct = !1, this.ignore_listeners = !1, this.w = 0, this.z = 0, this.y = 0, this.x = 0, this._construct = !0, this.x = t, this._construct ? this.x : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), this.x), this.y = e, this._construct ? this.y : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), this.y), this.z = s, this._construct ? this.z : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this.z), this.w = i, this._construct ? this.w : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this.w), this.euler = new I.Vector, this._construct = !1
    }, i["phoenix.Quaternion"] = I.Quaternion, I.Quaternion.__name__ = !0, I.Quaternion.Listen = function(t, e) {
        t.listen_x = e, t.listen_y = e, t.listen_z = e, t.listen_w = e
    }, I.Quaternion.prototype = {
        copy: function(t) {
            return this.ignore_euler = !0, this.x = t.x, this._construct ? this.x : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), this.x), this.y = t.y, this._construct ? this.y : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), this.y), this.z = t.z, this._construct ? this.z : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this.z), this.w = t.w, this._construct ? this.w : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this.w), this.ignore_euler = !1, null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this
        },
        setFromEuler: function(t, e) {
            null == e && (e = 0);
            var s = this.x,
                i = this.y,
                n = this.z,
                o = this.w,
                r = Math.cos(t.x / 2),
                a = Math.cos(t.y / 2),
                l = Math.cos(t.z / 2),
                h = Math.sin(t.x / 2),
                c = Math.sin(t.y / 2),
                _ = Math.sin(t.z / 2);
            return 0 == e ? (s = h * a * l + r * c * _, i = r * c * l - h * a * _, n = r * a * _ + h * c * l, o = r * a * l - h * c * _) : 1 == e ? (s = h * a * l + r * c * _, i = r * c * l - h * a * _, n = r * a * _ - h * c * l, o = r * a * l + h * c * _) : 2 == e ? (s = h * a * l - r * c * _, i = r * c * l + h * a * _, n = r * a * _ + h * c * l, o = r * a * l - h * c * _) : 3 == e ? (s = h * a * l - r * c * _, i = r * c * l + h * a * _, n = r * a * _ - h * c * l, o = r * a * l + h * c * _) : 4 == e ? (s = h * a * l + r * c * _, i = r * c * l + h * a * _, n = r * a * _ - h * c * l, o = r * a * l - h * c * _) : 5 == e && (s = h * a * l - r * c * _, i = r * c * l - h * a * _, n = r * a * _ + h * c * l, o = r * a * l + h * c * _), this.ignore_euler = !0, this.x = s, this._construct ? this.x : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), this.x), this.y = i, this._construct ? this.y : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), this.y), this.z = n, this._construct ? this.z : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this.z), this.w = o, this._construct ? this.w : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this.w), this.ignore_euler = !1, null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this
        },
        setFromRotationMatrix: function(t) {
            var e, s = t.elements,
                i = s[0],
                n = s[4],
                o = s[8],
                r = s[1],
                a = s[5],
                l = s[9],
                h = s[2],
                c = s[6],
                _ = s[10],
                m = this.x,
                u = this.y,
                d = this.z,
                p = this.w,
                y = i + a + _;
            return y > 0 ? (e = .5 / Math.sqrt(y + 1), p = .25 / e, m = (c - l) * e, u = (o - h) * e, d = (r - n) * e) : i > a && i > _ ? (e = 2 * Math.sqrt(1 + i - a - _), p = (c - l) / e, m = .25 * e, u = (n + r) / e, d = (o + h) / e) : a > _ ? (e = 2 * Math.sqrt(1 + a - i - _), p = (o - h) / e, m = (n + r) / e, u = .25 * e, d = (l + c) / e) : (e = 2 * Math.sqrt(1 + _ - i - a), p = (r - n) / e, m = (o + h) / e, u = (l + c) / e, d = .25 * e), this.ignore_euler = !0, this.x = m, this._construct ? this.x : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), this.x), this.y = u, this._construct ? this.y : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), this.y), this.z = d, this._construct ? this.z : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this.z), this.w = p, this._construct ? this.w : (null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this.w), this.ignore_euler = !1, null == this.euler || this.ignore_euler || this._construct || this.euler.setEulerFromQuaternion(this, null), null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), null == this.listen_w || this.ignore_listeners || this.listen_w(this.w), this
        },
        clone: function() {
            return new I.Quaternion(this.x, this.y, this.z, this.w)
        },
        __class__: I.Quaternion
    }, I.Rectangle = function(t, e, s, i) {
        null == i && (i = 0), null == s && (s = 0), null == e && (e = 0), null == t && (t = 0), this.ignore_listeners = !1, this.h = 0, this.w = 0, this.y = 0, this.x = 0, this.set_x(t), this.set_y(e), this.set_w(s), this.set_h(i)
    }, i["phoenix.Rectangle"] = I.Rectangle, I.Rectangle.__name__ = !0, I.Rectangle.listen = function(t, e) {
        t.listen_x = e, t.listen_y = e, t.listen_w = e, t.listen_h = e
    }, I.Rectangle.prototype = {
        equal: function(t) {
            return null == t ? !1 : this.x == t.x && this.y == t.y && this.w == t.w && this.h == t.h
        },
        copy_from: function(t) {
            this.set_x(t.x), this.set_y(t.y), this.set_w(t.w), this.set_h(t.h)
        },
        set: function(t, e, s, i) {
            var n = this.x,
                o = this.y,
                r = this.w,
                a = this.h;
            return null != t && (n = t), null != e && (o = e), null != s && (r = s), null != i && (a = i), this.set_x(n), this.set_y(o), this.set_w(r), this.set_h(a), this
        },
        set_x: function(t) {
            return this.x = t, null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x
        },
        set_y: function(t) {
            return this.y = t, null == this.listen_y || this.ignore_listeners || this.listen_y(t), this.y
        },
        set_w: function(t) {
            return this.w = t, null == this.listen_w || this.ignore_listeners || this.listen_w(t), this.w
        },
        set_h: function(t) {
            return this.h = t, null == this.listen_h || this.ignore_listeners || this.listen_h(t), this.h
        },
        __class__: I.Rectangle,
        __properties__: {
            set_h: "set_h",
            set_w: "set_w",
            set_y: "set_y",
            set_x: "set_x"
        }
    }, I.RenderPath = function(t) {
        this.renderer = t
    }, i["phoenix.RenderPath"] = I.RenderPath, I.RenderPath.__name__ = !0, I.RenderPath.prototype = {
        render: function(t, e) {
            for (var s = 0; s < t.length;) {
                var i = t[s];
                ++s, i.enabled && (m.debug.start("batch." + i.name), i.draw(), e.geometry_count += i.geometry.size(), e.dynamic_batched_count += i.dynamic_batched_count, e.static_batched_count += i.static_batched_count, e.visible_count += i.visible_count, e.draw_calls += i.draw_calls, e.vert_count += i.vert_count, m.debug.end("batch." + i.name))
            }
        },
        __class__: I.RenderPath
    }, I.RenderState = function(t) {
        this._active_texture = -1, this._used_program = null, this.depth_func = -1, this.depth_test = !1, this.cull_face = !1, this.renderer = t, this._viewport = new I.Rectangle(0, 0, 0, 0)
    }, i["phoenix.RenderState"] = I.RenderState, I.RenderState.__name__ = !0, I.RenderState.prototype = {
        enable: function(t) {
            switch (t) {
                case 2884:
                    this.cull_face || (this.cull_face = !0, C.modules.opengl.web.GL.enable(2884));
                    break;
                case 2929:
                    m.core.app.config.render.depth && (this.depth_test || (this.depth_test = !0, C.modules.opengl.web.GL.enable(2929)))
            }
        },
        disable: function(t) {
            switch (t) {
                case 2884:
                    this.cull_face && (this.cull_face = !1, C.modules.opengl.web.GL.disable(2884));
                    break;
                case 2929:
                    m.core.app.config.render.depth && this.depth_test && (this.depth_test = !1, C.modules.opengl.web.GL.disable(2929))
            }
        },
        depth_function: function(t) {
            this.depth_func != t && (C.modules.opengl.web.GL.depthFunc(t), this.depth_func = t)
        },
        viewport: function(t, e, s, i) {
            if (this._viewport.x != t || this._viewport.y != e || this._viewport.w != s || this._viewport.h != i) {
                this._viewport.set_x(t), this._viewport.set_y(e), this._viewport.set_w(s), this._viewport.set_h(i);
                var n = this.renderer.target_size.y - (e + i);
                C.modules.opengl.web.GL.viewport(0 | t, 0 | n, 0 | s, 0 | i)
            }
        },
        useProgram: function(t) {
            this._used_program != t && (this._used_program = t, C.modules.opengl.web.GL.useProgram(t))
        },
        activeTexture: function(t) {
            this._active_texture != t && (C.modules.opengl.web.GL.activeTexture(t), this._active_texture = t)
        },
        bindTexture: function(t, e) {
            switch (t) {
                case 3553:
                    this.bindTexture2D(e);
                    break;
                case 34067:
                    this.bindTextureCube(e)
            }
        },
        bindTexture2D: function(t) {
            I.RenderState.bound_texture_2D != t && (I.RenderState.bound_texture_2D = t, C.modules.opengl.web.GL.bindTexture(3553, t))
        },
        bindTextureCube: function(t) {
            I.RenderState.bound_texture_cube != t && (I.RenderState.bound_texture_cube = t, C.modules.opengl.web.GL.bindTexture(34067, t))
        },
        __class__: I.RenderState
    }, I.Texture = function(t) {
        if (this.load_premultiply_alpha = !1, this.height = -1, this.width = -1, this.height_actual = -1, this.width_actual = -1, this.compressed = !1, this.border = 0, this.slot = 0, null == t) throw o.DebugError.null_assertion("_options was null (Texture create requires non-null options)");
        if (null == t.resource_type && (t.resource_type = 4), t.resource_type, o.resource.Resource.call(this, t), null == t.texture && (t.texture = this.create_texture_id()), t.texture, this.texture = t.texture, this.bind(), this.apply_default_options(t), null != t.pixels) {
            if (null == t.width) throw o.DebugError.null_assertion("_options.width was null (Texture create with pixels requires both width and height)");
            if (null == t.height) throw o.DebugError.null_assertion("_options.height was null (Texture create with pixels requires both width and height)")
        }
        if (null != t.width || null != t.height) {
            if (null == t.height) throw o.DebugError.null_assertion("_options.height was null (Texture requires both width and height, only width was given in construct options)");
            if (null == t.width) throw o.DebugError.null_assertion("_options.width was null (Texture requires both width and height, only height was given in construct options)");
            this.width = this.width_actual = t.width, this.height = this.height_actual = t.height, null != t.pixels && this.submit(t.pixels)
        }
    }, i["phoenix.Texture"] = I.Texture, I.Texture.__name__ = !0, I.Texture.max_size = function() {
        return C.modules.opengl.web.GL.getParameter(3379)
    }, I.Texture.__super__ = o.resource.Resource, I.Texture.prototype = t(o.resource.Resource.prototype, {
        submit: function(t, e, s) {
            if (null == s && (s = 0), !(s >= 0)) throw o.DebugError.assertion("_level >= 0 (Texture submit level cannot be negative)");
            var i = I.Texture.max_size();
            if (!(this.width_actual <= i)) throw o.DebugError.assertion("width_actual <= _max (Texture actual width bigger than maximum hardware size (width:$width_actual, max:$_max))");
            if (!(this.height_actual <= i)) throw o.DebugError.assertion("height_actual <= _max (Texture actual height bigger than maximum hardware size (height:$height_actual, max:$_max))");
            if (this.bind(), 3553 == this.type) null == e && (e = 3553);
            else if (null == e) throw o.DebugError.null_assertion("_target was null (Texture submit to a non 2D texture requires the _target to be specified)");
            this.compressed ? C.modules.opengl.web.GL.compressedTexImage2D(e, s, this.format, this.width_actual, this.height_actual, this.border, t) : C.modules.opengl.web.GL.texImage2D(e, s, this.format, this.width_actual, this.height_actual, this.border, this.format, this.data_type, t)
        },
        bind: function() {
            m.renderer.state.activeTexture(33984 + this.slot), m.renderer.state.bindTexture(this.type, this.texture)
        },
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed (Resource cannot reload when already destroyed)");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = C.system.assets.AssetImage.load(m.core.app.assets, t.id);
                i.then(function(s) {
                    t.texture = t.create_texture_id(), t.from_asset(s), t.set_state(3), e(t)
                }), i.error(function(e) {
                    t.set_state(4), s(e)
                })
            })
        },
        from_asset: function(t, e) {
            null == e && (e = !0), this.width = t.image.width, this.height = t.image.height, this.width_actual = t.image.width_actual, this.height_actual = t.image.height_actual, this.load_premultiply_alpha && m.utils.premultiply_alpha(t.image.pixels), this.submit(t.image.pixels), e && (t.image.pixels = null, t = null), C.modules.opengl.web.GL.texParameteri(this.type, 10241, this.filter_min), C.modules.opengl.web.GL.texParameteri(this.type, 10240, this.filter_mag), C.modules.opengl.web.GL.texParameteri(this.type, 10242, this.clamp_s), C.modules.opengl.web.GL.texParameteri(this.type, 10243, this.clamp_t)
        },
        clear: function() {
            null != this.texture && C.modules.opengl.web.GL.deleteTexture(this.texture)
        },
        create_texture_id: function() {
            return C.modules.opengl.web.GL.createTexture()
        },
        apply_default_options: function(t) {
            null == t.load_premultiply_alpha && (t.load_premultiply_alpha = !1), this.load_premultiply_alpha = t.load_premultiply_alpha, null == t.compressed && (t.compressed = !1), this.compressed = t.compressed, null == t.format && (t.format = 6408), this.format = t.format, null == t.type && (t.type = 3553), this.type = t.type, null == t.data_type && (t.data_type = 5121), this.data_type = t.data_type, this.set_filter_min(function() {
                var e;
                return null == t.filter_min && (t.filter_min = I.Texture.default_filter), e = t.filter_min
            }(this)), this.set_filter_mag(function() {
                var e;
                return null == t.filter_mag && (t.filter_mag = I.Texture.default_filter), e = t.filter_mag
            }(this)), this.set_clamp_s(function() {
                var e;
                return null == t.clamp_s && (t.clamp_s = I.Texture.default_clamp), e = t.clamp_s
            }(this)), this.set_clamp_t(function() {
                var e;
                return null == t.clamp_t && (t.clamp_t = I.Texture.default_clamp), e = t.clamp_t
            }(this))
        },
        set_clamp_s: function(t) {
            return this.bind(), C.modules.opengl.web.GL.texParameteri(this.type, 10242, t), this.clamp_s = t
        },
        set_clamp_t: function(t) {
            return this.bind(), C.modules.opengl.web.GL.texParameteri(this.type, 10243, t), this.clamp_t = t
        },
        set_filter_min: function(t) {
            return this.bind(), C.modules.opengl.web.GL.texParameteri(this.type, 10241, t), this.filter_min = t
        },
        set_filter_mag: function(t) {
            return this.bind(), C.modules.opengl.web.GL.texParameteri(this.type, 10240, t), this.filter_mag = t
        },
        __class__: I.Texture,
        __properties__: t(o.resource.Resource.prototype.__properties__, {
            set_clamp_t: "set_clamp_t",
            set_clamp_s: "set_clamp_s",
            set_filter_mag: "set_filter_mag",
            set_filter_min: "set_filter_min"
        })
    }), I.RenderTexture = function() {}, i["phoenix.RenderTexture"] = I.RenderTexture, I.RenderTexture.__name__ = !0, I.RenderTexture.__super__ = I.Texture, I.RenderTexture.prototype = t(I.Texture.prototype, {
        clear: function() {
            I.Texture.prototype.clear.call(this), null != this.fbo && C.modules.opengl.web.GL.deleteFramebuffer(this.fbo), null != this.renderbuffer && C.modules.opengl.web.GL.deleteRenderbuffer(this.renderbuffer)
        },
        __class__: I.RenderTexture
    }), I.Renderer = function(t, e) {
        this.stop = !1, this.should_clear = !0, this.core = t, this.font_asset = e, this.default_fbo = C.modules.opengl.web.GL.getParameter(36006), this.default_rbo = C.modules.opengl.web.GL.getParameter(36007)
    }, i["phoenix.Renderer"] = I.Renderer, I.Renderer.__name__ = !0, I.Renderer.prototype = {
        init: function() {
            this.state = new I.RenderState(this), this.clear_color = (new I.Color).rgb(1710618), this.stats = new I.RendererStats, this.batchers = [], this.target_size = new I.Vector(m.core.screen.get_w(), m.core.screen.get_h()), this.camera = new I.Camera, this.default_render_path = new I.RenderPath(this), this.render_path = this.default_render_path, this.create_default_shaders(), this.batcher = new I.Batcher(this, "default batcher"), this.batcher.set_layer(1), this.add_batch(this.batcher), m.core.app.config.render.depth && (this.state.enable(2929), this.state.depth_function(515), C.modules.opengl.web.GL.clearDepth(1)), C.modules.opengl.web.GL.enable(3042), C.modules.opengl.web.GL.blendFunc(770, 771), C.modules.opengl.web.GL.pixelStorei(37441, 0)
        },
        destroy: function() {
            this.clear((new I.Color).rgb(16729099))
        },
        sort_batchers: function(t, e) {
            return t.layer < e.layer ? -1 : t.layer > e.layer ? 1 : t.sequence < e.sequence ? -1 : t.sequence > e.sequence ? 1 : 1
        },
        add_batch: function(t) {
            this.batchers.push(t), this.batchers.sort(s(this, this.sort_batchers))
        },
        create_batcher: function(t) {
            var e = 2;
            null != t ? (null == t.name && (t.name = "batcher"), t.name, null == t.layer && (t.layer = e), t.layer, null == t.camera && (t.camera = new I.Camera), t.camera) : t = {
                name: "batcher",
                camera: new I.Camera,
                layer: e
            };
            var s = new I.Batcher(this, t.name);
            return s.view = t.camera, s.set_layer(t.layer), (null == t.no_add || 0 == t.no_add) && this.add_batch(s), s
        },
        clear: function(t) {
            null == t && (t = this.clear_color), C.modules.opengl.web.GL.clearColor(t.r, t.g, t.b, t.a), m.core.app.config.render.depth ? (C.modules.opengl.web.GL.clear(16640), C.modules.opengl.web.GL.clearDepth(1)) : C.modules.opengl.web.GL.clear(16384)
        },
        internal_resized: function(t, e) {
            null == this.get_target() && this.target_size.set_xy(t, e)
        },
        process: function() {
            this.stop || (this.should_clear && this.clear(this.clear_color), this.stats.batchers = this.batchers.length, this.stats.reset(), this.render_path.render(this.batchers, this.stats))
        },
        get_target: function() {
            return this.target
        },
        create_default_shaders: function() {
            {
                var t = S.Resource.getString("default.vert.glsl"),
                    e = S.Resource.getString("default.frag.glsl"),
                    s = S.Resource.getString("default.frag.textured.glsl"),
                    i = S.Resource.getString("default.frag.bitmapfont.glsl");
                C.modules.opengl.web.GL.current_context.getExtension("OES_standard_derivatives")
            }
            e = "precision mediump float;\n" + e, s = "precision mediump float;\n" + s, i = "#extension GL_OES_standard_derivatives : enable\n#extension OES_standard_derivatives : enable\nprecision mediump float;\n" + i;
            var n = new I.Shader({
                    id: "luxe.shader",
                    frag_id: "default",
                    vert_id: "default"
                }),
                r = new I.Shader({
                    id: "luxe.shader_textured",
                    frag_id: "textured",
                    vert_id: "default"
                }),
                a = new I.Shader({
                    id: "luxe.shader_bitmapfont",
                    frag_id: "bitmapfont",
                    vert_id: "default"
                }),
                l = !0;
            if (l = l && n.from_string(t, e), l = l && r.from_string(t, s), l = l && a.from_string(t, i), !l) throw o.DebugError.assertion("_ok (Default shaders failed to compile or link. See log for errors)");
            this.shaders = {
                plain: {
                    shader: n,
                    source: {
                        vert: t,
                        frag: e
                    }
                },
                textured: {
                    shader: r,
                    source: {
                        vert: t,
                        frag: s
                    }
                },
                bitmapfont: {
                    shader: a,
                    source: {
                        vert: t,
                        frag: i
                    }
                }
            }
        },
        __class__: I.Renderer,
        __properties__: {
            get_target: "get_target"
        }
    }, I.RendererStats = function() {
        this.vert_count = 0, this.group_count = 0, this.draw_calls = 0, this.visible_count = 0, this.static_batched_count = 0, this.dynamic_batched_count = 0, this.geometry_count = 0, this.batchers = 0
    }, i["phoenix.RendererStats"] = I.RendererStats, I.RendererStats.__name__ = !0, I.RendererStats.prototype = {
        reset: function() {
            this.geometry_count = 0, this.dynamic_batched_count = 0, this.static_batched_count = 0, this.visible_count = 0, this.group_count = 0, this.draw_calls = 0, this.vert_count = 0
        },
        __class__: I.RendererStats
    }, I.Shader = function(t) {
        if (this.normal_attribute = 3, this.color_attribute = 2, this.tcoord_attribute = 1, this.vert_attribute = 0, this.frag_id = "", this.vert_id = "", this.log = "", null == t) throw o.DebugError.null_assertion("_options was null");
        t.resource_type = 7, o.resource.Resource.call(this, t), this.frag_id = t.frag_id, this.vert_id = t.vert_id, this.uniforms = new S.ds.StringMap, this.uniform_textures = new S.ds.StringMap
    }, i["phoenix.Shader"] = I.Shader, I.Shader.__name__ = !0, I.Shader.__super__ = o.resource.Resource, I.Shader.prototype = t(o.resource.Resource.prototype, {
        activate: function() {
            null != this.program && m.renderer.state.useProgram(this.program)
        },
        set_float: function(t, e) {
            if (this.uniforms.exists(t)) {
                var s = this.uniforms.get(t);
                s.value = e
            } else {
                var i = {
                    name: t,
                    value: e,
                    type: 2,
                    location: C.modules.opengl.web.GL.getUniformLocation(this.program, t)
                };
                this.uniforms.set(t, i)
            }
        },
        set_vector2: function(t, e) {
            if (this.uniforms.exists(t)) {
                var s = this.uniforms.get(t);
                s.value = e
            } else {
                var i = {
                    name: t,
                    value: e,
                    type: 3,
                    location: C.modules.opengl.web.GL.getUniformLocation(this.program, t)
                };
                this.uniforms.set(t, i)
            }
        },
        set_color: function(t, e) {
            if (this.uniforms.exists(t)) {
                var s = this.uniforms.get(t);
                s.value = e
            } else {
                var i = {
                    name: t,
                    value: e,
                    type: 9,
                    location: C.modules.opengl.web.GL.getUniformLocation(this.program, t)
                };
                this.uniforms.set(t, i)
            }
        },
        set_texture: function(t, e) {
            if (this.uniforms.exists(t)) {
                var s = this.uniforms.get(t);
                s.value = e, this.uniform_textures.set(t, e)
            } else {
                var i = {
                    name: t,
                    value: e,
                    type: 10,
                    location: C.modules.opengl.web.GL.getUniformLocation(this.program, t)
                };
                this.uniforms.set(t, i), this.uniform_textures.set(t, e)
            }
        },
        format_log: function(t) {
            var e = t.split("\n");
            return e = e.filter(function(t) {
                return "" != b.trim(t)
            }), e = e.map(function(t) {
                return "		" + b.trim(t)
            }), e.join("\n")
        },
        compile: function(t, e) {
            var s = C.modules.opengl.web.GL.createShader(t);
            C.modules.opengl.web.GL.shaderSource(s, e), C.modules.opengl.web.GL.compileShader(s);
            var i = C.modules.opengl.web.GL.getShaderInfoLog(s),
                n = "";
            if (i.length > 0) {
                var o, r = 35632 == t;
                o = r ? "frag" : "vert";
                var a;
                a = r ? this.frag_id : this.vert_id, n += "\n	// start -- (" + o + " / " + a + ") compile log --\n", n += this.format_log(i), n += "\n	// end --\n"
            }
            return 0 == C.modules.opengl.web.GL.getShaderParameter(s, 35713) ? (this.log += "	Failed to compile shader `" + this.id + "`:\n", this.add_log(0 == n.length ? this.format_log(C.modules.opengl.web.GL.getShaderInfoLog(s)) : n), C.modules.opengl.web.GL.deleteShader(s), s = null, null) : s
        },
        link: function() {
            return this.program = C.modules.opengl.web.GL.createProgram(), C.modules.opengl.web.GL.attachShader(this.program, this.vert_shader), C.modules.opengl.web.GL.attachShader(this.program, this.frag_shader), C.modules.opengl.web.GL.bindAttribLocation(this.program, this.vert_attribute, "vertexPosition"), C.modules.opengl.web.GL.bindAttribLocation(this.program, this.tcoord_attribute, "vertexTCoord"), C.modules.opengl.web.GL.bindAttribLocation(this.program, this.color_attribute, "vertexColor"), C.modules.opengl.web.GL.bindAttribLocation(this.program, this.normal_attribute, "vertexNormal"), C.modules.opengl.web.GL.linkProgram(this.program), 0 == C.modules.opengl.web.GL.getProgramParameter(this.program, 35714) ? (this.log += "	Failed to link shader program:", this.add_log(this.format_log(C.modules.opengl.web.GL.getProgramInfoLog(this.program))), C.modules.opengl.web.GL.deleteProgram(this.program), this.program = null, !1) : (this.activate(), this.projectionmatrix_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "projectionMatrix"), this.modelviewmatrix_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "modelViewMatrix"), this.tex0_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex0"), this.tex1_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex1"), this.tex2_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex2"), this.tex3_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex3"), this.tex4_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex4"), this.tex5_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex5"), this.tex6_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex6"), this.tex7_attribute = C.modules.opengl.web.GL.getUniformLocation(this.program, "tex7"), !0)
        },
        clear: function() {
            null != this.vert_shader && C.modules.opengl.web.GL.deleteShader(this.vert_shader), null != this.frag_shader && C.modules.opengl.web.GL.deleteShader(this.frag_shader), null != this.program && C.modules.opengl.web.GL.deleteProgram(this.program), this.vert_source = null, this.frag_source = null
        },
        reload: function() {
            var t = this;
            if (6 == this.state) throw o.DebugError.assertion("state != ResourceState.destroyed");
            return this.clear(), new C.api.Promise(function(e, s) {
                t.set_state(2);
                var i = t.frag_id;
                switch (i) {
                    case "default":
                        t.frag_source = m.renderer.shaders.plain.source.frag;
                        break;
                    case "textured":
                        t.frag_source = m.renderer.shaders.textured.source.frag
                }
                var n = t.vert_id;
                switch (n) {
                    case "default":
                        t.vert_source = m.renderer.shaders.plain.source.vert
                }
                var o = function(e) {
                        t.set_state(4), s(e)
                    },
                    r = [C.api.Promise.resolve()];
                if (null == t.frag_source) {
                    var a = C.system.assets.AssetText.load(m.core.app.assets, t.frag_id);
                    a.then(function(e) {
                        t.frag_source = e.text
                    }), r.push(a)
                }
                if (null == t.vert_source) {
                    var l = C.system.assets.AssetText.load(m.core.app.assets, t.vert_id);
                    l.then(function(e) {
                        t.vert_source = e.text
                    }), r.push(l)
                }
                C.api.Promise.all(r).then(function() {
                    t.from_string(t.vert_source, t.frag_source) ? (t.set_state(3), e(t)) : o(C.types.Error.error("`" + t.id + "` failed to create :\n\n" + t.log))
                }).error(function(e) {
                    o(C.types.Error.error("`" + t.id + "` failed to create :\n		" + e + "\n"))
                })
            })
        },
        from_string: function(t, e) {
            var s = this;
            return this.clear(), this.frag_source = e, this.vert_source = t, this.vert_shader = this.compile(35633, this.vert_source), this.frag_shader = this.compile(35632, this.frag_source), null == this.vert_shader || null == this.frag_shader ? (s.log.length > 0, !1) : this.link() ? !0 : (s.log.length > 0, !1)
        },
        apply_uniforms: function() {
            null != this.tex0_attribute && C.modules.opengl.web.GL.uniform1i(this.tex0_attribute, 0), null != this.tex1_attribute && C.modules.opengl.web.GL.uniform1i(this.tex1_attribute, 1), null != this.tex2_attribute && C.modules.opengl.web.GL.uniform1i(this.tex2_attribute, 2), null != this.tex3_attribute && C.modules.opengl.web.GL.uniform1i(this.tex3_attribute, 3), null != this.tex4_attribute && C.modules.opengl.web.GL.uniform1i(this.tex4_attribute, 4), null != this.tex5_attribute && C.modules.opengl.web.GL.uniform1i(this.tex5_attribute, 5), null != this.tex6_attribute && C.modules.opengl.web.GL.uniform1i(this.tex6_attribute, 6), null != this.tex7_attribute && C.modules.opengl.web.GL.uniform1i(this.tex7_attribute, 7);
            for (var t = this.uniforms.iterator(); t.hasNext();) {
                var e = t.next(),
                    s = e.type;
                switch (s) {
                    case 1:
                        this.apply_int(e.location, e.value);
                        break;
                    case 2:
                        this.apply_float(e.location, e.value);
                        break;
                    case 3:
                        this.apply_vec2(e.location, e.value);
                        break;
                    case 4:
                        this.apply_vec3(e.location, e.value);
                        break;
                    case 5:
                        this.apply_vec4(e.location, e.value);
                        break;
                    case 8:
                        this.apply_mat4(e.location, e.value);
                        break;
                    case 9:
                        this.apply_color(e.location, e.value);
                        break;
                    case 10:
                        this.apply_texture(e.location, e.value);
                        break;
                    case 0:
                }
            }
        },
        apply_int: function(t, e) {
            C.modules.opengl.web.GL.uniform1i(t, e)
        },
        apply_float: function(t, e) {
            C.modules.opengl.web.GL.uniform1f(t, e)
        },
        apply_vec2: function(t, e) {
            C.modules.opengl.web.GL.uniform2f(t, e.x, e.y)
        },
        apply_vec3: function(t, e) {
            C.modules.opengl.web.GL.uniform3f(t, e.x, e.y, e.z)
        },
        apply_vec4: function(t, e) {
            C.modules.opengl.web.GL.uniform4f(t, e.x, e.y, e.z, e.w)
        },
        apply_mat4: function(t, e) {
            C.modules.opengl.web.GL.uniformMatrix4fv(t, !1, e.float32array())
        },
        apply_color: function(t, e) {
            C.modules.opengl.web.GL.uniform4f(t, e.r, e.g, e.b, e.a)
        },
        apply_texture: function(t, e) {
            C.modules.opengl.web.GL.uniform1i(t, e.slot), e.bind()
        },
        add_log: function(t) {
            this.log += t
        },
        __class__: I.Shader
    }), I.Transform = function() {
        this._destroying = !1, this._cleaning = !1, this._setup = !0, this.dirty = !0, o.ID.call(this, "transform"), this.set_local(new I.Spatial), this.set_world(new I.Spatial), this._origin_undo_matrix = new I.Matrix, this._pos_matrix = new I.Matrix, this._rotation_matrix = new I.Matrix, this.set_origin(new I.Vector), this.local.pos_changed = s(this, this.on_local_pos_change), this.local.rotation_changed = s(this, this.on_local_rotation_change), this.local.scale_changed = s(this, this.on_local_scale_change), this._setup = !1
    }, i["phoenix.Transform"] = I.Transform, I.Transform.__name__ = !0, I.Transform.__super__ = o.ID, I.Transform.prototype = t(o.ID.prototype, {
        destroy: function() {
            this._destroying = !0, null != this.parent && this.parent.unlisten(s(this, this.on_parent_cleaned)), this._clean_handlers = null, this._dirty_handlers = null, this._pos_handlers = null, this._rotation_handlers = null, this._scale_handlers = null, this._origin_handlers = null, this._parent_handlers = null, this.local.destroy(),
                function(t) {
                    var e;
                    return t._destroying || (null != t.parent && t.parent.dirty && t.parent.clean(), t.dirty && !t._cleaning && t.dirty && (t._cleaning = !0, t._pos_matrix.makeTranslation(t.local.pos.x, t.local.pos.y, t.local.pos.z), t._rotation_matrix.makeRotationFromQuaternion(t.local.rotation), t._origin_undo_matrix.makeTranslation(-t.origin.x, -t.origin.y, -t.origin.z), t.local.matrix.makeTranslation(t.origin.x, t.origin.y, t.origin.z), t.local.matrix.scale(t.local.scale), t.local.matrix.multiply(t._rotation_matrix), t.local.matrix.setPosition(t.local.pos), t.local.matrix.multiply(t._origin_undo_matrix), t.get_world().set_matrix(null != t.parent ? t.get_world().get_matrix().multiplyMatrices(t.parent.get_world().get_matrix(), t.local.matrix) : t.local.matrix.clone()), t.get_world().decompose(!1), t.dirty = !1, t.dirty && !t._setup && null != t._dirty_handlers && t._dirty_handlers.length > 0 && t.propagate_dirty(), t.dirty, t._cleaning = !1, null != t._clean_handlers && t._clean_handlers.length > 0 && t.propagate_clean())), e = t.world
                }(this).destroy(), this.local = null, this.world = null, this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this.origin = null, null != this._origin_handlers && this._origin_handlers.length > 0 && this.propagate_origin(this.origin), this.origin, this._origin_undo_matrix = null, this._pos_matrix = null, this._rotation_matrix = null
        },
        on_local_pos_change: function(t) {
            this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, null != this._pos_handlers && this._pos_handlers.length > 0 && this.propagate_pos(t)
        },
        on_local_rotation_change: function(t) {
            this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, null != this._rotation_handlers && this._rotation_handlers.length > 0 && this.propagate_rotation(t)
        },
        on_local_scale_change: function(t) {
            this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, null != this._scale_handlers && this._scale_handlers.length > 0 && this.propagate_scale(t)
        },
        on_parent_cleaned: function() {
            this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty
        },
        set_local: function(t) {
            return null != t && (this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, t.pos_changed = s(this, this.on_local_pos_change), t.rotation_changed = s(this, this.on_local_rotation_change), t.scale_changed = s(this, this.on_local_scale_change)), this.local = t
        },
        get_world: function() {
            return this._destroying || (null != this.parent && this.parent.dirty && this.parent.clean(), this.dirty && !this._cleaning && this.dirty && (this._cleaning = !0, this._pos_matrix.makeTranslation(this.local.pos.x, this.local.pos.y, this.local.pos.z), this._rotation_matrix.makeRotationFromQuaternion(this.local.rotation), this._origin_undo_matrix.makeTranslation(-this.origin.x, -this.origin.y, -this.origin.z), this.local.matrix.makeTranslation(this.origin.x, this.origin.y, this.origin.z), this.local.matrix.scale(this.local.scale), this.local.matrix.multiply(this._rotation_matrix), this.local.matrix.setPosition(this.local.pos), this.local.matrix.multiply(this._origin_undo_matrix), this.get_world().set_matrix(null != this.parent ? this.get_world().get_matrix().multiplyMatrices(this.parent.get_world().get_matrix(), this.local.matrix) : this.local.matrix.clone()), this.get_world().decompose(!1), this.dirty = !1, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this._cleaning = !1, null != this._clean_handlers && this._clean_handlers.length > 0 && this.propagate_clean())), this.world
        },
        clean_check: function() {
            null != this.parent && this.parent.dirty && this.parent.clean(), this.dirty && !this._cleaning && this.dirty && (this._cleaning = !0, this._pos_matrix.makeTranslation(this.local.pos.x, this.local.pos.y, this.local.pos.z), this._rotation_matrix.makeRotationFromQuaternion(this.local.rotation), this._origin_undo_matrix.makeTranslation(-this.origin.x, -this.origin.y, -this.origin.z), this.local.matrix.makeTranslation(this.origin.x, this.origin.y, this.origin.z), this.local.matrix.scale(this.local.scale), this.local.matrix.multiply(this._rotation_matrix), this.local.matrix.setPosition(this.local.pos), this.local.matrix.multiply(this._origin_undo_matrix), this.get_world().set_matrix(null != this.parent ? this.get_world().get_matrix().multiplyMatrices(this.parent.get_world().get_matrix(), this.local.matrix) : this.local.matrix.clone()), this.get_world().decompose(!1), this.dirty = !1, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this._cleaning = !1, null != this._clean_handlers && this._clean_handlers.length > 0 && this.propagate_clean())
        },
        clean: function() {
            this.dirty && (this._cleaning = !0, this._pos_matrix.makeTranslation(this.local.pos.x, this.local.pos.y, this.local.pos.z), this._rotation_matrix.makeRotationFromQuaternion(this.local.rotation), this._origin_undo_matrix.makeTranslation(-this.origin.x, -this.origin.y, -this.origin.z), this.local.matrix.makeTranslation(this.origin.x, this.origin.y, this.origin.z), this.local.matrix.scale(this.local.scale), this.local.matrix.multiply(this._rotation_matrix), this.local.matrix.setPosition(this.local.pos), this.local.matrix.multiply(this._origin_undo_matrix), this.get_world().set_matrix(null != this.parent ? this.get_world().get_matrix().multiplyMatrices(this.parent.get_world().get_matrix(), this.local.matrix) : this.local.matrix.clone()), this.get_world().decompose(!1), this.dirty = !1, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this._cleaning = !1, null != this._clean_handlers && this._clean_handlers.length > 0 && this.propagate_clean())
        },
        set_origin: function(t) {
            return this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this.origin = t, null != this._origin_handlers && this._origin_handlers.length > 0 && this.propagate_origin(this.origin), this.origin
        },
        set_world: function(t) {
            return null == t ? this.world = t : (this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, this.world = t)
        },
        set_parent: function(t) {
            return this.dirty = !0, this.dirty && !this._setup && null != this._dirty_handlers && this._dirty_handlers.length > 0 && this.propagate_dirty(), this.dirty, null != this.parent && this.parent.unlisten(s(this, this.on_parent_cleaned)), this.parent = t, null != this._parent_handlers && this._parent_handlers.length > 0 && this.propagate_parent(this.parent), null != this.parent && this.parent.listen(s(this, this.on_parent_cleaned)), this.parent
        },
        get_pos: function() {
            return this.local.pos
        },
        set_pos: function(t) {
            return this.local.set_pos(t)
        },
        set_rotation: function(t) {
            return this.local.set_rotation(t)
        },
        set_scale: function(t) {
            return this.local.set_scale(t)
        },
        propagate_clean: function() {
            for (var t = 0, e = this._clean_handlers; t < e.length;) {
                var s = e[t];
                ++t, null != s && s(this)
            }
        },
        propagate_dirty: function() {
            for (var t = 0, e = this._dirty_handlers; t < e.length;) {
                var s = e[t];
                ++t, null != s && s(this)
            }
        },
        propagate_pos: function(t) {
            for (var e = 0, s = this._pos_handlers; e < s.length;) {
                var i = s[e];
                ++e, null != i && i(t)
            }
        },
        propagate_rotation: function(t) {
            for (var e = 0, s = this._rotation_handlers; e < s.length;) {
                var i = s[e];
                ++e, null != i && i(t)
            }
        },
        propagate_scale: function(t) {
            for (var e = 0, s = this._scale_handlers; e < s.length;) {
                var i = s[e];
                ++e, null != i && i(t)
            }
        },
        propagate_origin: function(t) {
            for (var e = 0, s = this._origin_handlers; e < s.length;) {
                var i = s[e];
                ++e, null != i && i(t)
            }
        },
        propagate_parent: function(t) {
            for (var e = 0, s = this._parent_handlers; e < s.length;) {
                var i = s[e];
                ++e, null != i && i(t)
            }
        },
        listen: function(t) {
            null == this._clean_handlers && (this._clean_handlers = []), this._clean_handlers.push(t)
        },
        unlisten: function(t) {
            return null == this._clean_handlers ? !1 : h.remove(this._clean_handlers, t)
        },
        listen_pos: function(t) {
            null == this._pos_handlers && (this._pos_handlers = []), this._pos_handlers.push(t)
        },
        listen_scale: function(t) {
            null == this._scale_handlers && (this._scale_handlers = []), this._scale_handlers.push(t)
        },
        listen_rotation: function(t) {
            null == this._rotation_handlers && (this._rotation_handlers = []), this._rotation_handlers.push(t)
        },
        listen_origin: function(t) {
            null == this._origin_handlers && (this._origin_handlers = []), this._origin_handlers.push(t)
        },
        listen_parent: function(t) {
            null == this._parent_handlers && (this._parent_handlers = []), this._parent_handlers.push(t)
        },
        __class__: I.Transform,
        __properties__: {
            set_scale: "set_scale",
            set_rotation: "set_rotation",
            set_pos: "set_pos",
            get_pos: "get_pos",
            set_origin: "set_origin",
            set_world: "set_world",
            get_world: "get_world",
            set_local: "set_local",
            set_parent: "set_parent"
        }
    }), I.Spatial = function() {
        this._setup = !0, this.auto_decompose = !1, this.ignore_listeners = !1, this.set_matrix(new I.Matrix), this.floats = this.matrix.float32array(), this.set_pos(new I.Vector), this.set_rotation(new I.Quaternion), this.set_scale(new I.Vector(1, 1, 1)), this._setup = !1
    }, i["phoenix.Spatial"] = I.Spatial, I.Spatial.__name__ = !0, I.Spatial.prototype = {
        destroy: function() {
            this.matrix = null, this.matrix, this.floats = null, this.pos = null, this.pos, this.rotation = null, this.rotation, this.scale = null, this.scale
        },
        decompose: function(t) {
            if (null == t && (t = !0), this.auto_decompose || t) {
                var e = this.matrix.decompose(null, null, null);
                this.set_pos(e.pos), this.set_rotation(e.rotation), this.set_scale(e.scale)
            }
            return this
        },
        get_matrix: function() {
            return this.matrix
        },
        set_matrix: function(t) {
            return this.matrix = t, null != t && (this.floats = this.matrix.float32array()), this.matrix
        },
        set_pos: function(t) {
            return this.pos = t, null != t && (I.Vector.Listen(this.pos, s(this, this._pos_change)), null == this.pos_changed || this.ignore_listeners || this.pos_changed(this.pos)), this.pos
        },
        set_rotation: function(t) {
            return this.rotation = t, null != t && (I.Quaternion.Listen(this.rotation, s(this, this._rotation_change)), null == this.rotation_changed || this.ignore_listeners || this.rotation_changed(this.rotation)), this.rotation
        },
        set_scale: function(t) {
            return this.scale = t, null != t && (I.Vector.Listen(this.scale, s(this, this._scale_change)), null == this.scale_changed || this.ignore_listeners || this.scale_changed(this.scale)), this.scale
        },
        _pos_change: function() {
            this.set_pos(this.pos)
        },
        _scale_change: function() {
            this.set_scale(this.scale)
        },
        _rotation_change: function() {
            this.set_rotation(this.rotation)
        },
        __class__: I.Spatial,
        __properties__: {
            set_matrix: "set_matrix",
            get_matrix: "get_matrix",
            set_scale: "set_scale",
            set_rotation: "set_rotation",
            set_pos: "set_pos"
        }
    }, I.Vector = function(t, e, s, i) {
        null == i && (i = 0), null == s && (s = 0), null == e && (e = 0), null == t && (t = 0), this._construct = !1, this.ignore_listeners = !1, this.w = 0, this.z = 0, this.y = 0, this.x = 0, this._construct = !0, this.x = t, this._construct ? this.x : (null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x), this.y = e, this._construct ? this.y : (null == this.listen_y || this.ignore_listeners || this.listen_y(e), this.y), this.z = s, this._construct ? this.z : (null == this.listen_z || this.ignore_listeners || this.listen_z(s), this.z), this.w = i, this._construct = !1
    }, i["phoenix.Vector"] = I.Vector, I.Vector.__name__ = !0, I.Vector.Divide = function(t, e) {
        return new I.Vector(t.x / e, t.y / e, t.z / e)
    }, I.Vector.Listen = function(t, e) {
        t.listen_x = e, t.listen_y = e, t.listen_z = e
    }, I.Vector.prototype = {
        copy_from: function(t) {
            return this.set(t.x, t.y, t.z, t.w), this
        },
        set: function(t, e, s, i) {
            var n = this.ignore_listeners;
            return this.ignore_listeners = !0, this.x = t, this._construct ? this.x : (null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x), this.y = e, this._construct ? this.y : (null == this.listen_y || this.ignore_listeners || this.listen_y(e), this.y), this.z = s, this._construct ? this.z : (null == this.listen_z || this.ignore_listeners || this.listen_z(s), this.z), this.w = i, this.ignore_listeners = n, null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this
        },
        set_xy: function(t, e) {
            var s = this.ignore_listeners;
            return this.ignore_listeners = !0, this.x = t, this._construct ? this.x : (null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x), this.y = e, this._construct ? this.y : (null == this.listen_y || this.ignore_listeners || this.listen_y(e), this.y), this.ignore_listeners = s, null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), this
        },
        set_xyz: function(t, e, s) {
            var i = this.ignore_listeners;
            return this.ignore_listeners = !0, this.x = t, this._construct ? this.x : (null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x), this.y = e, this._construct ? this.y : (null == this.listen_y || this.ignore_listeners || this.listen_y(e), this.y), this.z = s, this._construct ? this.z : (null == this.listen_z || this.ignore_listeners || this.listen_z(s), this.z), this.ignore_listeners = i, null == this.listen_x || this.ignore_listeners || this.listen_x(this.x), null == this.listen_y || this.ignore_listeners || this.listen_y(this.y), null == this.listen_z || this.ignore_listeners || this.listen_z(this.z), this
        },
        clone: function() {
            return new I.Vector(this.x, this.y, this.z, this.w)
        },
        dot: function(t) {
            return this.x * t.x + this.y * t.y + this.z * t.z
        },
        divideScalar: function(t) {
            return 0 != t ? this.set_xyz(this.x / t, this.y / t, this.z / t) : this.set_xyz(0, 0, 0), this
        },
        get_length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        },
        get_normalized: function() {
            return I.Vector.Divide(this, Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z))
        },
        set_x: function(t) {
            return this.x = t, this._construct ? this.x : (null == this.listen_x || this.ignore_listeners || this.listen_x(t), this.x)
        },
        set_y: function(t) {
            return this.y = t, this._construct ? this.y : (null == this.listen_y || this.ignore_listeners || this.listen_y(t), this.y)
        },
        set_z: function(t) {
            return this.z = t, this._construct ? this.z : (null == this.listen_z || this.ignore_listeners || this.listen_z(t), this.z)
        },
        transform: function(t) {
            var e = this.x,
                s = this.y,
                i = this.z,
                n = t.elements;
            return this.set_xyz(n[0] * e + n[4] * s + n[8] * i + n[12], n[1] * e + n[5] * s + n[9] * i + n[13], n[2] * e + n[6] * s + n[10] * i + n[14]), this
        },
        setEulerFromQuaternion: function(t, e) {
            null == e && (e = 0);
            var s = t.x * t.x,
                i = t.y * t.y,
                n = t.z * t.z,
                r = t.w * t.w,
                a = this.x,
                l = this.y,
                h = this.z;
            return 0 == e ? (a = Math.atan2(2 * (t.x * t.w - t.y * t.z), r - s - i + n), l = Math.asin(o.utils.Maths.clamp(2 * (t.x * t.z + t.y * t.w), -1, 1)), h = Math.atan2(2 * (t.z * t.w - t.x * t.y), r + s - i - n)) : 1 == e ? (a = Math.asin(o.utils.Maths.clamp(2 * (t.x * t.w - t.y * t.z), -1, 1)), l = Math.atan2(2 * (t.x * t.z + t.y * t.w), r - s - i + n), h = Math.atan2(2 * (t.x * t.y + t.z * t.w), r - s + i - n)) : 2 == e ? (a = Math.asin(o.utils.Maths.clamp(2 * (t.x * t.w + t.y * t.z), -1, 1)), l = Math.atan2(2 * (t.y * t.w - t.z * t.x), r - s - i + n), h = Math.atan2(2 * (t.z * t.w - t.x * t.y), r - s + i - n)) : 3 == e ? (a = Math.atan2(2 * (t.x * t.w + t.z * t.y), r - s - i + n), l = Math.asin(o.utils.Maths.clamp(2 * (t.y * t.w - t.x * t.z), -1, 1)), h = Math.atan2(2 * (t.x * t.y + t.z * t.w), r + s - i - n)) : 4 == e ? (a = Math.atan2(2 * (t.x * t.w - t.z * t.y), r - s + i - n), l = Math.atan2(2 * (t.y * t.w - t.x * t.z), r + s - i - n), h = Math.asin(o.utils.Maths.clamp(2 * (t.x * t.y + t.z * t.w), -1, 1))) : 5 == e && (a = Math.atan2(2 * (t.x * t.w + t.y * t.z), r - s + i - n), l = Math.atan2(2 * (t.x * t.z + t.y * t.w), r + s - i - n), h = Math.asin(o.utils.Maths.clamp(2 * (t.z * t.w - t.x * t.y), -1, 1))), this.set_xyz(a, l, h), this
        },
        __class__: I.Vector,
        __properties__: {
            get_normalized: "get_normalized",
            get_length: "get_length",
            set_z: "set_z",
            set_y: "set_y",
            set_x: "set_x"
        }
    }, I.geometry = {}, I.geometry.Geometry = function(t) {
        this.dirty = !1, this.locked = !1, this.immediate = !1, this.visible = !0, this.dirty_clip = !1, this.dirty_depth = !1, this.dirty_group = !1, this.dirty_shader = !1, this.dirty_texture = !1, this.dirty_primitive_type = !1, this.shadow_clip = !1, this.shadow_depth = 0, this.shadow_group = 0, this.id = "", this.uuid = "", this.dropped = !1, this.added = !1, this.submitted = !1, this.uuid = m.utils.uniqueid(null), this.id = this.uuid, this.vertices = new Array, this.state = new I.geometry.GeometryState, this.batchers = new Array, this.transform = new I.Transform, this._final_vert_position = new I.Vector, this.set_clip_rect(null), this.set_clip(!1);
        var e = !0;
        null != t ? (null == t.id && (t.id = this.uuid), this.id = t.id, this.set_color(function() {
            var e;
            return null == t.color && (t.color = new I.Color), e = t.color
        }(this)), this.set_visible(function() {
            var e;
            return null == t.visible && (t.visible = !0), e = t.visible
        }(this)), null == t.immediate && (t.immediate = !1), this.immediate = t.immediate, null == t.no_batcher_add && (t.no_batcher_add = !0), e = t.no_batcher_add, this.state.set_depth(function(e) {
            var s;
            return null == t.depth && (t.depth = e.state.depth), s = t.depth
        }(this)), this.state.set_group(function(e) {
            var s;
            return null == t.group && (t.group = e.state.group), s = t.group
        }(this)), this.state.set_texture(function(e) {
            var s;
            return null == t.texture && (t.texture = e.state.texture), s = t.texture
        }(this)), this.state.set_clip_rect(function(e) {
            var s;
            return null == t.clip_rect && (t.clip_rect = e.state.clip_rect), s = t.clip_rect
        }(this)), this.state.set_primitive_type(function(e) {
            var s;
            return null == t.primitive_type && (t.primitive_type = e.state.primitive_type), s = t.primitive_type
        }(this)), this.state.set_shader(function(e) {
            var s;
            return null == t.shader && (t.shader = e.state.shader), s = t.shader
        }(this)), this.transform.set_pos(function(e) {
            var s;
            return null == t.pos && (t.pos = e.transform.local.pos), s = t.pos
        }(this)), this.transform.set_rotation(function(e) {
            var s;
            return null == t.rotation && (t.rotation = e.transform.local.rotation), s = t.rotation
        }(this)), this.transform.set_scale(function(e) {
            var s;
            return null == t.scale && (t.scale = e.transform.local.scale), s = t.scale
        }(this)), this.transform.set_origin(function(e) {
            var s;
            return null == t.origin && (t.origin = e.transform.origin), s = t.origin
        }(this))) : this.set_color(new I.Color), I.geometry.Geometry._sequence_key++, this.key = new I.geometry.GeometryKey, this.key.uuid = this.uuid, this.key.timestamp = C.Snow.core.timestamp(), this.key.sequence = I.geometry.Geometry._sequence_key, this.key.primitive_type = this.state.primitive_type, this.key.texture = this.state.texture, this.key.shader = this.state.shader, this.key.group = this.state.group, this.key.depth = this.state.depth, this.key.clip = this.state.clip, this.transform.id = this.uuid, this.transform.name = this.id, null != t && null != t.batcher && e && t.batcher.add(this)
    }, i["phoenix.geometry.Geometry"] = I.geometry.Geometry, I.geometry.Geometry.__name__ = !0, I.geometry.Geometry.prototype = {
        refresh_key: function() {
            this.key.uuid = this.uuid, this.key.timestamp = C.Snow.core.timestamp(), this.key.sequence = I.geometry.Geometry._sequence_key, this.key.primitive_type = this.state.primitive_type, this.key.texture = this.state.texture, this.key.shader = this.state.shader, this.key.group = this.state.group, this.key.depth = this.state.depth, this.key.clip = this.state.clip
        },
        drop: function(t) {
            if (null == t && (t = !0), t && this.added)
                for (var e = 0, s = this.batchers; e < s.length;) {
                    var i = s[e];
                    ++e, i.remove(this, !0)
                }
            null != this.transform && (this.transform.destroy(), this.transform = null), this.dropped = !0
        },
        add: function(t) {
            if (this.vertices.push(t), this.vertices.length > m.renderer.batcher.max_verts) throw "" + this.id + " / Currently a single geometry cannot exceed the maximum vert count of " + m.renderer.batcher.max_verts
        },
        batch: function(t, e, s, i, n, o, r) {
            for (var a = 0, l = this.vertices; a < l.length;) {
                var h = l[a];
                ++a, this._final_vert_position.set(h.pos.x, h.pos.y, h.pos.z, h.pos.w), this._final_vert_position.transform(this.transform.get_world().get_matrix()), n[t] = this._final_vert_position.x, n[t + 1] = this._final_vert_position.y, n[t + 2] = this._final_vert_position.z, n[t + 3] = this._final_vert_position.w, t += 4, o[e] = h.uv.uv0.u, o[e + 1] = h.uv.uv0.v, o[e + 2] = h.uv.uv0.w, o[e + 3] = h.uv.uv0.t, e += 4, r[s] = h.color.r, r[s + 1] = h.color.g, r[s + 2] = h.color.b, r[s + 3] = h.color.a, s += 4
            }
        },
        set_locked: function(t) {
            return this.locked = t
        },
        get_locked: function() {
            return this.locked
        },
        set_dirty: function(t) {
            return this.dirty = t
        },
        get_dirty: function() {
            return this.dirty
        },
        refresh: function() {
            for (var t = 0, e = this.batchers; t < e.length;) {
                var s = e[t];
                ++t, s.remove(this, !1)
            }
            this.dirty_primitive_type && (this.dirty_primitive_type = !1, this.state.set_primitive_type(this.shadow_primitive_type)), this.dirty_texture && (this.dirty_texture = !1, this.state.set_texture(this.shadow_texture)), this.dirty_shader && (this.dirty_shader = !1, this.state.set_shader(this.shadow_shader)), this.dirty_group && (this.dirty_group = !1, this.state.set_group(this.shadow_group)), this.dirty_depth && (this.dirty_depth = !1, this.state.set_depth(this.shadow_depth)), this.dirty_clip && (this.dirty_clip = !1, this.state.set_clip(this.shadow_clip)), this.refresh_key();
            for (var i = 0, n = this.batchers; i < n.length;) {
                var o = n[i];
                ++i, o.add(this, !1)
            }
        },
        get_primitive_type: function() {
            return this.state.primitive_type
        },
        set_primitive_type: function(t) {
            return this.state.primitive_type != t && (this.shadow_primitive_type = t, this.dirty_primitive_type = !0, this.refresh()), this.primitive_type = t
        },
        get_texture: function() {
            return this.state.texture
        },
        set_texture: function(t) {
            return this.state.texture != t && (this.shadow_texture = t, this.dirty_texture = !0, this.refresh()), this.texture = t
        },
        set_visible: function(t) {
            return this.visible = t
        },
        set_color: function(t) {
            for (var e = 0, s = this.vertices; e < s.length;) {
                var i = s[e];
                ++e, i.color = t
            }
            return this.color = t
        },
        get_shader: function() {
            return this.state.shader
        },
        set_shader: function(t) {
            return this.state.shader != t && (this.shadow_shader = t, this.dirty_shader = !0, this.refresh()), this.shader = t
        },
        set_depth: function(t) {
            return this.state.depth != t && (this.shadow_depth = t, this.dirty_depth = !0, this.refresh()), this.depth = t
        },
        set_group: function(t) {
            return this.state.group != t && (this.shadow_group = t, this.dirty_group = !0, this.refresh()), this.group = t
        },
        set_clip: function(t) {
            return this.state.clip != t && (this.shadow_clip = t, this.dirty_clip = !0, this.refresh()), this.clip = t
        },
        get_clip_rect: function() {
            return this.state.clip_rect
        },
        set_clip_rect: function(t) {
            return this.set_clip(null == t ? !1 : !0), this.state.set_clip_rect(t)
        },
        __class__: I.geometry.Geometry,
        __properties__: {
            set_clip_rect: "set_clip_rect",
            get_clip_rect: "get_clip_rect",
            set_clip: "set_clip",
            set_color: "set_color",
            set_dirty: "set_dirty",
            get_dirty: "get_dirty",
            set_locked: "set_locked",
            get_locked: "get_locked",
            set_visible: "set_visible",
            set_group: "set_group",
            set_depth: "set_depth",
            set_shader: "set_shader",
            get_shader: "get_shader",
            set_texture: "set_texture",
            get_texture: "get_texture",
            set_primitive_type: "set_primitive_type",
            get_primitive_type: "get_primitive_type"
        }
    }, I.geometry.GeometryKey = function() {
        this.clip = !1, this.depth = 0, this.group = 0, this.uuid = "", this.sequence = 0, this.timestamp = 0
    }, i["phoenix.geometry.GeometryKey"] = I.geometry.GeometryKey, I.geometry.GeometryKey.__name__ = !0, I.geometry.GeometryKey.prototype = {
        __class__: I.geometry.GeometryKey
    }, I.geometry.GeometryState = function() {
        this.set_clip(!1), this.set_clip_rect(new I.Rectangle), this.set_texture(null), this.set_shader(null), this.set_group(0), this.set_depth(0), this.set_primitive_type(0), this.dirty = !1
    }, i["phoenix.geometry.GeometryState"] = I.geometry.GeometryState, I.geometry.GeometryState.__name__ = !0, I.geometry.GeometryState.prototype = {
        clone_onto: function(t) {
            t.dirty = this.dirty, t.set_texture(this.texture), t.set_shader(this.shader), t.set_group(this.group), t.set_depth(this.depth), t.set_primitive_type(this.primitive_type), t.set_clip(this.clip), t.clip_rect.copy_from(this.clip_rect)
        },
        clean: function() {
            this.dirty = !1
        },
        update: function(t) {
            this.depth != t.depth && this.set_depth(t.depth), this.group != t.group && this.set_group(t.group), this.texture != t.texture && this.set_texture(t.texture), this.shader != t.shader && this.set_shader(t.shader), this.primitive_type != t.primitive_type && this.set_primitive_type(t.primitive_type), this.clip != t.clip && this.set_clip(t.clip), null != this.clip_rect && (null == t.clip_rect || this.clip_rect.equal(t.clip_rect) || this.clip_rect.set(t.clip_rect.x, t.clip_rect.y, t.clip_rect.w, t.clip_rect.h))
        },
        set_primitive_type: function(t) {
            return this.dirty = !0, this.primitive_type = t
        },
        set_texture: function(t) {
            return this.dirty = !0, this.texture = t
        },
        set_shader: function(t) {
            return this.dirty = !0, this.shader = t
        },
        set_depth: function(t) {
            return this.depth = t
        },
        set_group: function(t) {
            return this.dirty = !0, this.group = t
        },
        set_clip: function(t) {
            return this.dirty = !0, this.clip = t
        },
        set_clip_rect: function(t) {
            return this.dirty = !0, this.clip_rect = t
        },
        __class__: I.geometry.GeometryState,
        __properties__: {
            set_clip_rect: "set_clip_rect",
            set_clip: "set_clip",
            set_group: "set_group",
            set_depth: "set_depth",
            set_texture: "set_texture",
            set_shader: "set_shader",
            set_primitive_type: "set_primitive_type"
        }
    }, I.geometry.QuadGeometry = function(t) {
        if (this.is_set = !1, this.flipy = !1, this.flipx = !1, I.geometry.Geometry.call(this, t), null != t) {
            null != t.flipx && this.set_flipx(t.flipx), null != t.flipy && this.set_flipy(t.flipy);
            var e = t.x,
                s = t.y,
                i = t.w,
                n = t.h;
            null != t.rect && (e = t.rect.x, s = t.rect.y, i = t.rect.w, n = t.rect.h), this._uv_cache = new I.Rectangle(0, 0, 1, 1), this.set(new I.Rectangle(e, s, i, n)), null != t.visible && this.set_visible(t.visible), null != t.immediate && (this.immediate = t.immediate)
        }
    }, i["phoenix.geometry.QuadGeometry"] = I.geometry.QuadGeometry, I.geometry.QuadGeometry.__name__ = !0, I.geometry.QuadGeometry.__super__ = I.geometry.Geometry, I.geometry.QuadGeometry.prototype = t(I.geometry.Geometry.prototype, {
        uv: function(t) {
            if (null != this.get_texture()) {
                var e = t.x / this.get_texture().width_actual,
                    s = t.y / this.get_texture().height_actual,
                    i = t.w / this.get_texture().width_actual,
                    n = t.h / this.get_texture().height_actual;
                this.uv_space(new I.Rectangle(e, s, i, n))
            }
        },
        uv_space: function(t) {
            var e = t.w,
                s = t.h,
                i = t.x,
                n = t.y;
            this._uv_cache.set(i, n, e, s);
            var o = i + e,
                r = n,
                a = i + e,
                l = n + s,
                h = i,
                c = n + s,
                _ = 0,
                m = 0;
            this.flipy && (m = c, c = n, n = m, m = l, l = r, r = m), this.flipx && (_ = o, o = i, i = _, _ = a, a = h, h = _), this.vertices[0].uv.uv0.set_uv(i, n), this.vertices[1].uv.uv0.set_uv(o, r), this.vertices[2].uv.uv0.set_uv(a, l), this.vertices[3].uv.uv0.set_uv(h, c), this.vertices[4].uv.uv0.set_uv(i, n), this.vertices[5].uv.uv0.set_uv(a, l), this.set_dirty(!0)
        },
        resize_xy: function(t, e) {
            this.vertices[0].pos.set_xy(0, 0), this.vertices[1].pos.set_xy(t, 0), this.vertices[2].pos.set_xy(t, e), this.vertices[3].pos.set_xy(0, e), this.vertices[4].pos.set_xy(0, 0), this.vertices[5].pos.set_xy(t, e)
        },
        resize: function(t) {
            this.resize_xy(t.x, t.y)
        },
        set: function(t) {
            this.vertices.splice(0, this.vertices.length);
            var e = new I.geometry.Vertex(new I.Vector(0, 0), this.color),
                s = new I.geometry.Vertex(new I.Vector(t.w, 0), this.color),
                i = new I.geometry.Vertex(new I.Vector(t.w, t.h), this.color),
                n = new I.geometry.Vertex(new I.Vector(0, t.h), this.color),
                o = new I.geometry.Vertex(new I.Vector(0, 0), this.color),
                r = new I.geometry.Vertex(new I.Vector(t.w, t.h), this.color);
            this.add(e), this.add(s), this.add(i), this.add(n), this.add(o), this.add(r), this.set_primitive_type(4), this.immediate = !1, this.transform.set_pos(new I.Vector(t.x, t.y)), this.is_set = !0, this.uv_space(new I.Rectangle(0, 0, 1, 1))
        },
        set_flipx: function(t) {
            return this.flipx = t, this.is_set && this.uv_space(this._uv_cache), this.flipx
        },
        set_flipy: function(t) {
            return this.flipy = t, this.is_set && this.uv_space(this._uv_cache), this.flipy
        },
        __class__: I.geometry.QuadGeometry,
        __properties__: t(I.geometry.Geometry.prototype.__properties__, {
            set_flipy: "set_flipy",
            set_flipx: "set_flipx"
        })
    }), I.geometry.RectangleGeometry = function(t) {
        I.geometry.Geometry.call(this, t), null != t && this.set(t)
    }, i["phoenix.geometry.RectangleGeometry"] = I.geometry.RectangleGeometry, I.geometry.RectangleGeometry.__name__ = !0, I.geometry.RectangleGeometry.__super__ = I.geometry.Geometry, I.geometry.RectangleGeometry.prototype = t(I.geometry.Geometry.prototype, {
        set: function(t) {
            this.vertices.splice(0, this.vertices.length);
            var e = t.x,
                s = t.y,
                i = t.w,
                n = t.h;
            null != t.rect && (e = t.rect.x, s = t.rect.y, i = t.rect.w, n = t.rect.h);
            var o = new I.geometry.Vertex(new I.Vector(0, 0));
            o.uv.uv0.set_uv(0, 0);
            var r = new I.geometry.Vertex(new I.Vector(i, 0));
            r.uv.uv0.set_uv(1, 0);
            var a = new I.geometry.Vertex(new I.Vector(i, 0));
            a.uv.uv0.set_uv(1, 0);
            var l = new I.geometry.Vertex(new I.Vector(i, n));
            l.uv.uv0.set_uv(1, 1);
            var h = new I.geometry.Vertex(new I.Vector(i, n));
            h.uv.uv0.set_uv(1, 1);
            var c = new I.geometry.Vertex(new I.Vector(0, n));
            c.uv.uv0.set_uv(0, 1);
            var _ = new I.geometry.Vertex(new I.Vector(0, n));
            _.uv.uv0.set_uv(0, 1);
            var m = new I.geometry.Vertex(new I.Vector(0, 0));
            m.uv.uv0.set_uv(0, 0), this.add(o), this.add(r), this.add(a), this.add(l), this.add(h), this.add(c), this.add(_), this.add(m), this.set_primitive_type(1), null == t.immediate && (t.immediate = !1), this.immediate = t.immediate, this.set_visible(function() {
                var e;
                return null == t.visible && (t.visible = !0), e = t.visible
            }(this)), this.set_color(function() {
                var e;
                return null == t.color && (t.color = new I.Color), e = t.color
            }(this)), this.transform.set_pos(new I.Vector(e, s))
        },
        __class__: I.geometry.RectangleGeometry
    }), I.geometry.TextGeometry = function(t) {
        if (this.dirty_align = !0, this.dirty_sizing = !0, this.point_ratio = 1, this.text_h_h = 0, this.text_h_w = 0, this.text_height = 0, this.text_width = 0, this.glow_amount = 0, this.glow_threshold = 0, this.outline = 0, this.thickness = .5, this.smoothness = .75, this.unique = !1, this.sdf = !1, this.bounds_wrap = !1, this.letter_spacing = 0, this.line_spacing = 0, this.point_size = 32, this.text = "", this.options = t, this.emitter = new o.Emitter, null == this.options) throw o.DebugError.null_assertion("options was null (TextGeometry requires non-null options)");
        null != this.options.sdf && (this.sdf = this.options.sdf), null == this.options.font && (this.options.font = m.renderer.font), this.font = this.options.font, this.font == m.renderer.font && (this.sdf = !0), null == this.options.shader ? this.options.shader = this.sdf ? m.renderer.shaders.bitmapfont.shader : m.renderer.shaders.textured.shader : this.options.shader != m.renderer.shaders.bitmapfont.shader && (this.unique = !0), I.geometry.Geometry.call(this, this.options), this.set_primitive_type(4), this.cache = [], this.line_widths = [], this.line_offsets = [
            [],
            []
        ], this.lines = [], this.set_outline_color(new I.Color), this.set_glow_color(new I.Color), this.default_options()
    }, i["phoenix.geometry.TextGeometry"] = I.geometry.TextGeometry, I.geometry.TextGeometry.__name__ = !0, I.geometry.TextGeometry.__super__ = I.geometry.Geometry, I.geometry.TextGeometry.prototype = t(I.geometry.Geometry.prototype, {
        default_options: function() {
            this.set_texture(this.font.pages.get(0)), null != this.options.letter_spacing && (this.letter_spacing = this.options.letter_spacing, this.dirty_align = !0, this.dirty_sizing = !0, this.update_text(), this.letter_spacing), null != this.options.line_spacing && (this.line_spacing = this.options.line_spacing, this.dirty_align = !0, this.dirty_sizing = !0, this.update_text(), this.line_spacing), null != this.options.point_size && this.set_point_size(this.options.point_size), null != this.options.bounds && (this.bounds = this.options.bounds, this.dirty_align = !0, this.dirty_sizing = !0, this.update_text(), this.bounds), null != this.options.bounds_wrap && (this.bounds_wrap = this.options.bounds_wrap, this.dirty_align = !0, this.dirty_sizing = !0, this.update_text(), this.bounds_wrap), null == this.options.align && (this.options.align = 0), this.options.align, null == this.options.align_vertical && (this.options.align_vertical = 3), this.options.align_vertical, this.align = this.options.align, this.dirty_align = !0, this.update_text(), this.align, this.align_vertical = this.options.align_vertical, this.dirty_align = !0, this.update_text(), this.align_vertical, null != this.options.thickness && this.set_thickness(this.options.thickness), null != this.options.smoothness && this.set_smoothness(this.options.smoothness), null != this.options.outline && this.set_outline(this.options.outline), null != this.options.outline_color && this.set_outline_color(this.options.outline_color), null != this.options.glow_threshold && this.set_glow_threshold(this.options.glow_threshold), null != this.options.glow_amount && this.set_glow_amount(this.options.glow_amount), null != this.options.glow_color && this.set_glow_color(this.options.glow_color), this.sdf && null != this.get_shader() && this.sdf && (this.get_shader().set_float("smoothness", this.smoothness), this.get_shader().set_float("thickness", this.thickness), this.get_shader().set_float("outline", this.outline), this.get_shader().set_float("glow_threshold", this.glow_threshold), this.get_shader().set_float("glow_amount", this.glow_amount), this.get_shader().set_color("outline_color", this.outline_color), this.get_shader().set_color("glow_color", this.glow_color)), null != this.options.text && this.set_text(this.options.text)
        },
        set_text: function(t) {
            return null == t && (t = ""), this.text != t && (this.text = t, "" != this.text ? (this.dirty_align = !0, this.dirty_sizing = !0, this.update_text()) : this.vertices.splice(0, this.vertices.length)), this.text
        },
        update_sizes: function() {
            if (!this.dirty_sizing) return !1;
            var t = I.geometry.TextGeometry.tab_regex.replace(this.text, "    ");
            return this.bounds_wrap && null != this.bounds && (t = this.font.wrap_string_to_bounds(t, this.bounds, this.point_size, this.letter_spacing)), this.lines.splice(0, this.lines.length), this.lines = t.split("\n"), this.line_widths.splice(0, this.line_widths.length), this.text_width = this.font.width_of(t, this.point_size, this.letter_spacing, this.line_widths), this.text_height = this.font.height_of_lines(this.lines, this.point_size, this.line_spacing), this.text_h_w = this.text_width / 2, this.text_h_h = this.text_height / 2, this.point_ratio = this.point_size / this.font.info.point_size, this.dirty_align = !0, this.dirty_sizing = !1, !0
        },
        update_text: function() {
            var t = this,
                e = 0,
                s = 0,
                i = null != this.bounds;
            i && (this.transform.local.pos.set_x(e = this.bounds.x), this.transform.local.pos.set_y(s = this.bounds.y));
            for (var n = 0, r = 0, a = 0, l = 0, h = !0, c = (this.update_sizes(), 0), _ = this.lines; c < _.length;) {
                var m = _[c];
                ++c;
                var u = 0,
                    d = 0;
                if (this.dirty_align) {
                    if (i) {
                        var p = this.align;
                        switch (p) {
                            case 2:
                                u = -(this.line_widths[a] / 2) + this.bounds.w / 2;
                                break;
                            case 1:
                                u = -this.line_widths[a] + this.bounds.w;
                                break;
                            default:
                                u = 0
                        }
                        var y = this.align_vertical;
                        switch (y) {
                            case 2:
                                d = this.bounds.h / 2 - this.text_h_h;
                                break;
                            case 4:
                                d = this.bounds.h - this.text_height;
                                break;
                            default:
                                d = 0
                        }
                    } else {
                        var f = this.align;
                        switch (f) {
                            case 2:
                                u = -(this.line_widths[a] / 2);
                                break;
                            case 1:
                                u = -this.line_widths[a];
                                break;
                            default:
                                u = 0
                        }
                        var g = this.align_vertical;
                        switch (g) {
                            case 2:
                                d = -this.text_h_h;
                                break;
                            case 4:
                                d = -this.text_height;
                                break;
                            default:
                                d = 0
                        }
                    }
                    this.line_offsets[0][a] = u, this.line_offsets[1][a] = d
                } else u = this.line_offsets[0][a], d = this.line_offsets[1][a];
                0 != a && (r += (t.font.info.line_height + t.line_spacing) * t.point_ratio, n = 0);
                for (var v = 0, x = new o.utils.unifill.CodePointIter(m); x.hasNext();) {
                    var w = x.next(),
                        b = w,
                        B = this.font.info.chars.get(b);
                    if (h = null != B && b > 32, h || (B = this.font.space_char), h) {
                        var S = u + n + B.xoffset * this.point_ratio,
                            A = d + r + B.yoffset * this.point_ratio,
                            C = this.font.pages.get(B.page),
                            I = B.x / C.width_actual,
                            k = B.y / C.height_actual,
                            M = (B.x + B.width) / C.width_actual,
                            V = (B.y + B.height) / C.height_actual;
                        this.update_char(l, S, A, B.width * this.point_ratio, B.height * this.point_ratio, I, k, M, V, this.color), l++
                    }
                    var z = B.xadvance;
                    v < m.length - 1 && (z += this.font.kerning(b, o.utils.unifill.Unifill.uCharCodeAt(m, v + 1)), b >= 32 && (z += this.letter_spacing)), z *= this.point_ratio, n += z, v++
                }
                a++
            }
            var T = this.vertices.length / 6 | 0,
                P = T - l;
            P > 0 && this.vertices.splice(6 * l, 6 * P), this.dirty_align = !1, this.emitter.emit(1)
        },
        update_char: function(t, e, s, i, n, o, r, a, l, h) {
            var c, _, m, u, d, p, y = this.cache[t];
            null == y ? (c = new I.geometry.Vertex(new I.Vector(e, s), h), _ = new I.geometry.Vertex(new I.Vector(e + i, s), h), m = new I.geometry.Vertex(new I.Vector(e + i, s + n), h), u = new I.geometry.Vertex(new I.Vector(e, s + n), h), d = new I.geometry.Vertex(new I.Vector(e, s), h), p = new I.geometry.Vertex(new I.Vector(e + i, s + n), h), y = [c, _, m, u, d, p], this.cache[t] = y) : (c = y[0], _ = y[1], m = y[2], u = y[3], d = y[4], p = y[5], c.pos.set_xy(e, s), _.pos.set_xy(e + i, s), m.pos.set_xy(e + i, s + n), u.pos.set_xy(e, s + n), d.pos.set_xy(e, s), p.pos.set_xy(e + i, s + n)), c.uv.uv0.set_uv(o, r), _.uv.uv0.set_uv(a, r), m.uv.uv0.set_uv(a, l), u.uv.uv0.set_uv(o, l), d.uv.uv0.set_uv(o, r), p.uv.uv0.set_uv(a, l);
            var f = Math.floor(this.vertices.length / 6);
            t >= f && (this.add(c), this.add(_), this.add(m), this.add(u), this.add(d), this.add(p))
        },
        set_point_size: function(t) {
            return 0 > t && (t = 0), this.point_size = t, this.dirty_align = !0, this.dirty_sizing = !0, this.update_text(), this.point_size
        },
        set_smoothness: function(t) {
            return 0 > t && (t = 0), null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_float("smoothness", t), this.smoothness = t
        },
        set_thickness: function(t) {
            return 0 > t && (t = 0), null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_float("thickness", t), this.thickness = t
        },
        set_outline: function(t) {
            return t = 0 > t ? 0 : t > 1 ? 1 : t, null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_float("outline", t), this.outline = t
        },
        set_glow_threshold: function(t) {
            return 0 > t && (t = 0), null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_float("glow_threshold", t), this.glow_threshold = t
        },
        set_glow_amount: function(t) {
            return 0 > t && (t = 0), null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_float("glow_amount", t), this.glow_amount = t
        },
        set_outline_color: function(t) {
            return null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_color("outline_color", t), this.outline_color = t
        },
        set_glow_color: function(t) {
            return null != this.get_shader() && this.sdf && this.unique && this.get_shader().set_color("glow_color", t), this.glow_color = t
        },
        __class__: I.geometry.TextGeometry,
        __properties__: t(I.geometry.Geometry.prototype.__properties__, {
            set_glow_color: "set_glow_color",
            set_glow_amount: "set_glow_amount",
            set_glow_threshold: "set_glow_threshold",
            set_outline_color: "set_outline_color",
            set_outline: "set_outline",
            set_thickness: "set_thickness",
            set_smoothness: "set_smoothness",
            set_point_size: "set_point_size",
            set_text: "set_text"
        })
    }), I.geometry.TextureCoordSet = function() {
        this.uv0 = new I.geometry.TextureCoord, this.uv1 = new I.geometry.TextureCoord, this.uv2 = new I.geometry.TextureCoord, this.uv3 = new I.geometry.TextureCoord, this.uv4 = new I.geometry.TextureCoord, this.uv5 = new I.geometry.TextureCoord, this.uv6 = new I.geometry.TextureCoord, this.uv7 = new I.geometry.TextureCoord
    }, i["phoenix.geometry.TextureCoordSet"] = I.geometry.TextureCoordSet, I.geometry.TextureCoordSet.__name__ = !0, I.geometry.TextureCoordSet.prototype = {
        __class__: I.geometry.TextureCoordSet
    }, I.geometry.TextureCoord = function(t, e, s, i) {
        null == i && (i = 0), null == s && (s = 0), null == e && (e = 0), null == t && (t = 0), this.t = 0, this.w = 0, this.v = 0, this.u = 0, this.u = t, this.v = e, this.w = s, this.t = i
    }, i["phoenix.geometry.TextureCoord"] = I.geometry.TextureCoord, I.geometry.TextureCoord.__name__ = !0, I.geometry.TextureCoord.prototype = {
        set_uv: function(t, e) {
            return this.u = t, this.v = e, this
        },
        __class__: I.geometry.TextureCoord
    }, I.geometry.Vertex = function(t, e, s) {
        this.uv = new I.geometry.TextureCoordSet, this.pos = t, this.color = null == e ? new I.Color : e, this.normal = null == s ? new I.Vector : s
    }, i["phoenix.geometry.Vertex"] = I.geometry.Vertex, I.geometry.Vertex.__name__ = !0, I.geometry.Vertex.prototype = {
        __class__: I.geometry.Vertex
    }, I.utils = {}, I.utils.Rendering = function() {}, i["phoenix.utils.Rendering"] = I.utils.Rendering, I.utils.Rendering.__name__ = !0, I.utils.Rendering.get_elements_for_type = function(t, e) {
        switch (t) {
            case 0:
                return e / 4 | 0;
            case 1:
                return e / 4 | 0;
            case 3:
                return e / 4 | 0;
            case 2:
                return e / 4 | 0;
            case 5:
                return e / 4 | 0;
            case 6:
                return e / 4 | 0;
            default:
                return e / 4 | 0
        }
    }, C.Snow = function() {
        this.is_ready = !1, this.was_ready = !1, this.has_shutdown = !1, this.shutting_down = !1, this.os = "unknown", this.platform = "unknown", this.freeze = !1, this.platform = "web", C.Snow.core = new C.core.web.Core(this), C.Snow.next_queue = []
    }, i["snow.Snow"] = C.Snow, C.Snow.__name__ = !0, C.Snow.next = function(t) {
        null != t && C.Snow.next_queue.push(t)
    }, C.Snow.prototype = {
        shutdown: function() {
            this.shutting_down = !0, this.host.ondestroy(), this.io.module.destroy(), this.audio.destroy(), this.input.destroy(), this.windowing.destroy(), C.Snow.core.shutdown(), this.has_shutdown = !0
        },
        render: function() {
            this.windowing.update()
        },
        dispatch_system_event: function(t) {
            this.on_event(t)
        },
        init: function(t, e) {
            this.snow_config = t, null == this.snow_config.app_package && (this.snow_config.app_package = "org.snowkit.snowdefault"), this.config = this.default_config(), this.host = e, this.host.app = this, C.Snow.core.init(s(this, this.on_event))
        },
        on_snow_init: function() {
            this.host.on_internal_init()
        },
        on_snow_ready: function() {
            var t = this;
            if (this.was_ready) throw C.types.Error.error("firing ready event more than once is invalid usage");
            for (this.io = new C.system.io.IO(this), this.input = new C.system.input.Input(this), this.audio = new C.system.audio.Audio(this), this.assets = new C.system.assets.Assets(this), this.windowing = new C.system.window.Windowing(this), this.was_ready = !0, this.setup_app_path(), this.setup_default_assets().then(function() {
                    t.setup_configs().then(function() {
                        t.setup_default_window(), C.Snow.next(s(t, t.on_ready))
                    })
                }).error(function(t) {
                    throw C.types.Error.init("snow / cannot recover from error: " + t)
                }), C.api.Promises.step(); C.Snow.next_queue.length > 0;) this.cycle_next_queue()
        },
        do_internal_update: function(t) {
            this.io.module.update(), this.input.update(), this.audio.update(), this.host.update(t)
        },
        on_ready: function() {
            this.is_ready = !0, this.host.ready()
        },
        on_snow_update: function() {
            this.freeze || (C.api.Timer.update(), C.api.Promises.step(), this.cycle_next_queue(), this.is_ready && (this.host.on_internal_update(), this.host.on_internal_render()))
        },
        on_event: function(t) {
            3 != t.type && 0 != t.type && 5 != t.type && 6 != t.type, 3 != t.type, this.is_ready && (this.io.module.on_event(t), this.audio.on_event(t), this.windowing.on_event(t), this.input.on_event(t), this.host.onevent(t));
            var e = t.type;
            switch (e) {
                case 1:
                    this.on_snow_init();
                    break;
                case 2:
                    this.on_snow_ready();
                    break;
                case 3:
                    this.on_snow_update();
                    break;
                case 7:
                case 8:
                    this.shutdown();
                    break;
                case 4:
            }
        },
        cycle_next_queue: function() {
            var t = C.Snow.next_queue.length;
            if (t > 0)
                for (var e = 0; t > e;) {
                    {
                        e++
                    }
                    C.Snow.next_queue.shift()()
                }
        },
        setup_app_path: function() {},
        setup_default_assets: function() {
            var t = this;
            return this.snow_config.config_custom_assets ? C.api.Promise.resolve() : new C.api.Promise(function(e) {
                t.assets.manifest_path = t.snow_config.config_assets_path, t.default_asset_list().then(function(e) {
                    t.assets.list = e
                }).error(function() {}).then(e)
            })
        },
        setup_configs: function() {
            var t = this;
            return this.snow_config.config_custom_runtime ? (this.setup_host_config(), C.api.Promise.resolve()) : new C.api.Promise(function(e) {
                t.default_runtime_config().then(function(e) {
                    t.config.runtime = e
                }).error(function(t) {
                    throw C.types.Error.init("config / failed / default runtime config failed to parse as JSON. cannot recover. " + t)
                }).then(function() {
                    t.setup_host_config(), e()
                })
            })
        },
        setup_host_config: function() {
            this.config = this.host.config(this.config)
        },
        setup_default_window: function() {
            if (1 == this.config.has_window && (this.window = this.windowing.create(this.config.window), null == this.window.handle)) throw C.types.Error.windowing("requested default window cannot be created. cannot continue")
        },
        default_config: function() {
            return {
                has_window: !0,
                runtime: {},
                window: this.default_window_config(),
                render: this.default_render_config(),
                web: {
                    no_context_menu: !0,
                    prevent_default_keys: [C.system.input.Keycodes.left, C.system.input.Keycodes.right, C.system.input.Keycodes.up, C.system.input.Keycodes.down, C.system.input.Keycodes.backspace, C.system.input.Keycodes.tab, C.system.input.Keycodes["delete"]],
                    prevent_default_mouse_wheel: !0,
                    true_fullscreen: !1
                },
                "native": {
                    audio_buffer_length: 176400,
                    audio_buffer_count: 4
                }
            }
        },
        default_runtime_config: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                var i = t.io.data_flow(t.snow_config.config_runtime_path, C.system.assets.AssetJSON.processor);
                i.then(e).error(function(t) {
                    switch (t[1]) {
                        case 3:
                            {
                                t[2]
                            }
                            s(t);
                            break;
                        default:
                            e()
                    }
                })
            })
        },
        default_asset_list: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                var i = t.assets.root + t.assets.manifest_path,
                    n = t.io.data_flow(i, C.system.assets.AssetJSON.processor);
                n.then(function(t) {
                    var s = t;
                    e(s)
                }).error(s)
            })
        },
        default_render_config: function() {
            return {
                depth: !1,
                stencil: !1,
                antialiasing: 0,
                red_bits: 8,
                green_bits: 8,
                blue_bits: 8,
                alpha_bits: 8,
                depth_bits: 0,
                stencil_bits: 0,
                opengl: {
                    minor: 0,
                    major: 0,
                    profile: 0
                }
            }
        },
        default_window_config: function() {
            var t = {
                fullscreen_desktop: !0,
                fullscreen: !1,
                borderless: !1,
                resizable: !0,
                x: 536805376,
                y: 536805376,
                width: 960,
                height: 640,
                title: "snow app"
            };
            return t
        },
        make_uniqueid: function(t) {
            null == t && (t = w.random(2147483647));
            var e = t % 62 | 0,
                s = t / 62 | 0;
            return s > 0 ? this.make_uniqueid(s) + (e > 9 ? function() {
                var t, s = 65 + (e - 10);
                return s > 90 && (s += 6), t = String.fromCharCode(s)
            }(this) : (null == e ? "null" : "" + e).charAt(0)) : w.string(e > 9 ? function() {
                var t, s = 65 + (e - 10);
                return s > 90 && (s += 6), t = String.fromCharCode(s)
            }(this) : (null == e ? "null" : "" + e).charAt(0))
        },
        __class__: C.Snow
    }, C.api = {}, C.api.DebugError = i["snow.api.DebugError"] = {
        __ename__: !0,
        __constructs__: ["assertion", "null_assertion"]
    }, C.api.DebugError.assertion = function(t) {
        var e = ["assertion", 0, t];
        return e.__enum__ = C.api.DebugError, e.toString = n, e
    }, C.api.DebugError.null_assertion = function(t) {
        var e = ["null_assertion", 1, t];
        return e.__enum__ = C.api.DebugError, e.toString = n, e
    }, C.api.Promise = function(t) {
        this.was_caught = !1;
        var e = this;
        this.state = 0, this.reject_reactions = [], this.fulfill_reactions = [], this.settle_reactions = [], C.api.Promises.queue(function() {
            t(s(e, e.onfulfill), s(e, e.onreject)), C.api.Promises.defer(C.api.Promises.next)
        })
    }, i["snow.api.Promise"] = C.api.Promise, C.api.Promise.__name__ = !0, C.api.Promise.all = function(t) {
        return new C.api.Promise(function(e, s) {
            for (var i = 0, n = t.length, o = [], r = null, a = 0, l = function(t, s) {
                    0 == a && (i++, o[t] = s, n == i && (a = 1, e(o)))
                }, h = function(t) {
                    0 == a && (a = 2, r = t, s(r))
                }, c = 0, _ = 0; _ < t.length;) {
                var m = t[_];
                ++_, m.then(function(t, e) {
                    return function(s) {
                        return t(e, s)
                    }
                }(l, c)).error(h), c++
            }
        })
    }, C.api.Promise.reject = function(t) {
        return new C.api.Promise(function(e, s) {
            s(t)
        })
    }, C.api.Promise.resolve = function(t) {
        return new C.api.Promise(function(e) {
            e(t)
        })
    }, C.api.Promise.prototype = {
        then: function(t, e) {
            var s = this.state;
            switch (s) {
                case 0:
                    return this.add_fulfill(t), this.add_reject(e), this.new_linked_promise();
                case 1:
                    return C.api.Promises.defer(t, this.result), C.api.Promise.resolve(this.result);
                case 2:
                    return C.api.Promises.defer(e, this.result), C.api.Promise.reject(this.result)
            }
        },
        error: function(t) {
            var e = this.state;
            switch (e) {
                case 0:
                    return this.add_reject(t), this.new_linked_resolve_empty();
                case 1:
                    return C.api.Promise.resolve(this.result);
                case 2:
                    return C.api.Promises.defer(t, this.result), C.api.Promise.reject(this.result)
            }
        },
        add_settle: function(t) {
            0 == this.state ? this.settle_reactions.push(t) : C.api.Promises.defer(t, this.result)
        },
        new_linked_promise: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                t.add_settle(function() {
                    1 == t.state ? e(t.result) : s(t.result)
                })
            })
        },
        new_linked_resolve_empty: function() {
            var t = this;
            return new C.api.Promise(function(e) {
                t.add_settle(function() {
                    e()
                })
            })
        },
        add_fulfill: function(t) {
            null != t && this.fulfill_reactions.push(t)
        },
        add_reject: function(t) {
            null != t && (this.was_caught = !0, this.reject_reactions.push(t))
        },
        onfulfill: function(t) {
            for (this.state = 1, this.result = t; this.fulfill_reactions.length > 0;) {
                var e = this.fulfill_reactions.shift();
                e(this.result)
            }
            this.onsettle()
        },
        onreject: function(t) {
            for (this.state = 2, this.result = t; this.reject_reactions.length > 0;) {
                var e = this.reject_reactions.shift();
                e(this.result)
            }
            this.onsettle()
        },
        onsettle: function() {
            for (; this.settle_reactions.length > 0;) {
                var t = this.settle_reactions.shift();
                t(this.result)
            }
        },
        __class__: C.api.Promise
    }, C.api.Promises = function() {}, i["snow.api.Promises"] = C.api.Promises, C.api.Promises.__name__ = !0, C.api.Promises.step = function() {
        for (C.api.Promises.next(); C.api.Promises.defers.length > 0;) {
            var t = C.api.Promises.defers.shift();
            t.f(t.a)
        }
    }, C.api.Promises.next = function() {
        C.api.Promises.calls.length > 0 && C.api.Promises.calls.shift()()
    }, C.api.Promises.defer = function(t, e) {
        null != t && C.api.Promises.defers.push({
            f: t,
            a: e
        })
    }, C.api.Promises.queue = function(t) {
        null != t && C.api.Promises.calls.push(t)
    }, C.api.Timer = function(t) {
        this.time = t, C.api.Timer.running_timers.push(this), this.fire_at = C.Snow.core.timestamp() + this.time, this.running = !0
    }, i["snow.api.Timer"] = C.api.Timer, C.api.Timer.__name__ = !0, C.api.Timer.update = function() {
        for (var t = C.Snow.core.timestamp(), e = 0, s = C.api.Timer.running_timers; e < s.length;) {
            var i = s[e];
            ++e, i.running && i.fire_at < t && (i.fire_at += i.time, i.run())
        }
    }, C.api.Timer.prototype = {
        run: function() {},
        stop: function() {
            this.running && (this.running = !1, h.remove(C.api.Timer.running_timers, this))
        },
        __class__: C.api.Timer
    }, C.api.buffers = {}, C.api.buffers._Uint8Array = {}, C.api.buffers._Uint8Array.Uint8Array_Impl_ = function() {}, i["snow.api.buffers._Uint8Array.Uint8Array_Impl_"] = C.api.buffers._Uint8Array.Uint8Array_Impl_, C.api.buffers._Uint8Array.Uint8Array_Impl_.__name__ = !0, C.api.buffers._Uint8Array.Uint8Array_Impl_.fromBytes = function(t, e, s) {
        return null == e ? new Uint8Array(t.b) : null == s ? new Uint8Array(t.b, e) : new Uint8Array(t.b, e, s)
    }, C.api.buffers._Uint8Array.Uint8Array_Impl_.toBytes = function(t) {
        return new S.io.Bytes(t.byteLength, new Uint8Array(t.buffer))
    }, C.core = {}, C.core.web = {}, C.core.web.Core = function(t) {
        this._time_now = 0, this._lf_timestamp = .016, this.start_timestamp = 0, this.app = t, this.start_timestamp = this.timestamp(), this.guess_os()
    }, i["snow.core.web.Core"] = C.core.web.Core, C.core.web.Core.__name__ = !0, C.core.web.Core.prototype = {
        init: function() {
            this.app.on_event({
                type: 1
            }), this.app.on_event({
                type: 2
            }), this.app.snow_config.has_loop && this.request_update()

            // CHANGE: setup the time control API.
            window.qwopControl.timestamp = 0;
            window.qwopControl.step = () => {
                if (window.qwopControl.isDone) {
                    return true;
                }
                window.qwopControl.timestamp += TIMESTEP_DURATION;
                if (window.qwopControl.wantsUpdate) {
                    window.qwopControl.wantsUpdate = false;
                    this.snow_core_loop(TIMESTEP_DURATION * 1e3);
                }
                var kneeY = Math.max(window.qwopControl.leftKneeY, window.qwopControl.rightKneeY);
                if (kneeY < KNEE_THRESHOLD) {
                    window.qwopControl.totalBonus += window.qwopControl.standingBonus;
                }
                return window.qwopControl.isDone;
            };
        },
        shutdown: function() {},
        timestamp: function() {
            // CHANGE: use a synthetic timestamp.
            return window.qwopControl.timestamp;
        },
        request_update: function() {
            // CHANGE: use a synthetic frame poll.
            window.qwopControl.wantsUpdate = true;
        },
        snow_core_loop: function(t) {
            return null == t && (t = .016), this.update(), this.app.on_event({
                type: 3
            }), this.request_update(), !0
        },
        update: function() {},
        guess_os: function() {
            var t = window.navigator.appVersion,
                e = window.navigator.userAgent;
            (function() {
                var e, s = new a("mac", "gi");
                return e = s.match(t)
            })(this) && (this.app.os = "mac"),
            function() {
                var e, s = new a("win", "gi");
                return e = s.match(t)
            }(this) && (this.app.os = "windows"),
            function() {
                var e, s = new a("x11", "gi");
                return e = s.match(t)
            }(this) && (this.app.os = "linux"),
            function() {
                var e, s = new a("linux", "gi");
                return e = s.match(t)
            }(this) && (this.app.os = "linux"),
            function() {
                var e, s = new a("android", "gi");
                return e = s.match(t)
            }(this) && (this.app.os = "android"),
            function() {
                var t, s = new a("ipad", "gi");
                return t = s.match(e)
            }(this) && (this.app.os = "ios"),
            function() {
                var t, s = new a("iphone", "gi");
                return t = s.match(e)
            }(this) && (this.app.os = "ios"),
            function() {
                var t, s = new a("ipod", "gi");
                return t = s.match(e)
            }(this) && (this.app.os = "ios")
        },
        __class__: C.core.web.Core
    }, C.modules = {}, C.modules.interfaces = {}, C.modules.interfaces.Assets = function() {}, i["snow.modules.interfaces.Assets"] = C.modules.interfaces.Assets, C.modules.interfaces.Assets.__name__ = !0, C.core.web.assets = {}, C.core.web.assets.Assets = function(t) {
        this.system = t
    }, i["snow.core.web.assets.Assets"] = C.core.web.assets.Assets, C.core.web.assets.Assets.__name__ = !0, C.core.web.assets.Assets.__interfaces__ = [C.modules.interfaces.Assets], C.core.web.assets.Assets.prototype = {
        image_load_info: function(t, e) {
            return null == e && (e = 4), this.system.app.io.data_flow(t, C.system.assets.AssetImage.processor)
        },
        image_info_from_element: function(t, e) {
            var s = this.nearest_power_of_two(e.width),
                i = this.nearest_power_of_two(e.height),
                n = this.POT_bytes_from_element(e.width, e.height, s, i, e),
                o = {
                    id: t,
                    bpp: 4,
                    width: e.width,
                    height: e.height,
                    width_actual: s,
                    height_actual: i,
                    bpp_source: 4,
                    pixels: n
                };
            return n = null, o
        },
        image_info_from_bytes: function(t, e, s) {
            null == s && (s = 4);
            var i = this;
            if (null == t) throw C.api.DebugError.null_assertion("_id was null");
            if (null == e) throw C.api.DebugError.null_assertion("_bytes was null");
            if (0 == e.length) throw C.api.DebugError.assertion("_bytes.length != 0");
            var n = S.io.Path.extension(t);
            return new C.api.Promise(function(s, o) {
                for (var r = "", a = 0, l = e.length; l > a;) r += String.fromCharCode(function() {
                    var t, s, i = a++;
                    return s = e[i], t = 255 & s
                }(this));
                var h = window.btoa(r),
                    c = "data:image/" + n + ";base64," + h,
                    _ = new Image;
                _.onload = function() {
                    var e = i.image_info_from_element(t, _);
                    s(e)
                }, _.onerror = function(t) {
                    o(C.types.Error.error("failed to load image from bytes, on error: " + t))
                }, _.src = c
            })
        },
        POT_bytes_from_element: function(t, e, s, i, n) {
            var o, r = window.document;
            o = r.createElement("canvas"), o.width = s, o.height = i;
            var a = o.getContext("2d");
            a.clearRect(0, 0, o.width, o.height), a.drawImage(n, 0, 0, t, e);
            var l = null;
            try {
                l = a.getImageData(0, 0, o.width, o.height)
            } catch (h) {
                var c = "- textures served from file:/// throw security errors\n";
                throw c += "- textures served over http:// work for cross origin byte requests", h
            }
            o = null, a = null;
            var _, m = l.data;
            return _ = null != m ? new Uint8Array(m) : null
        },
        nearest_power_of_two: function(t) {
            return C.core.web.assets.Assets.POT ? (t--, t |= t >> 1, t |= t >> 2, t |= t >> 4, t |= t >> 8, t |= t >> 16, t++, t) : t
        },
        __class__: C.core.web.assets.Assets
    }, C.core.web.input = {}, C.core.web.input.DOMKeys = function() {}, i["snow.core.web.input.DOMKeys"] = C.core.web.input.DOMKeys, C.core.web.input.DOMKeys.__name__ = !0, C.core.web.input.DOMKeys.dom_key_to_keycode = function(t) {
        switch (t) {
            case 16:
                return C.system.input.Keycodes.lshift;
            case 17:
                return C.system.input.Keycodes.lctrl;
            case 18:
                return C.system.input.Keycodes.lalt;
            case 20:
                return C.system.input.Keycodes.capslock;
            case 33:
                return C.system.input.Keycodes.pageup;
            case 34:
                return C.system.input.Keycodes.pagedown;
            case 35:
                return C.system.input.Keycodes.end;
            case 36:
                return C.system.input.Keycodes.home;
            case 37:
                return C.system.input.Keycodes.left;
            case 38:
                return C.system.input.Keycodes.up;
            case 39:
                return C.system.input.Keycodes.right;
            case 40:
                return C.system.input.Keycodes.down;
            case 44:
                return C.system.input.Keycodes.printscreen;
            case 45:
                return C.system.input.Keycodes.insert;
            case 46:
                return C.system.input.Keycodes["delete"];
            case 91:
                return C.system.input.Keycodes.lmeta;
            case 93:
                return C.system.input.Keycodes.rmeta;
            case 224:
                return C.system.input.Keycodes.lmeta;
            case 96:
                return C.system.input.Keycodes.kp_0;
            case 97:
                return C.system.input.Keycodes.kp_1;
            case 98:
                return C.system.input.Keycodes.kp_2;
            case 99:
                return C.system.input.Keycodes.kp_3;
            case 100:
                return C.system.input.Keycodes.kp_4;
            case 101:
                return C.system.input.Keycodes.kp_5;
            case 102:
                return C.system.input.Keycodes.kp_6;
            case 103:
                return C.system.input.Keycodes.kp_7;
            case 104:
                return C.system.input.Keycodes.kp_8;
            case 105:
                return C.system.input.Keycodes.kp_9;
            case 106:
                return C.system.input.Keycodes.kp_multiply;
            case 107:
                return C.system.input.Keycodes.kp_plus;
            case 109:
                return C.system.input.Keycodes.kp_minus;
            case 110:
                return C.system.input.Keycodes.kp_decimal;
            case 111:
                return C.system.input.Keycodes.kp_divide;
            case 144:
                return C.system.input.Keycodes.numlockclear;
            case 112:
                return C.system.input.Keycodes.f1;
            case 113:
                return C.system.input.Keycodes.f2;
            case 114:
                return C.system.input.Keycodes.f3;
            case 115:
                return C.system.input.Keycodes.f4;
            case 116:
                return C.system.input.Keycodes.f5;
            case 117:
                return C.system.input.Keycodes.f6;
            case 118:
                return C.system.input.Keycodes.f7;
            case 119:
                return C.system.input.Keycodes.f8;
            case 120:
                return C.system.input.Keycodes.f9;
            case 121:
                return C.system.input.Keycodes.f10;
            case 122:
                return C.system.input.Keycodes.f11;
            case 123:
                return C.system.input.Keycodes.f12;
            case 124:
                return C.system.input.Keycodes.f13;
            case 125:
                return C.system.input.Keycodes.f14;
            case 126:
                return C.system.input.Keycodes.f15;
            case 127:
                return C.system.input.Keycodes.f16;
            case 128:
                return C.system.input.Keycodes.f17;
            case 129:
                return C.system.input.Keycodes.f18;
            case 130:
                return C.system.input.Keycodes.f19;
            case 131:
                return C.system.input.Keycodes.f20;
            case 132:
                return C.system.input.Keycodes.f21;
            case 133:
                return C.system.input.Keycodes.f22;
            case 134:
                return C.system.input.Keycodes.f23;
            case 135:
                return C.system.input.Keycodes.f24;
            case 160:
                return C.system.input.Keycodes.caret;
            case 161:
                return C.system.input.Keycodes.exclaim;
            case 162:
                return C.system.input.Keycodes.quotedbl;
            case 163:
                return C.system.input.Keycodes.hash;
            case 164:
                return C.system.input.Keycodes.dollar;
            case 165:
                return C.system.input.Keycodes.percent;
            case 166:
                return C.system.input.Keycodes.ampersand;
            case 167:
                return C.system.input.Keycodes.underscore;
            case 168:
                return C.system.input.Keycodes.leftparen;
            case 169:
                return C.system.input.Keycodes.rightparen;
            case 170:
                return C.system.input.Keycodes.asterisk;
            case 171:
                return C.system.input.Keycodes.plus;
            case 172:
                return C.system.input.Keycodes.backslash;
            case 173:
                return C.system.input.Keycodes.minus;
            case 174:
                return C.system.input.Keycodes.leftbracket;
            case 175:
                return C.system.input.Keycodes.rightbracket;
            case 176:
                return C.system.input.Keycodes.backquote;
            case 181:
                return C.system.input.Keycodes.audiomute;
            case 182:
                return C.system.input.Keycodes.volumedown;
            case 183:
                return C.system.input.Keycodes.volumeup;
            case 188:
                return C.system.input.Keycodes.comma;
            case 190:
                return C.system.input.Keycodes.period;
            case 191:
                return C.system.input.Keycodes.slash;
            case 192:
                return C.system.input.Keycodes.backquote;
            case 219:
                return C.system.input.Keycodes.leftbracket;
            case 221:
                return C.system.input.Keycodes.rightbracket;
            case 220:
                return C.system.input.Keycodes.backslash;
            case 222:
                return C.system.input.Keycodes.quote
        }
        return t
    }, C.modules.interfaces.Input = function() {}, i["snow.modules.interfaces.Input"] = C.modules.interfaces.Input, C.modules.interfaces.Input.__name__ = !0, C.system = {}, C.system.input = {}, C.system.input.Scancodes = function() {}, i["snow.system.input.Scancodes"] = C.system.input.Scancodes, C.system.input.Scancodes.__name__ = !0, C.system.input.Keycodes = function() {}, i["snow.system.input.Keycodes"] = C.system.input.Keycodes, C.system.input.Keycodes.__name__ = !0, C.system.input.Keycodes.from_scan = function(t) {
        return t | C.system.input.Scancodes.MASK
    }, C.system.input.Keycodes.to_scan = function(t) {
        if (0 != (t & C.system.input.Scancodes.MASK)) return t & ~C.system.input.Scancodes.MASK;
        switch (t) {
            case C.system.input.Keycodes.enter:
                return C.system.input.Scancodes.enter;
            case C.system.input.Keycodes.escape:
                return C.system.input.Scancodes.escape;
            case C.system.input.Keycodes.backspace:
                return C.system.input.Scancodes.backspace;
            case C.system.input.Keycodes.tab:
                return C.system.input.Scancodes.tab;
            case C.system.input.Keycodes.space:
                return C.system.input.Scancodes.space;
            case C.system.input.Keycodes.slash:
                return C.system.input.Scancodes.slash;
            case C.system.input.Keycodes.key_0:
                return C.system.input.Scancodes.key_0;
            case C.system.input.Keycodes.key_1:
                return C.system.input.Scancodes.key_1;
            case C.system.input.Keycodes.key_2:
                return C.system.input.Scancodes.key_2;
            case C.system.input.Keycodes.key_3:
                return C.system.input.Scancodes.key_3;
            case C.system.input.Keycodes.key_4:
                return C.system.input.Scancodes.key_4;
            case C.system.input.Keycodes.key_5:
                return C.system.input.Scancodes.key_5;
            case C.system.input.Keycodes.key_6:
                return C.system.input.Scancodes.key_6;
            case C.system.input.Keycodes.key_7:
                return C.system.input.Scancodes.key_7;
            case C.system.input.Keycodes.key_8:
                return C.system.input.Scancodes.key_8;
            case C.system.input.Keycodes.key_9:
                return C.system.input.Scancodes.key_9;
            case C.system.input.Keycodes.semicolon:
                return C.system.input.Scancodes.semicolon;
            case C.system.input.Keycodes.equals:
                return C.system.input.Scancodes.equals;
            case C.system.input.Keycodes.leftbracket:
                return C.system.input.Scancodes.leftbracket;
            case C.system.input.Keycodes.backslash:
                return C.system.input.Scancodes.backslash;
            case C.system.input.Keycodes.rightbracket:
                return C.system.input.Scancodes.rightbracket;
            case C.system.input.Keycodes.backquote:
                return C.system.input.Scancodes.grave;
            case C.system.input.Keycodes.key_a:
                return C.system.input.Scancodes.key_a;
            case C.system.input.Keycodes.key_b:
                return C.system.input.Scancodes.key_b;
            case C.system.input.Keycodes.key_c:
                return C.system.input.Scancodes.key_c;
            case C.system.input.Keycodes.key_d:
                return C.system.input.Scancodes.key_d;
            case C.system.input.Keycodes.key_e:
                return C.system.input.Scancodes.key_e;
            case C.system.input.Keycodes.key_f:
                return C.system.input.Scancodes.key_f;
            case C.system.input.Keycodes.key_g:
                return C.system.input.Scancodes.key_g;
            case C.system.input.Keycodes.key_h:
                return C.system.input.Scancodes.key_h;
            case C.system.input.Keycodes.key_i:
                return C.system.input.Scancodes.key_i;
            case C.system.input.Keycodes.key_j:
                return C.system.input.Scancodes.key_j;
            case C.system.input.Keycodes.key_k:
                return C.system.input.Scancodes.key_k;
            case C.system.input.Keycodes.key_l:
                return C.system.input.Scancodes.key_l;
            case C.system.input.Keycodes.key_m:
                return C.system.input.Scancodes.key_m;
            case C.system.input.Keycodes.key_n:
                return C.system.input.Scancodes.key_n;
            case C.system.input.Keycodes.key_o:
                return C.system.input.Scancodes.key_o;
            case C.system.input.Keycodes.key_p:
                return C.system.input.Scancodes.key_p;
            case C.system.input.Keycodes.key_q:
                return C.system.input.Scancodes.key_q;
            case C.system.input.Keycodes.key_r:
                return C.system.input.Scancodes.key_r;
            case C.system.input.Keycodes.key_s:
                return C.system.input.Scancodes.key_s;
            case C.system.input.Keycodes.key_t:
                return C.system.input.Scancodes.key_t;
            case C.system.input.Keycodes.key_u:
                return C.system.input.Scancodes.key_u;
            case C.system.input.Keycodes.key_v:
                return C.system.input.Scancodes.key_v;
            case C.system.input.Keycodes.key_w:
                return C.system.input.Scancodes.key_w;
            case C.system.input.Keycodes.key_x:
                return C.system.input.Scancodes.key_x;
            case C.system.input.Keycodes.key_y:
                return C.system.input.Scancodes.key_y;
            case C.system.input.Keycodes.key_z:
                return C.system.input.Scancodes.key_z
        }
        return C.system.input.Scancodes.unknown
    }, C.core.web.input.Input = function(t) {
        this.gamepads_supported = !1, this.system = t
    }, i["snow.core.web.input.Input"] = C.core.web.input.Input, C.core.web.input.Input.__name__ = !0, C.core.web.input.Input.__interfaces__ = [C.modules.interfaces.Input], C.core.web.input.Input.prototype = {
        init: function() {
            window.document.addEventListener("keypress", s(this, this.on_keypress)), window.document.addEventListener("keydown", s(this, this.on_keydown)), window.document.addEventListener("keyup", s(this, this.on_keyup)), this.active_gamepads = new S.ds.IntMap, this.gamepads_supported = null != this.get_gamepad_list(), window.DeviceOrientationEvent && (window.addEventListener("deviceorientation", s(this, this.on_orientation)), window.addEventListener("devicemotion", s(this, this.on_motion)))
        },
        update: function() {
            this.gamepads_supported && this.poll_gamepads()
        },
        destroy: function() {},
        listen: function(t) {
            t.handle.addEventListener("contextmenu", s(this, this.on_contextmenu)), t.handle.addEventListener("mousedown", s(this, this.on_mousedown)), t.handle.addEventListener("mouseup", s(this, this.on_mouseup)), t.handle.addEventListener("mousemove", s(this, this.on_mousemove)), t.handle.addEventListener("mousewheel", s(this, this.on_mousewheel)), t.handle.addEventListener("wheel", s(this, this.on_mousewheel)), t.handle.addEventListener("touchstart", s(this, this.on_touchdown)), t.handle.addEventListener("touchend", s(this, this.on_touchup)), t.handle.addEventListener("touchmove", s(this, this.on_touchmove))
        },
        on_event: function() {},
        on_orientation: function(t) {
            this.system.app.dispatch_system_event({
                type: 6,
                input: {
                    type: 4,
                    timestamp: C.Snow.core.timestamp(),
                    event: {
                        type: "orientation",
                        alpha: t.alpha,
                        beta: t.beta,
                        gamma: t.gamma
                    }
                }
            })
        },
        on_motion: function(t) {
            this.system.app.dispatch_system_event({
                type: 6,
                input: {
                    type: 4,
                    timestamp: C.Snow.core.timestamp(),
                    event: {
                        type: "motion",
                        acceleration: t.acceleration,
                        accelerationIncludingGravity: t.accelerationIncludingGravity,
                        rotationRate: t.rotationRate
                    }
                }
            })
        },
        poll_gamepads: function() {
            if (this.gamepads_supported) {
                var t = this.get_gamepad_list();
                if (null != t)
                    for (var e = 0, s = t.length; s > e;) {
                        var i = e++;
                        if (null != t[i]) this.handle_gamepad(t[i]);
                        else {
                            var n = this.active_gamepads.get(i);
                            null != n && this.system.dispatch_gamepad_device_event(n.index, 2, C.Snow.core.timestamp()), this.active_gamepads.remove(i)
                        }
                    }
            }
        },
        handle_gamepad: function(t) {
            if (null != t)
                if (function(e) {
                        var s, i = t.index;
                        return s = e.active_gamepads.exists(i)
                    }(this)) {
                    var e, s = t.index;
                    e = this.active_gamepads.get(s), e.id != t.id && (e.id = t.id);
                    for (var i = [], n = [], o = e.axes, r = e.buttons, a = t.axes, l = t.buttons, h = 0, c = 0; c < a.length;) {
                        var _ = a[c];
                        ++c, _ != o[h] && (i.push(h), e.axes[h] = _), h++
                    }
                    for (var m = 0, u = 0; u < l.length;) {
                        var d = l[u];
                        ++u, d.value != r[m].value && (n.push(m), e.buttons[m].pressed = d.pressed, e.buttons[m].value = d.value), m++
                    }
                    for (var p = 0; p < i.length;) {
                        var y = i[p];
                        ++p, this.system.dispatch_gamepad_axis_event(e.index, y, a[y], e.timestamp)
                    }
                    for (var f = 0; f < n.length;) {
                        var g = n[f];
                        ++f, 1 == l[g].pressed ? this.system.dispatch_gamepad_button_down_event(e.index, g, l[g].value, e.timestamp) : this.system.dispatch_gamepad_button_up_event(e.index, g, l[g].value, e.timestamp)
                    }
                } else {
                    for (var v = {
                            id: t.id,
                            index: t.index,
                            axes: [],
                            buttons: [],
                            timestamp: C.Snow.core.timestamp()
                        }, x = t.axes, w = 0; w < x.length;) {
                        var b = x[w];
                        ++w, v.axes.push(b)
                    }
                    for (var B = t.buttons, S = 0; S < B.length;) {
                        {
                            B[S]
                        }++S, v.buttons.push({
                            pressed: !1,
                            value: 0
                        })
                    }
                    this.active_gamepads.set(v.index, v), this.system.dispatch_gamepad_device_event(v.index, 1, v.timestamp)
                }
        },
        fail_gamepads: function() {
            this.gamepads_supported = !1
        },
        get_gamepad_list: function() {
            return null != (k = window.navigator, s(k, k.getGamepads)) ? window.navigator.getGamepads() : null != window.navigator.webkitGetGamepads ? window.navigator.webkitGetGamepads() : (this.fail_gamepads(), null)
        },
        on_mousedown: function(t) {
            var e = this.system.app.windowing.window_from_handle(t.target);
            this.system.dispatch_mouse_down_event(t.pageX - window.pageXOffset - e.x, t.pageY - window.pageYOffset - e.y, t.button + 1, t.timeStamp, e.id)
        },
        on_mouseup: function(t) {
            var e = this.system.app.windowing.window_from_handle(t.target);
            this.system.dispatch_mouse_up_event(t.pageX - window.pageXOffset - e.x, t.pageY - window.pageYOffset - e.y, t.button + 1, t.timeStamp, e.id)
        },
        on_mousemove: function(t) {
            var e = this.system.app.windowing.window_from_handle(t.target),
                s = t.movementX,
                i = t.movementY;
            null != t.webkitMovementX ? (s = t.webkitMovementX, i = t.webkitMovementY) : null != t.mozMovementX && (s = t.mozMovementX, i = t.mozMovementY), this.system.dispatch_mouse_move_event(t.pageX - window.pageXOffset - e.x, t.pageY - window.pageYOffset - e.y, s, i, t.timeStamp, e.id)
        },
        on_mousewheel: function(t) {
            this.system.app.config.web.prevent_default_mouse_wheel && t.preventDefault();
            var e = this.system.app.windowing.window_from_handle(t.target),
                s = 0,
                i = 0;
            null != t.deltaY ? i = t.deltaY : null != t.wheelDeltaY && (i = -t.wheelDeltaY / 3 | 0), null != t.deltaX ? s = t.deltaX : null != t.wheelDeltaX && (s = -t.wheelDeltaX / 3 | 0), this.system.dispatch_mouse_wheel_event(Math.round(s / 16), Math.round(i / 16), t.timeStamp, e.id)
        },
        on_contextmenu: function(t) {
            this.system.app.config.web.no_context_menu && t.preventDefault()
        },
        on_keypress: function(t) {
            if (0 != t.which && -1 == h.indexOf(C.core.web.input.Input._keypress_blacklist, t.keyCode, 0)) {
                var e = String.fromCharCode(t.charCode);
                this.system.dispatch_text_event(e, 0, e.length, 2, t.timeStamp, 1)
            }
        },
        on_keydown: function(t) {
            var e = this.convert_keycode(t.keyCode),
                s = C.system.input.Keycodes.to_scan(e),
                i = this.mod_state_from_event(t); - 1 != h.indexOf(this.system.app.config.web.prevent_default_keys, e, 0) && t.preventDefault(), this.system.dispatch_key_down_event(e, s, t.repeat, i, t.timeStamp, 1)
        },
        on_keyup: function(t) {
            var e = this.convert_keycode(t.keyCode),
                s = C.system.input.Keycodes.to_scan(e),
                i = this.mod_state_from_event(t); - 1 != h.indexOf(this.system.app.config.web.prevent_default_keys, e, 0) && t.preventDefault(), this.system.dispatch_key_up_event(e, s, t.repeat, i, t.timeStamp, 1)
        },
        mod_state_from_event: function(t) {
            var e = !(t.altKey || t.ctrlKey || t.metaKey || t.shiftKey);
            return {
                none: e,
                lshift: t.shiftKey,
                rshift: t.shiftKey,
                lctrl: t.ctrlKey,
                rctrl: t.ctrlKey,
                lalt: t.altKey,
                ralt: t.altKey,
                lmeta: t.metaKey,
                rmeta: t.metaKey,
                num: !1,
                caps: !1,
                mode: !1,
                ctrl: t.ctrlKey,
                shift: t.shiftKey,
                alt: t.altKey,
                meta: t.metaKey
            }
        },
        convert_keycode: function(t) {
            return t >= 65 && 90 >= t ? t + 32 : C.core.web.input.DOMKeys.dom_key_to_keycode(t)
        },
        on_touchdown: function(t) {
            for (var e = this.system.app.windowing.window_from_handle(t.target), s = 0, i = t.changedTouches; s < i.length;) {
                var n = i[s];
                ++s;
                var o = n.pageX - window.pageXOffset - e.x,
                    r = n.pageY - window.pageYOffset - e.y;
                o /= e.width, r /= e.height, this.system.dispatch_touch_down_event(o, r, n.identifier, C.Snow.core.timestamp())
            }
        },
        on_touchup: function(t) {
            for (var e = this.system.app.windowing.window_from_handle(t.target), s = 0, i = t.changedTouches; s < i.length;) {
                var n = i[s];
                ++s;
                var o = n.pageX - window.pageXOffset - e.x,
                    r = n.pageY - window.pageYOffset - e.y;
                o /= e.width, r /= e.height, this.system.dispatch_touch_up_event(o, r, n.identifier, C.Snow.core.timestamp())
            }
        },
        on_touchmove: function(t) {
            for (var e = this.system.app.windowing.window_from_handle(t.target), s = 0, i = t.changedTouches; s < i.length;) {
                var n = i[s];
                ++s;
                var o = n.pageX - window.pageXOffset - e.x,
                    r = n.pageY - window.pageYOffset - e.y;
                o /= e.width, r /= e.height, this.system.dispatch_touch_move_event(o, r, 0, 0, n.identifier, C.Snow.core.timestamp())
            }
        },
        __class__: C.core.web.input.Input
    }, C.modules.interfaces.IO = function() {}, i["snow.modules.interfaces.IO"] = C.modules.interfaces.IO, C.modules.interfaces.IO.__name__ = !0, C.core.web.io = {}, C.core.web.io.IO = function(t) {
        this.system = t
    }, i["snow.core.web.io.IO"] = C.core.web.io.IO, C.core.web.io.IO.__name__ = !0, C.core.web.io.IO.__interfaces__ = [C.modules.interfaces.IO], C.core.web.io.IO.prototype = {
        data_load: function(t, e) {
            return new C.api.Promise(function(s, i) {
                var n = !0,
                    o = !0;
                null != e && null != e.binary && (o = e.binary);
                var r = new XMLHttpRequest;
                r.open("GET", t, n), r.overrideMimeType(o ? "text/plain; charset=x-user-defined" : "text/plain; charset=UTF-8"), n && (r.responseType = "arraybuffer"), r.onload = function() {
                    200 == r.status ? s(function() {
                        var t, e, s = r.response;
                        return e = null != s ? new Uint8Array(s) : null, t = e
                    }(this)) : i(C.types.Error.error("request status was " + r.status + " / " + r.statusText))
                }, r.send()
            })
        },
        init: function() {},
        update: function() {},
        destroy: function() {},
        on_event: function() {},
        __class__: C.core.web.io.IO
    }, C.modules.interfaces.Windowing = function() {}, i["snow.modules.interfaces.Windowing"] = C.modules.interfaces.Windowing, C.modules.interfaces.Windowing.__name__ = !0, C.core.web.window = {}, C.core.web.window.Windowing = function(t) {
        this._hidden_event_name = "", this._hidden_name = "", this._cursor_visible = !0, this._pre_fs_body_margin = "0", this._pre_fs_body_overflow = "0", this._pre_fs_height = 0, this._pre_fs_width = 0, this._pre_fs_s_height = "", this._pre_fs_s_width = "", this._pre_fs_margin = "0", this._pre_fs_padding = "0", this.seq_window = 1, this.system = t, this.fs_windows = [], this.gl_contexts = new S.ds.IntMap
    }, i["snow.core.web.window.Windowing"] = C.core.web.window.Windowing, C.core.web.window.Windowing.__name__ = !0, C.core.web.window.Windowing.__interfaces__ = [C.modules.interfaces.Windowing], C.core.web.window.Windowing.prototype = {
        init: function() {
            this.listen_for_visibility(), this.listen_for_resize()
        },
        update: function() {},
        destroy: function() {},
        _copy_config: function(t) {
            return {
                borderless: t.borderless,
                fullscreen: t.fullscreen,
                fullscreen_desktop: t.fullscreen_desktop,
                height: t.height,
                no_input: t.no_input,
                resizable: t.resizable,
                title: t.title,
                width: t.width,
                x: t.x,
                y: t.y
            }
        },
        create: function(t, e, s) {
            var i, n = this.seq_window,
                o = window.document;
            i = o.createElement("canvas");
            var r = this._copy_config(e);
            i.width = r.width, i.height = r.height, i.style.display = "block", i.style.position = "relative", i.style.background = "#000", window.document.body.appendChild(i);
            var a = A.html._CanvasElement.CanvasUtil.getContextWebGL(i, {
                alpha: !1,
                premultipliedAlpha: !1,
                antialias: t.antialiasing > 0
            });
            if (null == a) {
                var l = "QWOP requires Flash or WebGL";
                throw this.internal_fallback(l), C.types.Error.windowing(l)
            }
            null == C.modules.opengl.web.GL.current_context && (C.modules.opengl.web.GL.current_context = a), this.gl_contexts.set(n, a);
            var h = this.get_real_window_position(i);
            r.x = h.x, r.y = h.y, null != r.title && "" != r.title && (window.document.title = r.title), s(i, n, {
                config: r,
                render_config: t
            }), i.setAttribute("id", "window" + n), this.seq_window++
        },
        internal_resize: function(t, e, s) {
            this.system.app.dispatch_system_event({
                type: 5,
                window: {
                    type: 7,
                    timestamp: C.Snow.core.timestamp(),
                    window_id: t.id,
                    event: {
                        x: e,
                        y: s
                    }
                }
            }), this.system.app.dispatch_system_event({
                type: 5,
                window: {
                    type: 6,
                    timestamp: C.Snow.core.timestamp(),
                    window_id: t.id,
                    event: {
                        x: e,
                        y: s
                    }
                }
            })
        },
        update_window: function(t) {
            var e = t.handle.getBoundingClientRect();
            (e.left != t.x || e.top != t.y) && this.system.app.dispatch_system_event({
                type: 5,
                window: {
                    type: 5,
                    timestamp: C.Snow.core.timestamp(),
                    window_id: t.id,
                    event: {
                        x: e.left,
                        y: e.top
                    }
                }
            }), (e.width != t.width || e.height != t.height) && this.internal_resize(t, e.width, e.height), e = null
        },
        render: function(t) {
            var e = this.gl_contexts.get(t.id);
            C.modules.opengl.web.GL.current_context != e && (C.modules.opengl.web.GL.current_context = e)
        },
        swap: function() {},
        set_size: function(t, e, s) {
            t.handle.width = e, t.handle.height = s, t.handle.style.width = "" + e + "px", t.handle.style.height = "" + s + "px", this.internal_resize(t, e, s)
        },
        set_position: function(t, e, s) {
            t.handle.style.left = "" + e + "px", t.handle.style.top = "" + s + "px"
        },
        get_real_window_position: function(t) {
            for (var e = 0, s = 0, i = t, n = !0, o = 0; 1 == n;) {
                if (o++, o > 100) {
                    n = !1;
                    break
                }
                null != i.offsetParent ? (e += i.offsetLeft, s += i.offsetTop, i = i.offsetParent) : n = !1
            }
            return {
                x: e,
                y: s
            }
        },
        set_max_size: function(t, e, s) {
            t.handle.style.maxWidth = "" + e + "px", t.handle.style.maxHeight = "" + s + "px"
        },
        set_min_size: function(t, e, s) {
            t.handle.style.minWidth = "" + e + "px", t.handle.style.minHeight = "" + s + "px"
        },
        internal_fullscreen: function(t, e) {
            var i = t.handle;
            e ? -1 == h.indexOf(this.fs_windows, t, 0) && this.fs_windows.push(t) : h.remove(this.fs_windows, t);
            var n = this.system.app.config.web.true_fullscreen;
            e ? n ? null == s(i, i.requestFullscreen) ? null == s(i, i.requestFullScreen) ? null == i.webkitRequestFullscreen ? null == i.mozRequestFullScreen || i.mozRequestFullScreen() : i.webkitRequestFullscreen() : i.requestFullScreen(null) : i.requestFullscreen() : (this._pre_fs_padding = i.style.padding, this._pre_fs_margin = i.style.margin, this._pre_fs_s_width = i.style.width, this._pre_fs_s_height = i.style.height, this._pre_fs_width = i.width, this._pre_fs_height = i.height, this._pre_fs_body_margin = window.document.body.style.margin, this._pre_fs_body_overflow = window.document.body.style.overflow, i.style.margin = "0", i.style.padding = "0", i.style.width = window.innerWidth + "px", i.style.height = window.innerHeight + "px", i.width = window.innerWidth, i.height = window.innerHeight, window.document.body.style.margin = "0", window.document.body.style.overflow = "hidden") : n || (i.style.padding = this._pre_fs_padding, i.style.margin = this._pre_fs_margin, i.style.width = this._pre_fs_s_width, i.style.height = this._pre_fs_s_height, i.width = this._pre_fs_width, i.height = this._pre_fs_height, window.document.body.style.margin = this._pre_fs_body_margin, window.document.body.style.overflow = this._pre_fs_body_overflow)
        },
        grab: function(t, e) {
            e && (null == (k = t.handle, s(k, k.requestPointerLock)) ? null == t.handle.webkitRequestPointerLock ? null == t.handle.mozRequestPointerLock || t.handle.mozRequestPointerLock() : t.handle.webkitRequestPointerLock() : t.handle.requestPointerLock())
        },
        set_cursor_position: function() {},
        system_enable_cursor: function(t) {
            if (null == this.cursor_style) {
                var e = window.document;
                this.cursor_style = e.createElement("style"), this.cursor_style.innerHTML = "* { cursor:none; }"
            }
            t && !this._cursor_visible ? (this._cursor_visible = !0, window.document.body.removeChild(this.cursor_style)) : !t && this._cursor_visible && (this._cursor_visible = !1, window.document.body.appendChild(this.cursor_style))
        },
        listen: function(t) {
            t.handle.addEventListener("mouseleave", s(this, this.on_internal_leave)), t.handle.addEventListener("mouseenter", s(this, this.on_internal_enter)), t.config.fullscreen && (this.internal_fullscreen(t, t.config.fullscreen), t.config.width = t.handle.width, t.config.height = t.handle.height)
        },
        on_internal_leave: function(t) {
            var e = this.system.window_from_handle(t.target);
            this.system.app.dispatch_system_event({
                type: 5,
                window: {
                    type: 12,
                    timestamp: t.timeStamp,
                    window_id: e.id,
                    event: t
                }
            })
        },
        on_internal_enter: function(t) {
            var e = this.system.window_from_handle(t.target);
            this.system.app.dispatch_system_event({
                type: 5,
                window: {
                    type: 11,
                    timestamp: t.timeStamp,
                    window_id: e.id,
                    event: t
                }
            })
        },
        listen_for_resize: function() {
            var t = this;
            window.onresize = function() {
                if (!t.system.app.config.web.true_fullscreen)
                    for (var e = 0, s = t.fs_windows; e < s.length;) {
                        var i = s[e];
                        ++e, i.set_size(window.innerWidth, window.innerHeight), t.internal_resize(i, i.width, i.height)
                    }
            }
        },
        listen_for_visibility: function() {
            void 0 !== typeof document.hidden ? (this._hidden_name = "hidden", this._hidden_event_name = "visibilitychange") : void 0 !== typeof document.mozHidden ? (this._hidden_name = "mozHidden", this._hidden_name = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (this._hidden_name = "msHidden", this._hidden_event_name = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (this._hidden_name = "webkitHidden", this._hidden_event_name = "webkitvisibilitychange"), "" != this._hidden_name && "" != this._hidden_event_name && window.document.addEventListener(this._hidden_event_name, s(this, this.on_visibility_change))
        },
        on_visibility_change: function(t) {
            var e = {
                type: 5,
                window: {
                    type: 2,
                    timestamp: C.Snow.core.timestamp(),
                    window_id: 1,
                    event: t
                }
            };
            document[this._hidden_name] ? (e.window.type = 3, this.system.app.dispatch_system_event(e), e.window.type = 8, this.system.app.dispatch_system_event(e), e.window.type = 14, this.system.app.dispatch_system_event(e)) : (e.window.type = 2, this.system.app.dispatch_system_event(e), e.window.type = 10, this.system.app.dispatch_system_event(e), e.window.type = 13, this.system.app.dispatch_system_event(e))
        },
        internal_fallback: function(t) {
            var e, s, i = window.document;
            e = i.createElement("div");
            var n = window.document;
            s = n.createElement("div"), e.style.marginLeft = "auto", e.style.marginRight = "auto", e.style.color = "#d3d3d3", e.style.marginTop = "5em", e.style.fontSize = "1.4em", e.style.fontFamily = "helvetica,sans-serif", e.innerHTML = t, s.style.top = "0", s.style.left = "0", s.style.width = "100%", s.style.height = "100%", s.style.display = "block", s.style.minWidth = "100%", s.style.minHeight = "100%", s.style.textAlign = "center", s.style.position = "absolute", s.style.background = "rgba(1,1,1,0.90)", s.appendChild(e), window.document.body.appendChild(s)
        },
        __class__: C.core.web.window.Windowing
    }, C.modules.interfaces.Audio = function() {}, i["snow.modules.interfaces.Audio"] = C.modules.interfaces.Audio, C.modules.interfaces.Audio.__name__ = !0, C.modules.howlerjs = {}, C.modules.howlerjs.Audio = function(t) {
        this.system = t, this.suspended_sounds = [], this.handles = new S.ds.ObjectMap
    }, i["snow.modules.howlerjs.Audio"] = C.modules.howlerjs.Audio, C.modules.howlerjs.Audio.__name__ = !0, C.modules.howlerjs.Audio.__interfaces__ = [C.modules.interfaces.Audio], C.modules.howlerjs.Audio.prototype = {
        init: function() {},
        update: function() {},
        destroy: function() {},
        on_event: function() {},
        suspend: function() {
            for (var t = this.handles.iterator(); t.hasNext();) {
                var e = t.next();
                e.get_playing() && (e.toggle(), this.suspended_sounds.push(e))
            }
        },
        resume: function() {
            for (; this.suspended_sounds.length > 0;) {
                var t = this.suspended_sounds.pop();
                t.toggle()
            }
        },
        info_from_id: function(t, e) {
            if (null == e) {
                var s = S.io.Path.extension(t);
                switch (s) {
                    case "wav":
                        e = 2;
                        break;
                    case "ogg":
                        e = 1;
                        break;
                    case "pcm":
                        e = 3;
                        break;
                    default:
                        e = 0
                }
            }
            return {
                format: e,
                id: t,
                handle: null,
                data: null
            }
        },
        create_sound: function(t, e, s, i) {
            null == s && (s = !1);
            var n = this;
            return new C.api.Promise(function(o, r) {
                var a = n.system.app.assets.root + t,
                    l = n.info_from_id(a, i),
                    h = new C.modules.howlerjs.sound.Sound(n.system, e, s);
                l.handle = new window.Howl({
                    urls: [a],
                    onend: function() {
                        n.system.app.audio.module._on_end(l.handle)
                    },
                    onloaderror: function() {
                        r(C.types.Error.error("failed to create sound " + e + " from " + t))
                    },
                    onload: function() {
                        l.handle = this, h.set_info(l);
                        var t = l.handle;
                        n.handles.set(t, h), o(h)
                    }
                })
            })
        },
        create_sound_from_bytes: function(t, e, s) {
            var i, n = this;
            switch (s) {
                case 1:
                    i = "ogg";
                    break;
                case 2:
                    i = "wav";
                    break;
                case 3:
                    throw C.types.Error.error("pcm audio format unsupported atm");
                case 0:
                    throw C.types.Error.error("unknown audio format for create_sound_from_bytes " + t)
            }
            for (var o = "", r = 0, a = e.length; a > r;) o += String.fromCharCode(function() {
                var t, s, i = r++;
                return s = e[i], t = 255 & s
            }(this));
            var l = window.btoa(o),
                h = "data:audio/" + i + ";base64," + l,
                c = this.info_from_id("bytes;" + t, s),
                _ = new C.modules.howlerjs.sound.Sound(this.system, t, !1);
            return c.handle = new window.Howl({
                urls: [h],
                onend: function() {
                    n.system.app.audio.module._on_end(c.handle)
                },
                onloaderror: function() {
                    throw C.types.Error.error("failed to create sound " + t + " from bytes")
                },
                onload: function() {
                    c.handle = this, _.set_info(c);
                    var t = c.handle;
                    n.handles.set(t, _)
                }
            }), _
        },
        _on_end: function(t) {
            var e, s = t;
            e = this.handles.h[s.__id__], null != e && e.emit("end")
        },
        __class__: C.modules.howlerjs.Audio
    }, C.system.audio = {}, C.system.audio.Sound = function(t, e, s) {
        null == s && (s = !1), this.is_stream = !1, this.looping = !1, this.pan = 0, this.volume = 1, this.pitch = 1, this.loaded = !1, this.playing = !1, this.name = "", this.name = e, this.system = t, this.is_stream = s
    }, i["snow.system.audio.Sound"] = C.system.audio.Sound, C.system.audio.Sound.__name__ = !0, C.system.audio.Sound.prototype = {
        emit: function(t) {
            this.system.sound_event(this, t)
        },
        play: function() {},
        loop: function() {},
        pause: function() {},
        destroy: function() {},
        internal_update: function() {},
        internal_play: function() {},
        internal_pause: function() {},
        toggle: function() {
            this.set_playing(!this.get_playing()), this.get_playing() ? this.get_looping() ? this.loop() : this.play() : this.pause()
        },
        get_playing: function() {
            return this.playing
        },
        get_loaded: function() {
            return this.loaded
        },
        get_info: function() {
            return this.info
        },
        get_pan: function() {
            return this.pan
        },
        get_pitch: function() {
            return this.pitch
        },
        get_volume: function() {
            return this.volume
        },
        get_looping: function() {
            return this.looping
        },
        set_playing: function(t) {
            return this.playing = t
        },
        set_loaded: function(t) {
            return this.loaded = t
        },
        set_volume: function(t) {
            return this.volume = t
        },
        set_looping: function(t) {
            return this.looping = t
        },
        __class__: C.system.audio.Sound,
        __properties__: {
            set_looping: "set_looping",
            get_looping: "get_looping",
            get_pan: "get_pan",
            set_volume: "set_volume",
            get_volume: "get_volume",
            get_pitch: "get_pitch",
            get_info: "get_info",
            set_loaded: "set_loaded",
            get_loaded: "get_loaded",
            set_playing: "set_playing",
            get_playing: "get_playing"
        }
    }, C.modules.howlerjs.sound = {}, C.modules.howlerjs.sound.Sound = function(t, e, s) {
        null == s && (s = !1), C.system.audio.Sound.call(this, t, e, s)
    }, i["snow.modules.howlerjs.sound.Sound"] = C.modules.howlerjs.sound.Sound, C.modules.howlerjs.sound.Sound.__name__ = !0, C.modules.howlerjs.sound.Sound.__super__ = C.system.audio.Sound, C.modules.howlerjs.sound.Sound.prototype = t(C.system.audio.Sound.prototype, {
        set_info: function(t) {
            return null != this.get_info() && this.destroy(), this.info = null, null == t ? this.get_info() : (this.info = t, this.set_loaded(!0), this.get_info())
        },
        set_volume: function(t) {
            return null != this.get_info() && null != this.get_info().handle && this.get_info().handle.volume(t), this.volume = t
        },
        play: function() {
            null != this.get_info() && null != this.get_info().handle && (this.set_playing(!0), this.set_looping(!1), this.get_info().handle.loop(!1), this.get_info().handle.play(), null != this.get_info() && null != this.get_info().handle && (this.get_info().handle.rate(this.get_pitch()), this.get_info().handle.volume(this.get_volume()), this.get_info().handle.pos3d(this.get_pan())))
        },
        loop: function() {
            null != this.get_info() && null != this.get_info().handle && (this.set_playing(!0), this.set_looping(!0), this.get_info().handle.loop(!0), this.get_info().handle.play(), null != this.get_info() && null != this.get_info().handle && (this.get_info().handle.rate(this.get_pitch()), this.get_info().handle.volume(this.get_volume()), this.get_info().handle.pos3d(this.get_pan())))
        },
        pause: function() {
            null != this.get_info() && null != this.get_info().handle && this.get_info().handle.pause()
        },
        destroy: function() {
            null != this.get_info() && null != this.get_info().handle && this.get_info().handle.unload(), this.system.kill(this)
        },
        __class__: C.modules.howlerjs.sound.Sound
    }), C.modules.opengl = {}, C.modules.opengl.web = {}, C.modules.opengl.web.GL = function() {}, i["snow.modules.opengl.web.GL"] = C.modules.opengl.web.GL, C.modules.opengl.web.GL.__name__ = !0, C.modules.opengl.web.GL.activeTexture = function(t) {
        C.modules.opengl.web.GL.current_context.activeTexture(t)
    }, C.modules.opengl.web.GL.attachShader = function(t, e) {
        C.modules.opengl.web.GL.current_context.attachShader(t, e)
    }, C.modules.opengl.web.GL.bindAttribLocation = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.bindAttribLocation(t, e, s)
    }, C.modules.opengl.web.GL.bindBuffer = function(t, e) {
        C.modules.opengl.web.GL.current_context.bindBuffer(t, e)
    }, C.modules.opengl.web.GL.bindTexture = function(t, e) {
        C.modules.opengl.web.GL.current_context.bindTexture(t, e)
    }, C.modules.opengl.web.GL.blendFunc = function(t, e) {
        C.modules.opengl.web.GL.current_context.blendFunc(t, e)
    }, C.modules.opengl.web.GL.bufferData = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.bufferData(t, e, s)
    }, C.modules.opengl.web.GL.bufferSubData = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.bufferSubData(t, e, s)
    }, C.modules.opengl.web.GL.clear = function(t) {
        C.modules.opengl.web.GL.current_context.clear(t)
    }, C.modules.opengl.web.GL.clearColor = function(t, e, s, i) {
        C.modules.opengl.web.GL.current_context.clearColor(t, e, s, i)
    }, C.modules.opengl.web.GL.clearDepth = function(t) {
        C.modules.opengl.web.GL.current_context.clearDepth(t)
    }, C.modules.opengl.web.GL.compileShader = function(t) {
        C.modules.opengl.web.GL.current_context.compileShader(t)
    }, C.modules.opengl.web.GL.compressedTexImage2D = function(t, e, s, i, n, o, r) {
        C.modules.opengl.web.GL.current_context.compressedTexImage2D(t, e, s, i, n, o, r)
    }, C.modules.opengl.web.GL.createBuffer = function() {
        return C.modules.opengl.web.GL.current_context.createBuffer()
    }, C.modules.opengl.web.GL.createProgram = function() {
        return C.modules.opengl.web.GL.current_context.createProgram()
    }, C.modules.opengl.web.GL.createShader = function(t) {
        return C.modules.opengl.web.GL.current_context.createShader(t)
    }, C.modules.opengl.web.GL.createTexture = function() {
        return C.modules.opengl.web.GL.current_context.createTexture()
    }, C.modules.opengl.web.GL.deleteFramebuffer = function(t) {
        C.modules.opengl.web.GL.current_context.deleteFramebuffer(t)
    }, C.modules.opengl.web.GL.deleteProgram = function(t) {
        C.modules.opengl.web.GL.current_context.deleteProgram(t)
    }, C.modules.opengl.web.GL.deleteRenderbuffer = function(t) {
        C.modules.opengl.web.GL.current_context.deleteRenderbuffer(t)
    }, C.modules.opengl.web.GL.deleteShader = function(t) {
        C.modules.opengl.web.GL.current_context.deleteShader(t)
    }, C.modules.opengl.web.GL.deleteTexture = function(t) {
        C.modules.opengl.web.GL.current_context.deleteTexture(t)
    }, C.modules.opengl.web.GL.depthFunc = function(t) {
        C.modules.opengl.web.GL.current_context.depthFunc(t)
    }, C.modules.opengl.web.GL.disable = function(t) {
        C.modules.opengl.web.GL.current_context.disable(t)
    }, C.modules.opengl.web.GL.drawArrays = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.drawArrays(t, e, s)
    }, C.modules.opengl.web.GL.enable = function(t) {
        C.modules.opengl.web.GL.current_context.enable(t)
    }, C.modules.opengl.web.GL.enableVertexAttribArray = function(t) {
        C.modules.opengl.web.GL.current_context.enableVertexAttribArray(t)
    }, C.modules.opengl.web.GL.getParameter = function(t) {
        return C.modules.opengl.web.GL.current_context.getParameter(t)
    }, C.modules.opengl.web.GL.getProgramInfoLog = function(t) {
        return C.modules.opengl.web.GL.current_context.getProgramInfoLog(t)
    }, C.modules.opengl.web.GL.getProgramParameter = function(t, e) {
        return C.modules.opengl.web.GL.current_context.getProgramParameter(t, e)
    }, C.modules.opengl.web.GL.getShaderInfoLog = function(t) {
        return C.modules.opengl.web.GL.current_context.getShaderInfoLog(t)
    }, C.modules.opengl.web.GL.getShaderParameter = function(t, e) {
        return C.modules.opengl.web.GL.current_context.getShaderParameter(t, e)
    }, C.modules.opengl.web.GL.getUniformLocation = function(t, e) {
        return C.modules.opengl.web.GL.current_context.getUniformLocation(t, e)
    }, C.modules.opengl.web.GL.linkProgram = function(t) {
        C.modules.opengl.web.GL.current_context.linkProgram(t)
    }, C.modules.opengl.web.GL.pixelStorei = function(t, e) {
        C.modules.opengl.web.GL.current_context.pixelStorei(t, e)
    }, C.modules.opengl.web.GL.scissor = function(t, e, s, i) {
        C.modules.opengl.web.GL.current_context.scissor(t, e, s, i)
    }, C.modules.opengl.web.GL.shaderSource = function(t, e) {
        C.modules.opengl.web.GL.current_context.shaderSource(t, e)
    }, C.modules.opengl.web.GL.texImage2D = function(t, e, s, i, n, o, r, a, l) {
        C.modules.opengl.web.GL.current_context.texImage2D(t, e, s, i, n, o, r, a, l)
    }, C.modules.opengl.web.GL.texParameteri = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.texParameteri(t, e, s)
    }, C.modules.opengl.web.GL.uniform1f = function(t, e) {
        C.modules.opengl.web.GL.current_context.uniform1f(t, e)
    }, C.modules.opengl.web.GL.uniform1i = function(t, e) {
        C.modules.opengl.web.GL.current_context.uniform1i(t, e)
    }, C.modules.opengl.web.GL.uniform2f = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.uniform2f(t, e, s)
    }, C.modules.opengl.web.GL.uniform3f = function(t, e, s, i) {
        C.modules.opengl.web.GL.current_context.uniform3f(t, e, s, i)
    }, C.modules.opengl.web.GL.uniform4f = function(t, e, s, i, n) {
        C.modules.opengl.web.GL.current_context.uniform4f(t, e, s, i, n)
    }, C.modules.opengl.web.GL.uniformMatrix4fv = function(t, e, s) {
        C.modules.opengl.web.GL.current_context.uniformMatrix4fv(t, e, s)
    }, C.modules.opengl.web.GL.useProgram = function(t) {
        C.modules.opengl.web.GL.current_context.useProgram(t)
    }, C.modules.opengl.web.GL.vertexAttribPointer = function(t, e, s, i, n, o) {
        C.modules.opengl.web.GL.current_context.vertexAttribPointer(t, e, s, i, n, o)
    }, C.modules.opengl.web.GL.viewport = function(t, e, s, i) {
        C.modules.opengl.web.GL.current_context.viewport(t, e, s, i)
    }, C.system.assets = {}, C.system.assets.Asset = function(t, e, s) {
        if (null == s && (s = 0), this.loaded = !1, null == e) throw C.api.DebugError.null_assertion("_id was null");
        if (null == t) throw C.api.DebugError.null_assertion("_system was null");
        this.system = t, this.type = s, this.id = e
    }, i["snow.system.assets.Asset"] = C.system.assets.Asset, C.system.assets.Asset.__name__ = !0, C.system.assets.Asset.prototype = {
        __class__: C.system.assets.Asset
    }, C.system.assets.AssetImage = function(t, e, s) {
        C.system.assets.Asset.call(this, t, e, 4), this.set_image(s)
    }, i["snow.system.assets.AssetImage"] = C.system.assets.AssetImage, C.system.assets.AssetImage.__name__ = !0, C.system.assets.AssetImage.load = function(t, e) {
        if (null == e) throw C.api.DebugError.null_assertion("_id was null");
        if (null == t) throw C.api.DebugError.null_assertion("_system was null");
        return new C.system.assets.AssetImage(t, e, null).reload()
    }, C.system.assets.AssetImage.load_from_bytes = function(t, e, s) {
        if (null == e) throw C.api.DebugError.null_assertion("_id was null");
        if (null == s) throw C.api.DebugError.null_assertion("_bytes was null");
        if (null == t) throw C.api.DebugError.null_assertion("_system was null");
        return new C.system.assets.AssetImage(t, e, null).reload_from_bytes(s)
    }, C.system.assets.AssetImage.provider = function(t, e) {
        return t.assets.module.image_load_info(e)
    }, C.system.assets.AssetImage.processor = function(t, e, s) {
        return null == s ? C.api.Promise.reject(C.types.Error.error("AssetImage processor: data was null")) : t.assets.module.image_info_from_bytes(e, s)
    }, C.system.assets.AssetImage.__super__ = C.system.assets.Asset, C.system.assets.AssetImage.prototype = t(C.system.assets.Asset.prototype, {
        reload: function() {
            var t = this;
            return this.loaded = !1, new C.api.Promise(function(e, s) {
                var i = t.system.app.io.data_flow(t.system.root + t.id, null, C.system.assets.AssetImage.provider);
                i.then(function(s) {
                    t.set_image(s), e(t)
                }).error(s)
            })
        },
        reload_from_bytes: function(t) {
            var e = this;
            return this.loaded = !1, new C.api.Promise(function(s, i) {
                var n = e.system.module.image_info_from_bytes(e.id, t);
                n.then(function(t) {
                    e.set_image(t), s(e)
                }).error(i)
            })
        },
        set_image: function(t) {
            return this.loaded = null != t, this.image = t
        },
        __class__: C.system.assets.AssetImage,
        __properties__: {
            set_image: "set_image"
        }
    }), C.system.assets.AssetBytes = function(t, e, s) {
        C.system.assets.Asset.call(this, t, e, 1), this.set_bytes(s)
    }, i["snow.system.assets.AssetBytes"] = C.system.assets.AssetBytes, C.system.assets.AssetBytes.__name__ = !0, C.system.assets.AssetBytes.load = function(t, e) {
        return new C.system.assets.AssetBytes(t, e, null).reload()
    }, C.system.assets.AssetBytes.__super__ = C.system.assets.Asset, C.system.assets.AssetBytes.prototype = t(C.system.assets.Asset.prototype, {
        reload: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                t.system.app.io.data_flow(t.system.root + t.id).then(function(s) {
                    t.set_bytes(s), e(t)
                }).error(s)
            })
        },
        destroy: function() {
            this.set_bytes(null)
        },
        set_bytes: function(t) {
            return this.loaded = null != t, this.bytes = t
        },
        __class__: C.system.assets.AssetBytes,
        __properties__: {
            set_bytes: "set_bytes"
        }
    }), C.system.assets.AssetText = function(t, e, s) {
        C.system.assets.Asset.call(this, t, e, 2), this.set_text(s)
    }, i["snow.system.assets.AssetText"] = C.system.assets.AssetText, C.system.assets.AssetText.__name__ = !0, C.system.assets.AssetText.load = function(t, e) {
        return new C.system.assets.AssetText(t, e, null).reload()
    }, C.system.assets.AssetText.processor = function(t, e, s) {
        return null == s ? C.api.Promise.reject(C.types.Error.error("AssetText processor: data was null")) : C.api.Promise.resolve(C.api.buffers._Uint8Array.Uint8Array_Impl_.toBytes(s).toString())
    }, C.system.assets.AssetText.__super__ = C.system.assets.Asset, C.system.assets.AssetText.prototype = t(C.system.assets.Asset.prototype, {
        reload: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                t.system.app.io.data_flow(t.system.root + t.id, C.system.assets.AssetText.processor).then(function(s) {
                    t.set_text(s), e(t)
                }).error(s)
            })
        },
        destroy: function() {
            this.set_text(null)
        },
        set_text: function(t) {
            return this.loaded = null != t, this.text = t
        },
        __class__: C.system.assets.AssetText,
        __properties__: {
            set_text: "set_text"
        }
    }), C.system.assets.AssetJSON = function(t, e, s) {
        C.system.assets.Asset.call(this, t, e, 3), this.set_json(s)
    }, i["snow.system.assets.AssetJSON"] = C.system.assets.AssetJSON, C.system.assets.AssetJSON.__name__ = !0, C.system.assets.AssetJSON.load = function(t, e) {
        return new C.system.assets.AssetJSON(t, e, null).reload()
    }, C.system.assets.AssetJSON.processor = function(t, e, s) {
        return null == s ? C.api.Promise.reject(C.types.Error.error("AssetJSON: data was null")) : new C.api.Promise(function(t, e) {
            var i = null;
            try {
                i = JSON.parse(C.api.buffers._Uint8Array.Uint8Array_Impl_.toBytes(s).toString())
            } catch (n) {
                return e(C.types.Error.parse(n))
            }
            return t(i)
        })
    }, C.system.assets.AssetJSON.__super__ = C.system.assets.Asset, C.system.assets.AssetJSON.prototype = t(C.system.assets.Asset.prototype, {
        reload: function() {
            var t = this;
            return new C.api.Promise(function(e, s) {
                t.system.app.io.data_flow(t.system.root + t.id, C.system.assets.AssetJSON.processor).then(function(s) {
                    t.set_json(s), e(t)
                }).error(s)
            })
        },
        destroy: function() {
            this.set_json(null)
        },
        set_json: function(t) {
            return this.loaded = null != t, this.json = t
        },
        __class__: C.system.assets.AssetJSON,
        __properties__: {
            set_json: "set_json"
        }
    }), C.system.assets.Assets = function(t) {
        this.manifest_path = "manifest", this.root = "", this.app = t, this.list = [], this.module = new C.core.web.assets.Assets(this)
    }, i["snow.system.assets.Assets"] = C.system.assets.Assets, C.system.assets.Assets.__name__ = !0, C.system.assets.Assets.prototype = {
        __class__: C.system.assets.Assets
    }, C.system.audio.Audio = function(t) {
        this.active = !1, this.app = t, this.module = new C.modules.howlerjs.Audio(this), this.module.init(), this.sound_list = new S.ds.StringMap, this.stream_list = new S.ds.StringMap, this.active = !0
    }, i["snow.system.audio.Audio"] = C.system.audio.Audio, C.system.audio.Audio.__name__ = !0, C.system.audio.Audio.prototype = {
        create: function(t, e, s) {
            null == s && (s = !1), null == e && (e = "");
            var i = this;
            return "" == e && (e = this.app.make_uniqueid()), new C.api.Promise(function(n, o) {
                var r = i.module.create_sound(t, e, s);
                r.then(function(t) {
                    i.sound_list.set(e, t), s && i.stream_list.set(e, t), n(t), t.emit("load")
                }).error(o)
            })
        },
        create_from_bytes: function(t, e, s) {
            null == t && (t = ""), "" == t && (t = this.app.make_uniqueid());
            var i = this.module.create_sound_from_bytes(t, e, s);
            if (null == i) throw C.api.DebugError.null_assertion("sound was null");
            return this.sound_list.set(t, i), i
        },
        on: function(t, e, s) {
            if ("load" == e) {
                var i = this.get(t);
                if (null != i && i.get_loaded()) return void s(i)
            }
            var n = "" + e + C.system.audio.Audio.splitter + t;
            null == this.handlers && (this.handlers = new S.ds.StringMap), this.handlers.exists(n) || this.handlers.set(n, []);
            var o = this.handlers.get(n);
            if (-1 != h.indexOf(o, s, 0)) throw "Audio on event adding the same handler twice";
            o.push(s), this.handlers.set(n, o)
        },
        get: function(t) {
            var e = this.sound_list.get(t);
            return e
        },
        volume: function(t, e) {
            var s = this.get(t);
            return null != s ? null != e ? s.set_volume(e) : s.get_volume() : 0
        },
        play: function(t) {
            if (this.active) {
                var e = this.get(t);
                null != e && e.play()
            }
        },
        loop: function(t) {
            if (this.active) {
                var e = this.get(t);
                null != e && e.loop()
            }
        },
        kill: function(t) {
            null != t && (this.sound_list.remove(t.name), this.stream_list.remove(t.name))
        },
        suspend: function() {
            if (this.active) {
                this.active = !1;
                for (var t = this.stream_list.iterator(); t.hasNext();) {
                    var e = t.next();
                    e.internal_pause()
                }
                this.module.suspend()
            }
        },
        resume: function() {
            if (!this.active) {
                this.active = !0, this.module.resume();
                for (var t = this.stream_list.iterator(); t.hasNext();) {
                    var e = t.next();
                    e.internal_play()
                }
            }
        },
        on_event: function(t) {
            this.module.on_event(t), 10 == t.type ? this.suspend() : 12 == t.type && this.resume()
        },
        destroy: function() {
            this.active = !1;
            for (var t = this.sound_list.iterator(); t.hasNext();) {
                var e = t.next();
                e.destroy()
            }
            this.module.destroy()
        },
        update: function() {
            if (this.active) {
                for (var t = this.sound_list.iterator(); t.hasNext();) {
                    var e = t.next();
                    e.get_playing() && e.internal_update()
                }
                this.module.update()
            }
        },
        sound_event: function(t, e) {
            var s = "" + e + C.system.audio.Audio.splitter + t.name;
            if (null != this.handlers) {
                var i = this.handlers.get(s);
                if (null != i)
                    for (var n = 0; n < i.length;) {
                        var o = i[n];
                        ++n, o(t)
                    }
            }
        },
        __class__: C.system.audio.Audio
    }, C.system.input.Input = function(t) {
        this.touch_count = 0, this.app = t, this.module = new C.core.web.input.Input(this), this.module.init(), this.key_code_pressed = new S.ds.IntMap, this.key_code_down = new S.ds.IntMap, this.key_code_released = new S.ds.IntMap, this.scan_code_pressed = new S.ds.IntMap, this.scan_code_down = new S.ds.IntMap, this.scan_code_released = new S.ds.IntMap, this.mouse_button_pressed = new S.ds.IntMap, this.mouse_button_down = new S.ds.IntMap, this.mouse_button_released = new S.ds.IntMap, this.gamepad_button_pressed = new S.ds.IntMap, this.gamepad_button_down = new S.ds.IntMap, this.gamepad_button_released = new S.ds.IntMap, this.gamepad_axis_values = new S.ds.IntMap, this.touches_down = new S.ds.IntMap
    }, i["snow.system.input.Input"] = C.system.input.Input, C.system.input.Input.__name__ = !0, C.system.input.Input.prototype = {
        dispatch_key_down_event: function(t, e, s, i, n, o) {
            s || (this.key_code_pressed.set(t, !1), this.key_code_down.set(t, !0), this.scan_code_pressed.set(e, !1), this.scan_code_down.set(e, !0)), this.app.host.onkeydown(t, e, s, i, n, o)
        },
        dispatch_key_up_event: function(t, e, s, i, n, o) {
            this.key_code_released.set(t, !1), this.key_code_down.remove(t), this.scan_code_released.set(e, !1), this.scan_code_down.remove(e), this.app.host.onkeyup(t, e, s, i, n, o)
        },
        dispatch_text_event: function(t, e, s, i, n, o) {
            this.app.host.ontextinput(t, e, s, i, n, o)
        },
        dispatch_mouse_move_event: function(t, e, s, i, n, o) {
            this.app.host.onmousemove(t, e, s, i, n, o)
        },
        dispatch_mouse_down_event: function(t, e, s, i, n) {
            this.mouse_button_pressed.set(s, !1), this.mouse_button_down.set(s, !0), this.app.host.onmousedown(t, e, s, i, n)
        },
        dispatch_mouse_up_event: function(t, e, s, i, n) {
            this.mouse_button_released.set(s, !1), this.mouse_button_down.remove(s), this.app.host.onmouseup(t, e, s, i, n)
        },
        dispatch_mouse_wheel_event: function(t, e, s, i) {
            this.app.host.onmousewheel(t, e, s, i)
        },
        dispatch_touch_down_event: function(t, e, s, i) {
            this.touches_down.exists(s) || (this.touch_count++, this.touches_down.set(s, !0)), this.app.host.ontouchdown(t, e, s, i)
        },
        dispatch_touch_up_event: function(t, e, s, i) {
            this.app.host.ontouchup(t, e, s, i), this.touches_down.remove(s) && this.touch_count--
        },
        dispatch_touch_move_event: function(t, e, s, i, n, o) {
            this.app.host.ontouchmove(t, e, s, i, n, o)
        },
        dispatch_gamepad_axis_event: function(t, e, s, i) {
            if (!this.gamepad_axis_values.exists(t)) {
                var n = new S.ds.IntMap;
                this.gamepad_axis_values.set(t, n)
            }
            var o = this.gamepad_axis_values.get(t);
            o.set(e, s), this.app.host.ongamepadaxis(t, e, s, i)
        },
        dispatch_gamepad_button_down_event: function(t, e, s, i) {
            if (!this.gamepad_button_pressed.exists(t)) {
                var n = new S.ds.IntMap;
                this.gamepad_button_pressed.set(t, n)
            }
            if (!this.gamepad_button_down.exists(t)) {
                var o = new S.ds.IntMap;
                this.gamepad_button_down.set(t, o)
            }
            var r = this.gamepad_button_pressed.get(t);
            r.set(e, !1);
            var a = this.gamepad_button_down.get(t);
            a.set(e, !0), this.app.host.ongamepaddown(t, e, s, i)
        },
        dispatch_gamepad_button_up_event: function(t, e, s, i) {
            if (!this.gamepad_button_released.exists(t)) {
                var n = new S.ds.IntMap;
                this.gamepad_button_released.set(t, n)
            }
            if (!this.gamepad_button_down.exists(t)) {
                var o = new S.ds.IntMap;
                this.gamepad_button_down.set(t, o)
            }
            var r = this.gamepad_button_released.get(t);
            r.set(e, !1);
            var a = this.gamepad_button_down.get(t);
            a.remove(e), this.app.host.ongamepadup(t, e, s, i)
        },
        dispatch_gamepad_device_event: function(t, e, s) {
            this.app.host.ongamepaddevice(t, e, s)
        },
        listen: function(t) {
            this.module.listen(t)
        },
        on_event: function(t) {
            this.module.on_event(t)
        },
        update: function() {
            this.module.update(), this._update_keystate(), this._update_gamepadstate(), this._update_mousestate()
        },
        destroy: function() {
            this.module.destroy()
        },
        _update_mousestate: function() {
            for (var t = this.mouse_button_pressed.keys(); t.hasNext();) {
                var e = t.next();
                this.mouse_button_pressed.get(e) ? this.mouse_button_pressed.remove(e) : this.mouse_button_pressed.set(e, !0)
            }
            for (var s = this.mouse_button_released.keys(); s.hasNext();) {
                var i = s.next();
                this.mouse_button_released.get(i) ? this.mouse_button_released.remove(i) : this.mouse_button_released.set(i, !0)
            }
        },
        _update_gamepadstate: function() {
            for (var t = this.gamepad_button_pressed.iterator(); t.hasNext();)
                for (var e = t.next(), s = e.keys(); s.hasNext();) {
                    var i = s.next();
                    e.get(i) ? e.remove(i) : e.set(i, !0)
                }
            for (var n = this.gamepad_button_released.iterator(); n.hasNext();)
                for (var o = n.next(), r = o.keys(); r.hasNext();) {
                    var a = r.next();
                    o.get(a) ? o.remove(a) : o.set(a, !0)
                }
        },
        _update_keystate: function() {
            for (var t = this.key_code_pressed.keys(); t.hasNext();) {
                var e = t.next();
                this.key_code_pressed.get(e) ? this.key_code_pressed.remove(e) : this.key_code_pressed.set(e, !0)
            }
            for (var s = this.key_code_released.keys(); s.hasNext();) {
                var i = s.next();
                this.key_code_released.get(i) ? this.key_code_released.remove(i) : this.key_code_released.set(i, !0)
            }
            for (var n = this.scan_code_pressed.keys(); n.hasNext();) {
                var o = n.next();
                this.scan_code_pressed.get(o) ? this.scan_code_pressed.remove(o) : this.scan_code_pressed.set(o, !0)
            }
            for (var r = this.scan_code_released.keys(); r.hasNext();) {
                var a = r.next();
                this.scan_code_released.get(a) ? this.scan_code_released.remove(a) : this.scan_code_released.set(a, !0)
            }
        },
        __class__: C.system.input.Input
    }, C.system.io = {}, C.system.io.IO = function(t) {
        this.app = t, this.module = new C.core.web.io.IO(this), this.module.init()
    }, i["snow.system.io.IO"] = C.system.io.IO, C.system.io.IO.__name__ = !0, C.system.io.IO.prototype = {
        data_flow: function(t, e, i) {
            var n = this;
            return null == i && (i = s(this, this.default_provider)), new C.api.Promise(function(s, o) {
                i(n.app, t).then(function(i) {
                    null != e ? e(n.app, t, i).then(s, o) : s(i)
                }).error(o)
            })
        },
        default_provider: function(t, e) {
            return this.module.data_load(e, null)
        },
        __class__: C.system.io.IO
    }, C.system.window = {}, C.system.window.Window = function(t, e) {
        this.internal_resize = !1, this.internal_position = !1, this.minimized = !1, this.closed = !0, this.auto_render = !0, this.auto_swap = !0, this.height = 0, this.width = 0, this.y = 0, this.x = 0, this.grab = !1, this.set_max_size({
            x: 0,
            y: 0
        }), this.set_min_size({
            x: 0,
            y: 0
        }), this.system = t, this.asked_config = e, this.config = e, null == this.config.x && (this.config.x = 536805376), null == this.config.y && (this.config.y = 536805376), this.system.module.create(this.system.app.config.render, e, s(this, this.on_window_created))
    }, i["snow.system.window.Window"] = C.system.window.Window, C.system.window.Window.__name__ = !0, C.system.window.Window.prototype = {
        on_window_created: function(t, e, s) {
            this.id = e, this.handle = t, null != this.handle && (this.closed = !1, this.config = s.config, this.system.app.config.render = s.render_config, this.internal_position = !0, this.set_x(this.config.x), this.set_y(this.config.y), this.internal_position = !1, this.internal_resize = !0, this.set_width(this.config.width), this.set_height(this.config.height), this.internal_resize = !1, this.on_event({
                type: 1,
                window_id: e,
                timestamp: C.Snow.core.timestamp(),
                event: {}
            }))
        },
        on_event: function(t) {
            var e = t.type;
            switch (e) {
                case 5:
                    this.internal_position = !0, this.set_position(t.event.x, t.event.y), this.internal_position = !1;
                    break;
                case 6:
                    this.internal_resize = !0, this.set_size(t.event.x, t.event.y), this.internal_resize = !1;
                    break;
                case 7:
                    this.internal_resize = !0, this.set_size(t.event.x, t.event.y), this.internal_resize = !1;
                    break;
                case 8:
                    this.minimized = !0;
                    break;
                case 10:
                    this.minimized = !1
            }
            null != this.onevent && this.onevent(t)
        },
        update: function() {
            null == this.handle || this.closed || this.system.module.update_window(this)
        },
        render: function() {
            if (!this.minimized && !this.closed && null != this.handle) {
                if (this.system.module.render(this), null != this.onrender) return this.onrender(this), void(this.auto_swap && this.swap());
                C.modules.opengl.web.GL.clearColor(0, 0, 0, 1), C.modules.opengl.web.GL.clear(16384), this.auto_swap && this.swap()
            }
        },
        swap: function() {
            null == this.handle || this.closed || this.minimized || this.system.module.swap(this)
        },
        get_max_size: function() {
            return this.max_size
        },
        get_min_size: function() {
            return this.min_size
        },
        set_x: function(t) {
            return this.x = t, null == this.handle || this.internal_position || this.system.module.set_position(this, this.x, this.y), this.x
        },
        set_y: function(t) {
            return this.y = t, null == this.handle || this.internal_position || this.system.module.set_position(this, this.x, this.y), this.y
        },
        set_width: function(t) {
            return this.width = t, null == this.handle || this.internal_resize || this.system.module.set_size(this, this.width, this.height), this.width
        },
        set_height: function(t) {
            return this.height = t, null == this.handle || this.internal_resize || this.system.module.set_size(this, this.width, this.height), this.height
        },
        set_cursor_position: function(t, e) {
            null == this.handle || this.closed || this.system.module.set_cursor_position(this, t, e)
        },
        set_position: function(t, e) {
            var s = this.internal_position;
            this.internal_position = !0, this.set_x(t), this.set_y(e), this.internal_position = s, null == this.handle || this.internal_position || this.system.module.set_position(this, this.x, this.y)
        },
        set_size: function(t, e) {
            var s = this.internal_resize;
            this.internal_resize = !0, this.set_width(t), this.set_height(e), this.internal_resize = s, null == this.handle || this.internal_resize || this.system.module.set_size(this, t, e)
        },
        set_max_size: function(t) {
            return null != this.get_max_size() && null != this.handle && this.system.module.set_max_size(this, t.x, t.y), this.max_size = t
        },
        set_min_size: function(t) {
            return null != this.get_min_size() && null != this.handle && this.system.module.set_min_size(this, t.x, t.y), this.min_size = t
        },
        set_grab: function(t) {
            return null != this.handle && this.system.module.grab(this, t), this.grab = t
        },
        __class__: C.system.window.Window,
        __properties__: {
            set_min_size: "set_min_size",
            get_min_size: "get_min_size",
            set_max_size: "set_max_size",
            get_max_size: "get_max_size",
            set_height: "set_height",
            set_width: "set_width",
            set_y: "set_y",
            set_x: "set_x",
            set_grab: "set_grab"
        }
    }, C.system.window.Windowing = function(t) {
        this.window_count = 0, this.app = t, this.window_list = new S.ds.IntMap, this.window_handles = new S.ds.ObjectMap, this.module = new C.core.web.window.Windowing(this), this.module.init()
    }, i["snow.system.window.Windowing"] = C.system.window.Windowing, C.system.window.Windowing.__name__ = !0, C.system.window.Windowing.prototype = {
        create: function(t) {
            var e = new C.system.window.Window(this, t);
            return this.window_list.set(e.id, e), this.window_handles.set(e.handle, e.id), this.window_count++, this.module.listen(e), (null == t.no_input || 0 == t.no_input) && this.app.input.listen(e), e
        },
        window_from_handle: function(t) {
            if (null != this.window_handles.h.__keys__[t.__id__]) {
                var e = this.window_handles.h[t.__id__];
                return this.window_list.get(e)
            }
            return null
        },
        enable_cursor: function(t) {
            this.module.system_enable_cursor(t)
        },
        on_event: function(t) {
            if (5 == t.type) {
                var e = t.window,
                    s = this.window_list.get(e.window_id);
                null != s && s.on_event(e)
            }
        },
        update: function() {
            this.module.update();
            for (var t = this.window_list.iterator(); t.hasNext();) {
                var e = t.next();
                e.update()
            }
            for (var s = this.window_list.iterator(); s.hasNext();) {
                var i = s.next();
                i.auto_render && i.render()
            }
        },
        destroy: function() {
            this.module.destroy()
        },
        __class__: C.system.window.Windowing
    }, C.types = {}, C.types.Error = i["snow.types.Error"] = {
        __ename__: !0,
        __constructs__: ["error", "init", "windowing", "parse"]
    }, C.types.Error.error = function(t) {
        var e = ["error", 0, t];
        return e.__enum__ = C.types.Error, e.toString = n, e
    }, C.types.Error.init = function(t) {
        var e = ["init", 1, t];
        return e.__enum__ = C.types.Error, e.toString = n, e
    }, C.types.Error.windowing = function(t) {
        var e = ["windowing", 2, t];
        return e.__enum__ = C.types.Error, e.toString = n, e
    }, C.types.Error.parse = function(t) {
        var e = ["parse", 3, t];
        return e.__enum__ = C.types.Error, e.toString = n, e
    };
    var k, M = 0;
    Array.prototype.indexOf && (h.indexOf = function(t, e, s) {
        return Array.prototype.indexOf.call(t, e, s)
    }), Math.NaN = Number.NaN, Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY, i.Math = Math, Math.isFinite = function(t) {
        return isFinite(t)
    }, Math.isNaN = function(t) {
        return isNaN(t)
    }, String.prototype.__class__ = i.String = String, String.__name__ = !0, i.Array = Array, Array.__name__ = !0, Date.prototype.__class__ = i.Date = Date, Date.__name__ = ["Date"];
    var V = i.Int = {
            __name__: ["Int"]
        },
        z = i.Dynamic = {
            __name__: ["Dynamic"]
        },
        T = i.Float = Number;
    T.__name__ = ["Float"];
    var P = i.Bool = Boolean;
    P.__ename__ = ["Bool"];
    var D = i.Class = {
            __name__: ["Class"]
        },
        L = {};
    null == Array.prototype.map && (Array.prototype.map = function(t) {
        for (var e = [], s = 0, i = this.length; i > s;) {
            var n = s++;
            e[n] = t(this[n])
        }
        return e
    }), null == Array.prototype.filter && (Array.prototype.filter = function(t) {
        for (var e = [], s = 0, i = this.length; i > s;) {
            var n = s++,
                o = this[n];
            t(o) && e.push(o)
        }
        return e
    }), S.Resource.content = [{
        name: "version",
        data: "MS4wLjAtYWxwaGEuMQ"
    }, {
        name: "default.vert.glsl",
        data: "YXR0cmlidXRlIHZlYzMgdmVydGV4UG9zaXRpb247CmF0dHJpYnV0ZSB2ZWMyIHZlcnRleFRDb29yZDsKYXR0cmlidXRlIHZlYzQgdmVydGV4Q29sb3I7CmF0dHJpYnV0ZSB2ZWMzIHZlcnRleE5vcm1hbDsKCnZhcnlpbmcgdmVjMiB0Y29vcmQ7CnZhcnlpbmcgdmVjNCBjb2xvcjsKCnVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4Owp1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4OwoKdm9pZCBtYWluKHZvaWQpIHsKCiAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHZlcnRleFBvc2l0aW9uLCAxLjApOwogICAgdGNvb3JkID0gdmVydGV4VENvb3JkOwogICAgY29sb3IgPSB2ZXJ0ZXhDb2xvcjsKICAgICAgICAvL2htbSEgSSB0aGluayBzaGFkZXJzIGFyZSBjb21waWxlZCBvcHRpbWlzZWQsIHJlbW92aW5nIHVudXNlZCB2YWx1ZXMgd2hpY2ggbWVhbnMKICAgICAgICAvL3RoYXQgdGhlIHNoYWRlcnMgZ2V0VmVydGV4Tm9ybWFsIGF0dHJpYnV0ZSByZXR1cm5zIGludmFsaWQgKC0xKSB2YWx1ZXMhCiAgICB2ZWMzIG4gPSB2ZXJ0ZXhOb3JtYWw7CiAgICBnbF9Qb2ludFNpemUgPSAxLjA7Cgp9"
    }, {
        name: "build",
        data: "KzY4YzMzODdiNTg"
    }, {
        name: "default.frag.glsl",
        data: "dmFyeWluZyB2ZWMyIHRjb29yZDsKdmFyeWluZyB2ZWM0IGNvbG9yOwoKdm9pZCBtYWluKCkgewogICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7Cn0"
    }, {
        name: "default.frag.textured.glsl",
        data: "dW5pZm9ybSBzYW1wbGVyMkQgdGV4MDsKdmFyeWluZyB2ZWMyIHRjb29yZDsKdmFyeWluZyB2ZWM0IGNvbG9yOwoKdm9pZCBtYWluKCkgewogICAgdmVjNCB0ZXhjb2xvciA9IHRleHR1cmUyRCh0ZXgwLCB0Y29vcmQpOwogICAgLy8gZmxvYXQgbHVtaW5vc2l0eSA9ICh0ZXhjb2xvci5yICsgdGV4Y29sb3IuZyArIHRleGNvbG9yLmIpIC8gMy4wOwogICAgLy8gdmVjNCBncmF5ID0gdmVjNChsdW1pbm9zaXR5LGx1bWlub3NpdHksbHVtaW5vc2l0eSwxKTsKICAgIC8vIHZlYzQgb2NvbG9yID0gdmVjNCh0ZXhjb2xvci5yLCB0ZXhjb2xvci5nLCB0ZXhjb2xvci5iLCAxKTsKICAgIC8vIHZlYzQgdXZjb2xvciA9IHZlYzQodGNvb3JkLngsIHRjb29yZC55LCAodGNvb3JkLngrdGNvb3JkLnkpKjIuMCwgMSk7CiAgICAvLyB2ZWM0IHdoaXRlID0gdmVjNCgxLCAxLCAxLCAwLjYpOwogICAgLy8gZ2xfRnJhZ0NvbG9yID0gZ3JheSAqICgodGNvb3JkLngrdGNvb3JkLnkpLzIuMCk7CiAgICBnbF9GcmFnQ29sb3IgPSBjb2xvciAqIHRleGNvbG9yOyAvL3ZlYzQoMCwwLjksMC42LDEpOyA7CiAgICAvLyBnbF9GcmFnQ29sb3IgPSB2ZWM0KGdsX1BvaW50Q29vcmQueCwgZ2xfUG9pbnRDb29yZC55LCAwLCAxKTsKICAgIC8vIHZlYzQgY2MgPSB1dmNvbG9yICogZ3JheTsKICAgIC8vIGdsX0ZyYWdDb2xvciA9IHRleGNvbG9yOwp9"
    }, {
        name: "default.frag.bitmapfont.glsl",
        data: "I2RlZmluZSBPVVRMSU5FIDEKI2RlZmluZSBHTE9XIDEKI2RlZmluZSBTVVBFUlNBTVBMRSAxCgp1bmlmb3JtIHNhbXBsZXIyRCB0ZXgwOwp2YXJ5aW5nIHZlYzIgdGNvb3JkOwp2YXJ5aW5nIHZlYzQgY29sb3I7Cgp1bmlmb3JtIGZsb2F0IHNtb290aG5lc3M7CnVuaWZvcm0gZmxvYXQgdGhpY2tuZXNzOwoKdW5pZm9ybSB2ZWM0IG91dGxpbmVfY29sb3I7CnVuaWZvcm0gZmxvYXQgb3V0bGluZTsKCnVuaWZvcm0gdmVjNCBnbG93X2NvbG9yOwp1bmlmb3JtIGZsb2F0IGdsb3dfdGhyZXNob2xkOwp1bmlmb3JtIGZsb2F0IGdsb3dfYW1vdW50OwoKCmZsb2F0IGVkZ2UoZmxvYXQgdmFsdWUsIGZsb2F0IGFtb3VudCwgZmxvYXQgdCkgewogICAgcmV0dXJuIHNtb290aHN0ZXAodmFsdWUgLSBhbW91bnQsIHZhbHVlICsgYW1vdW50LCB0KTsKfQoKZmxvYXQgZ2V0KHZlYzIgdXYsIGZsb2F0IHdpZHRoKSB7CiAgICBmbG9hdCB0ZXhhID0gdGV4dHVyZTJEKHRleDAsIHV2KS5hOwogICAgcmV0dXJuIHNtb290aHN0ZXAoMC41IC0gd2lkdGgsIDAuNSArIHdpZHRoLCB0ZXhhKTsKfQoKdm9pZCBtYWluKCkgewoKLy9iYXNpYyBzZGYKCiAgICBmbG9hdCBkaXN0ID0gdGV4dHVyZTJEKHRleDAsIHRjb29yZCkuYTsKICAgICAgICAvL2Z3aWR0aCBrZWVwcyB3aWR0aCBzaW1pbGFyIGRlc3BpdGUgc2NhbGluZywgc2VlIGJlbG93IGZvciBvcHRpb25zCiAgICBmbG9hdCBzbW9vdGhhbXQgPSBzbW9vdGhuZXNzICogZndpZHRoKGRpc3QpOwogICAgLy8gZmxvYXQgc21vb3RoYW10ID0gc21vb3RobmVzcyAqIGxlbmd0aCh2ZWMyKGRGZHgoZGlzdCksIGRGZHkoZGlzdCkpKTsKCiAgICAgICAgLy9jYWxjdWxhdGUgdGhlIGVkZ2Ugc21vb3RoaW5nCiAgICBmbG9hdCBhbHBoYSA9IGVkZ2UoMS4wIC0gdGhpY2tuZXNzLCBzbW9vdGhhbXQsIGRpc3QpOwoKLy9zdXBlciBzYW1wbGluZwoKICAgICAgICAjaWYgU1VQRVJTQU1QTEUgPT0gMQoKICAgICAgICAgICAgICAgIC8vdGhlc2UgdmFsdWVzIGNhbiBiZSBleHBvc2VkIGxhdGVyCiAgICAgICAgICAgICAgICAvL3RoZSBjdXJyZW50IGJlaW5nIDAuMjUvc3FydCgyKQogICAgICAgICAgICBmbG9hdCBmYWN0b3IgPSAwLjE3Njc3NjY5NTM7CiAgICAgICAgICAgIGZsb2F0IHNhbXBsZWFtdCA9IDAuNTsKICAgICAgICAgICAgICAgIC8vdGhpcyBpcyBhIHNpbXBsZSBib3ggZmlsdGVyIGFyb3VuZCB0aGUgcG9pbnQsCiAgICAgICAgICAgICAgICAvL3dlIHVzZSBhIHNlcGFyYXRlIHdpZHRoIGZvciBub3cKICAgICAgICAgICAgZmxvYXQgc2FtcGxldyA9IHNhbXBsZWFtdCAqIGZ3aWR0aChkaXN0KTsKICAgICAgICAgICAgdmVjMiBzYW1wbGVvZmZzZXQgPSBmYWN0b3IgKiAoZEZkeCh0Y29vcmQpICsgZEZkeSh0Y29vcmQpKTsKICAgICAgICAgICAgdmVjNCBmbHRyID0gdmVjNCh0Y29vcmQgLSBzYW1wbGVvZmZzZXQsIHRjb29yZCArIHNhbXBsZW9mZnNldCk7CgogICAgICAgICAgICBmbG9hdCB0b3RhbCA9IGdldCggZmx0ci54eSwgc2FtcGxldyApICsgZ2V0KCBmbHRyLnp3LCBzYW1wbGV3ICkgKwogICAgICAgICAgICAgICAgICAgICAgICAgIGdldCggZmx0ci54dywgc2FtcGxldyApICsgZ2V0KCBmbHRyLnp5LCBzYW1wbGV3ICk7CgogICAgICAgICAgICBhbHBoYSA9IChhbHBoYSArIDAuNSAqIHRvdGFsKSAvIDMuMDsKCiAgICAgICAgI2VuZGlmIC8vU1VQRVJTQU1QTEUKCiAgICAgICAgLy90aGUgYmFzZSBjb2xvciArIHNjYWxlZCBieSB0aGUgbmV3IGFscGhhCiAgICB2ZWM0IGZpbmFsQ29sb3IgPSB2ZWM0KGNvbG9yLnJnYiwgY29sb3IuYSAqIGFscGhhKTsKCi8vb3V0bGluZQoKICAgICNpZiBPVVRMSU5FID09IDEKCiAgICAgICAgICAgIC8vd2lwCiAgICAgICAgaWYob3V0bGluZSA+IDAuMCkgewoKICAgICAgICAgICAgLy9yYW5nZSBvZiAxLjAgfiAwLjEsIHdlIGdldCAwIH4gMQogICAgICAgICAgICBmbG9hdCBfb3V0bGluZSA9IDAuOSAtIChvdXRsaW5lICogMC45KTsKICAgICAgICAgICAgZmxvYXQgX291dGxpbmVfYSA9IGVkZ2UoX291dGxpbmUsIHNtb290aGFtdCwgZGlzdCk7CiAgICAgICAgICAgIHZlYzQgX291dGxpbmVfYyA9IHZlYzQob3V0bGluZV9jb2xvci5yZ2IsIG91dGxpbmVfY29sb3IuYSAqIF9vdXRsaW5lX2EpOwoKICAgICAgICAgICAgZmluYWxDb2xvciA9IG1peChfb3V0bGluZV9jLCBmaW5hbENvbG9yLCBhbHBoYSk7CgogICAgICAgIH0gLy9vdXRsaW5lID4gMC4wCgogICAgI2VuZGlmIC8vT1VUTElORQoKLy8gZ2xvdwoKICAgICNpZiBHTE9XID09IDEKCiAgICAgICAgICAgIC8vd2lwCiAgICAgICAgaWYoZ2xvd19hbW91bnQgPiAwLjApIHsKCiAgICAgICAgICAgIC8vOnRvZG86IGV4cG9zZSBvZmZzZXQgZm9yIGRpcmVjdGlvbmFsIHNoYWRvdwogICAgICAgICAgICAvLyB2ZWMyIF9nbG93X29mZnMgPSB2ZWMyKDAsMCk7CiAgICAgICAgICAgIC8vIGZsb2F0IF9nbG93X2Rpc3QgPSB0ZXh0dXJlMkQodGV4MCwgdGNvb3JkIC0gX2dsb3dfb2Zmc2V0KS5hOwoKICAgICAgICAgICAgZmxvYXQgX2dsb3dfYW10ID0gMS4wIC0gZ2xvd19hbW91bnQ7CiAgICAgICAgICAgIGZsb2F0IF9nbG93X2xpbWl0ID0gKF9nbG93X2FtdCAqIGdsb3dfdGhyZXNob2xkKTsKICAgICAgICAgICAgZmxvYXQgX2dsb3dfYSA9IGVkZ2UoX2dsb3dfYW10LCBfZ2xvd19saW1pdCwgZGlzdCk7CiAgICAgICAgICAgIHZlYzQgIF9nbG93X2MgPSB2ZWM0KGdsb3dfY29sb3IucmdiLCBnbG93X2NvbG9yLmEgKiBfZ2xvd19hKTsKCiAgICAgICAgICAgIGZpbmFsQ29sb3IgPSBtaXgoX2dsb3dfYywgZmluYWxDb2xvciwgZmluYWxDb2xvci5hKTsKCiAgICAgICAgfSAvL2dsb3dfYW1vdW50ID4gMAoKICAgICNlbmRpZiAvL0dMT1cKCi8vZG9uZQoKICAgIGdsX0ZyYWdDb2xvciA9IGZpbmFsQ29sb3I7CgoKfSAvL21haW4K"
    }], l.levelSize = 21e3, l.gravity = 10, l.torqueFactor = 1, l.densityFactor = 1, l.sandPitAt = 2e4, l.hurdleAt = 1e4, l.worldScale = 20, l.screenWidth = 640, l.screenHeight = 400, m.version = "dev", m.build = "+68c3387b58", p.dynamics.B2ContactListener.b2_defaultListener = new p.dynamics.B2ContactListener, v.use_zip = !0, p.collision.B2Collision.s_incidentEdge = p.collision.B2Collision.makeClipPointVector(), p.collision.B2Collision.s_clipPoints1 = p.collision.B2Collision.makeClipPointVector(), p.collision.B2Collision.s_clipPoints2 = p.collision.B2Collision.makeClipPointVector(), p.collision.B2Collision.s_edgeAO = new Array, p.collision.B2Collision.s_edgeBO = new Array, p.collision.B2Collision.s_localTangent = new p.common.math.B2Vec2, p.collision.B2Collision.s_localNormal = new p.common.math.B2Vec2, p.collision.B2Collision.s_planePoint = new p.common.math.B2Vec2, p.collision.B2Collision.s_normal = new p.common.math.B2Vec2, p.collision.B2Collision.s_tangent = new p.common.math.B2Vec2, p.collision.B2Collision.s_tangent2 = new p.common.math.B2Vec2, p.collision.B2Collision.s_v11 = new p.common.math.B2Vec2, p.collision.B2Collision.s_v12 = new p.common.math.B2Vec2, p.collision.B2Distance.b2_gjkCalls = 0, p.collision.B2Distance.b2_gjkIters = 0, p.collision.B2Distance.b2_gjkMaxIters = 0, p.collision.B2Distance.s_simplex = new p.collision.B2Simplex, p.collision.B2Distance.s_saveA = new Array, p.collision.B2Distance.s_saveB = new Array, p.collision.B2DynamicTreeNode.currentID = 0, p.collision.B2TimeOfImpact.b2_toiCalls = 0, p.collision.B2TimeOfImpact.b2_toiIters = 0, p.collision.B2TimeOfImpact.b2_toiMaxIters = 0, p.collision.B2TimeOfImpact.b2_toiRootIters = 0, p.collision.B2TimeOfImpact.b2_toiMaxRootIters = 0, p.collision.B2TimeOfImpact.s_cache = new p.collision.B2SimplexCache, p.collision.B2TimeOfImpact.s_distanceInput = new p.collision.B2DistanceInput, p.collision.B2TimeOfImpact.s_xfA = new p.common.math.B2Transform, p.collision.B2TimeOfImpact.s_xfB = new p.common.math.B2Transform, p.collision.B2TimeOfImpact.s_fcn = new p.collision.B2SeparationFunction, p.collision.B2TimeOfImpact.s_distanceOutput = new p.collision.B2DistanceOutput, p.common.B2Settings.b2_pi = Math.PI, p.common.B2Settings.b2_maxManifoldPoints = 2, p.common.B2Settings.b2_aabbExtension = .1, p.common.B2Settings.b2_aabbMultiplier = 2, p.common.B2Settings.b2_linearSlop = .005, p.common.B2Settings.b2_angularSlop = .011111111111111112 * Math.PI, p.common.B2Settings.b2_maxTOIContactsPerIsland = 32, p.common.B2Settings.b2_maxTOIJointsPerIsland = 32, p.common.B2Settings.b2_velocityThreshold = 1, p.common.B2Settings.b2_maxLinearCorrection = .2, p.common.B2Settings.b2_maxAngularCorrection = .044444444444444446 * Math.PI, p.common.B2Settings.b2_maxTranslation = 2, p.common.B2Settings.b2_maxTranslationSquared = 4, p.common.B2Settings.b2_maxRotation = .5 * Math.PI, p.common.B2Settings.b2_maxRotationSquared = .5 * Math.PI * .5 * Math.PI, p.common.B2Settings.b2_contactBaumgarte = 1, p.common.B2Settings.b2_timeToSleep = .5, p.common.B2Settings.b2_linearSleepTolerance = .01, p.common.B2Settings.b2_angularSleepTolerance = .011111111111111112 * Math.PI, p.dynamics.B2Body.s_xf1 = new p.common.math.B2Transform, p.dynamics.B2Body.e_islandFlag = 1, p.dynamics.B2Body.e_awakeFlag = 2, p.dynamics.B2Body.e_allowSleepFlag = 4, p.dynamics.B2Body.e_bulletFlag = 8, p.dynamics.B2Body.e_fixedRotationFlag = 16, p.dynamics.B2Body.e_activeFlag = 32, p.dynamics.B2Body.b2_dynamicBody = 2, p.dynamics.B2ContactFilter.b2_defaultFilter = new p.dynamics.B2ContactFilter, p.dynamics.B2Island.s_impulse = new p.dynamics.B2ContactImpulse, p.dynamics.B2World.s_timestep2 = new p.dynamics.B2TimeStep, p.dynamics.B2World.s_backupA = new p.common.math.B2Sweep, p.dynamics.B2World.s_backupB = new p.common.math.B2Sweep, p.dynamics.B2World.s_timestep = new p.dynamics.B2TimeStep, p.dynamics.B2World.s_queue = new Array, p.dynamics.B2World.e_newFixture = 1, p.dynamics.B2World.e_locked = 2, p.dynamics.contacts.B2Contact.e_sensorFlag = 1, p.dynamics.contacts.B2Contact.e_continuousFlag = 2, p.dynamics.contacts.B2Contact.e_islandFlag = 4, p.dynamics.contacts.B2Contact.e_toiFlag = 8, p.dynamics.contacts.B2Contact.e_touchingFlag = 16, p.dynamics.contacts.B2Contact.e_enabledFlag = 32, p.dynamics.contacts.B2Contact.e_filterFlag = 64, p.dynamics.contacts.B2Contact.s_input = new p.collision.B2TOIInput, p.dynamics.contacts.B2ContactSolver.s_worldManifold = new p.collision.B2WorldManifold, p.dynamics.contacts.B2ContactSolver.s_psm = new p.dynamics.contacts.B2PositionSolverManifold, p.dynamics.joints.B2PulleyJoint.b2_minPulleyLength = 2, p.dynamics.joints.B2RevoluteJoint.tImpulse = new p.common.math.B2Vec2, S.Unserializer.DEFAULT_RESOLVER = B, S.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:", S.crypto.Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", S.crypto.Base64.BYTES = S.io.Bytes.ofString(S.crypto.Base64.CHARS), S.ds.ObjectMap.count = 0, S.zip.InflateImpl.LEN_EXTRA_BITS_TBL = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, -1, -1], S.zip.InflateImpl.LEN_BASE_VAL_TBL = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], S.zip.InflateImpl.DIST_EXTRA_BITS_TBL = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, -1, -1], S.zip.InflateImpl.DIST_BASE_VAL_TBL = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], S.zip.InflateImpl.CODE_LENGTHS_POS = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], o.Tag.update = "update dt", o.Tag.renderdt = "render dt", o.Tag.game_update = "game.update", o.Tag.render = "core.render", o.Tag.updates = "core.updates", o.Debug.shut_down = !1, o.Physics.tag_physics = "physics", o.tween.actuators.SimpleActuator.actuators = new Array, o.tween.actuators.SimpleActuator.actuatorsLength = 0, o.tween.actuators.SimpleActuator.addedEvent = !1, o.tween.actuators.SimpleActuator.update_timer = 0, o.tween.actuators.SimpleActuator.current_time = 0, o.tween.Actuate.defaultActuator = o.tween.actuators.SimpleActuator, o.tween.Actuate.defaultEase = o.tween.easing.Quad.get_easeOut(), o.tween.Actuate.targetLibraries = new S.ds.ObjectMap, I.Batcher._sequence_key = -1, I.Texture.default_filter = 9729, I.Texture.default_clamp = 33071, I.geometry.Geometry._sequence_key = -1, I.geometry.TextGeometry.tab_regex = new a("	", "gim"), C.api.Promises.calls = [], C.api.Promises.defers = [], C.api.Timer.running_timers = [], C.core.web.assets.Assets.POT = !0, C.system.input.Scancodes.MASK = 1073741824, C.system.input.Scancodes.unknown = 0, C.system.input.Scancodes.key_a = 4, C.system.input.Scancodes.key_b = 5, C.system.input.Scancodes.key_c = 6, C.system.input.Scancodes.key_d = 7, C.system.input.Scancodes.key_e = 8, C.system.input.Scancodes.key_f = 9, C.system.input.Scancodes.key_g = 10, C.system.input.Scancodes.key_h = 11, C.system.input.Scancodes.key_i = 12, C.system.input.Scancodes.key_j = 13, C.system.input.Scancodes.key_k = 14, C.system.input.Scancodes.key_l = 15, C.system.input.Scancodes.key_m = 16, C.system.input.Scancodes.key_n = 17, C.system.input.Scancodes.key_o = 18, C.system.input.Scancodes.key_p = 19, C.system.input.Scancodes.key_q = 20, C.system.input.Scancodes.key_r = 21, C.system.input.Scancodes.key_s = 22, C.system.input.Scancodes.key_t = 23, C.system.input.Scancodes.key_u = 24, C.system.input.Scancodes.key_v = 25, C.system.input.Scancodes.key_w = 26, C.system.input.Scancodes.key_x = 27, C.system.input.Scancodes.key_y = 28, C.system.input.Scancodes.key_z = 29, C.system.input.Scancodes.key_1 = 30, C.system.input.Scancodes.key_2 = 31, C.system.input.Scancodes.key_3 = 32, C.system.input.Scancodes.key_4 = 33, C.system.input.Scancodes.key_5 = 34, C.system.input.Scancodes.key_6 = 35, C.system.input.Scancodes.key_7 = 36, C.system.input.Scancodes.key_8 = 37, C.system.input.Scancodes.key_9 = 38, C.system.input.Scancodes.key_0 = 39, C.system.input.Scancodes.enter = 40, C.system.input.Scancodes.escape = 41, C.system.input.Scancodes.backspace = 42, C.system.input.Scancodes.tab = 43, C.system.input.Scancodes.space = 44, C.system.input.Scancodes.equals = 46, C.system.input.Scancodes.leftbracket = 47, C.system.input.Scancodes.rightbracket = 48, C.system.input.Scancodes.backslash = 49, C.system.input.Scancodes.semicolon = 51, C.system.input.Scancodes.grave = 53, C.system.input.Scancodes.slash = 56, C.system.input.Scancodes.capslock = 57, C.system.input.Scancodes.f1 = 58, C.system.input.Scancodes.f2 = 59, C.system.input.Scancodes.f3 = 60, C.system.input.Scancodes.f4 = 61, C.system.input.Scancodes.f5 = 62, C.system.input.Scancodes.f6 = 63, C.system.input.Scancodes.f7 = 64, C.system.input.Scancodes.f8 = 65, C.system.input.Scancodes.f9 = 66, C.system.input.Scancodes.f10 = 67, C.system.input.Scancodes.f11 = 68, C.system.input.Scancodes.f12 = 69, C.system.input.Scancodes.printscreen = 70, C.system.input.Scancodes.insert = 73, C.system.input.Scancodes.home = 74, C.system.input.Scancodes.pageup = 75, C.system.input.Scancodes.end = 77, C.system.input.Scancodes.pagedown = 78, C.system.input.Scancodes.right = 79, C.system.input.Scancodes.left = 80, C.system.input.Scancodes.down = 81, C.system.input.Scancodes.up = 82, C.system.input.Scancodes.numlockclear = 83, C.system.input.Scancodes.kp_divide = 84, C.system.input.Scancodes.kp_multiply = 85, C.system.input.Scancodes.kp_minus = 86, C.system.input.Scancodes.kp_plus = 87, C.system.input.Scancodes.kp_1 = 89, C.system.input.Scancodes.kp_2 = 90, C.system.input.Scancodes.kp_3 = 91, C.system.input.Scancodes.kp_4 = 92, C.system.input.Scancodes.kp_5 = 93, C.system.input.Scancodes.kp_6 = 94, C.system.input.Scancodes.kp_7 = 95, C.system.input.Scancodes.kp_8 = 96, C.system.input.Scancodes.kp_9 = 97, C.system.input.Scancodes.kp_0 = 98, C.system.input.Scancodes.f13 = 104, C.system.input.Scancodes.f14 = 105, C.system.input.Scancodes.f15 = 106, C.system.input.Scancodes.f16 = 107, C.system.input.Scancodes.f17 = 108, C.system.input.Scancodes.f18 = 109, C.system.input.Scancodes.f19 = 110, C.system.input.Scancodes.f20 = 111, C.system.input.Scancodes.f21 = 112, C.system.input.Scancodes.f22 = 113, C.system.input.Scancodes.f23 = 114, C.system.input.Scancodes.f24 = 115, C.system.input.Scancodes.volumeup = 128, C.system.input.Scancodes.volumedown = 129, C.system.input.Scancodes.kp_decimal = 220, C.system.input.Scancodes.lctrl = 224, C.system.input.Scancodes.lshift = 225, C.system.input.Scancodes.lalt = 226, C.system.input.Scancodes.lmeta = 227, C.system.input.Scancodes.rmeta = 231, C.system.input.Scancodes.audiomute = 262, C.system.input.Keycodes.enter = 13, C.system.input.Keycodes.escape = 27, C.system.input.Keycodes.backspace = 8, C.system.input.Keycodes.tab = 9, C.system.input.Keycodes.space = 32, C.system.input.Keycodes.exclaim = 33, C.system.input.Keycodes.quotedbl = 34, C.system.input.Keycodes.hash = 35, C.system.input.Keycodes.percent = 37, C.system.input.Keycodes.dollar = 36, C.system.input.Keycodes.ampersand = 38, C.system.input.Keycodes.quote = 39, C.system.input.Keycodes.leftparen = 40, C.system.input.Keycodes.rightparen = 41, C.system.input.Keycodes.asterisk = 42, C.system.input.Keycodes.plus = 43, C.system.input.Keycodes.comma = 44, C.system.input.Keycodes.minus = 45, C.system.input.Keycodes.period = 46, C.system.input.Keycodes.slash = 47, C.system.input.Keycodes.key_0 = 48, C.system.input.Keycodes.key_1 = 49, C.system.input.Keycodes.key_2 = 50, C.system.input.Keycodes.key_3 = 51, C.system.input.Keycodes.key_4 = 52, C.system.input.Keycodes.key_5 = 53, C.system.input.Keycodes.key_6 = 54, C.system.input.Keycodes.key_7 = 55, C.system.input.Keycodes.key_8 = 56, C.system.input.Keycodes.key_9 = 57, C.system.input.Keycodes.semicolon = 59, C.system.input.Keycodes.equals = 61, C.system.input.Keycodes.leftbracket = 91, C.system.input.Keycodes.backslash = 92, C.system.input.Keycodes.rightbracket = 93, C.system.input.Keycodes.caret = 94, C.system.input.Keycodes.underscore = 95, C.system.input.Keycodes.backquote = 96, C.system.input.Keycodes.key_a = 97, C.system.input.Keycodes.key_b = 98, C.system.input.Keycodes.key_c = 99, C.system.input.Keycodes.key_d = 100, C.system.input.Keycodes.key_e = 101, C.system.input.Keycodes.key_f = 102, C.system.input.Keycodes.key_g = 103, C.system.input.Keycodes.key_h = 104, C.system.input.Keycodes.key_i = 105, C.system.input.Keycodes.key_j = 106, C.system.input.Keycodes.key_k = 107, C.system.input.Keycodes.key_l = 108, C.system.input.Keycodes.key_m = 109, C.system.input.Keycodes.key_n = 110, C.system.input.Keycodes.key_o = 111, C.system.input.Keycodes.key_p = 112, C.system.input.Keycodes.key_q = 113, C.system.input.Keycodes.key_r = 114, C.system.input.Keycodes.key_s = 115, C.system.input.Keycodes.key_t = 116, C.system.input.Keycodes.key_u = 117, C.system.input.Keycodes.key_v = 118, C.system.input.Keycodes.key_w = 119, C.system.input.Keycodes.key_x = 120, C.system.input.Keycodes.key_y = 121, C.system.input.Keycodes.key_z = 122, C.system.input.Keycodes.capslock = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.capslock), C.system.input.Keycodes.f1 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f1), C.system.input.Keycodes.f2 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f2), C.system.input.Keycodes.f3 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f3), C.system.input.Keycodes.f4 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f4), C.system.input.Keycodes.f5 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f5), C.system.input.Keycodes.f6 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f6), C.system.input.Keycodes.f7 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f7), C.system.input.Keycodes.f8 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f8), C.system.input.Keycodes.f9 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f9), C.system.input.Keycodes.f10 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f10), C.system.input.Keycodes.f11 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f11), C.system.input.Keycodes.f12 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f12), C.system.input.Keycodes.printscreen = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.printscreen), C.system.input.Keycodes.insert = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.insert), C.system.input.Keycodes.home = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.home), C.system.input.Keycodes.pageup = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.pageup), C.system.input.Keycodes["delete"] = 127, C.system.input.Keycodes.end = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.end), C.system.input.Keycodes.pagedown = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.pagedown), C.system.input.Keycodes.right = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.right), C.system.input.Keycodes.left = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.left), C.system.input.Keycodes.down = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.down), C.system.input.Keycodes.up = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.up), C.system.input.Keycodes.numlockclear = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.numlockclear), C.system.input.Keycodes.kp_divide = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_divide), C.system.input.Keycodes.kp_multiply = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_multiply), C.system.input.Keycodes.kp_minus = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_minus), C.system.input.Keycodes.kp_plus = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_plus), C.system.input.Keycodes.kp_1 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_1), C.system.input.Keycodes.kp_2 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_2), C.system.input.Keycodes.kp_3 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_3), C.system.input.Keycodes.kp_4 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_4), C.system.input.Keycodes.kp_5 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_5), C.system.input.Keycodes.kp_6 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_6), C.system.input.Keycodes.kp_7 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_7), C.system.input.Keycodes.kp_8 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_8), C.system.input.Keycodes.kp_9 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_9), C.system.input.Keycodes.kp_0 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_0), C.system.input.Keycodes.f13 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f13), C.system.input.Keycodes.f14 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f14), C.system.input.Keycodes.f15 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f15), C.system.input.Keycodes.f16 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f16), C.system.input.Keycodes.f17 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f17), C.system.input.Keycodes.f18 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f18), C.system.input.Keycodes.f19 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f19), C.system.input.Keycodes.f20 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f20), C.system.input.Keycodes.f21 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f21), C.system.input.Keycodes.f22 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f22), C.system.input.Keycodes.f23 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f23), C.system.input.Keycodes.f24 = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.f24), C.system.input.Keycodes.volumeup = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.volumeup), C.system.input.Keycodes.volumedown = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.volumedown), C.system.input.Keycodes.kp_decimal = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.kp_decimal), C.system.input.Keycodes.lctrl = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.lctrl), C.system.input.Keycodes.lshift = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.lshift), C.system.input.Keycodes.lalt = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.lalt), C.system.input.Keycodes.lmeta = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.lmeta), C.system.input.Keycodes.rmeta = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.rmeta), C.system.input.Keycodes.audiomute = C.system.input.Keycodes.from_scan(C.system.input.Scancodes.audiomute), C.core.web.input.Input._keypress_blacklist = [C.system.input.Keycodes.backspace, C.system.input.Keycodes.enter], C.system.audio.Audio.splitter = " ??????? ", u.main()
}();
