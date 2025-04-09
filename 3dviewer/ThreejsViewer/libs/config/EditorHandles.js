'use strict';
define(['brease'], function ({ core: { Class } }) {

    var ModuleClass = Class.extend(function EditorHandles(widget) {
            Class.call(this);
            this.widget = widget;
        }, null),

        p = ModuleClass.prototype;

    p.getHandles = function () {

        var self = this;
        return {
            pointHandles: [],
            resizeHandles: [{
                start: function () {
                },
                update: function (newBox) {
                    self.widget.settings.height = newBox.height;
                    self.widget.settings.width = newBox.width;
                    self.widget.settings.top = newBox.top;
                    self.widget.settings.left = newBox.left;
                    self.widget.el.css('height', self.widget.settings.height);
                    self.widget.el.css('width', self.widget.settings.width);
                    self.widget.el.css('top', self.widget.settings.top);
                    self.widget.el.css('left', self.widget.settings.left);
                    self.widget._setHeight(self.widget.settings.height);
                    self.widget._setWidth(self.widget.settings.width);
                    self.widget._onWindowResize();
                },
                finish: function () {
                    var returnBox = {
                        height: self.widget.settings.height,
                        width: self.widget.settings.width,
                        top: self.widget.settings.top,
                        left: self.widget.settings.left
                    };
                    return returnBox;
                },
                handle: function () {
                    return self.widget.elem;
                }
            }]
        };
    };

    p.getSelectionDecoratables = function () {
        return [this.widget.elem];
    };

    return ModuleClass;

});
