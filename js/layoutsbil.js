var layoutsbil = {
    //元素
    element: {
        //左侧拖动元素
        destRows: "#destRows",
        //主容器
        bilacept: "#bilacept"
    },
    //入口
    start: undefined,
    //布局-类
    layout: undefined,
    //函数体
    func: {}
    //组件
}
/*
*返回符合布局数字
*参数=>val:必填。布局的格式数字
*/
layoutsbil.func.getLayoutNum = function (val) {
    if (arguments.length < 1) return [];
    var nots = val.replace(/\s/g, '');
    if (nots.search(/\D+/) > -1) return [];
    var vals = $.trim(val).split(/\s+/);
    for (var i = vals.length - 1; i > -1; i--) {
        if (vals[i].length < 1) {
            vals.splice(i, 1);
            continue;
        }
        var num = parseInt(vals[i]);
        if (num <= 0) {
            vals.splice(i, 1);
            continue;
        }
        if (num > 10) return [];
    }
    return vals;
}
/*
* 返回符合布局数字 - 根据div元素
* 参数=>$spans:必填。含有class名span的元素
*/
layoutsbil.func.getLayoutNumByDiv = function ($spans) {
    if (arguments.length < 1) return [];
    $spans = $($spans);
    var vals = [];
    $spans.each(function () {
        var classname = $(this).attr('class');
        var strs = classname.match(/span\d+/),
            temp = 0;
        if (strs) {
            if (strs.length > 0) {
                temp = parseInt(strs[0].replace('span',''));
            }
        }
        if (temp > 0) {
            vals.push(temp);
        }
    });
    return vals;
}
/*
*生成小型预览视图
*参数=>layoutNums:必填。布局的格式数字;$div:必填。生成元素的父容器;
*/
layoutsbil.func.createDivByLayoutNum = function (layoutNums,$acept) {
    var temp = 0,
        html ='';
    
    for (var i = 0; i < layoutNums.length; i++) {
        var num = layoutNums[i];
        html += '<div class="preview-box span' + num + '">' + num + '</div>';
    }
    var $re = $(html);
    $acept.append($re);
    return $acept;
}
/*
*生成容器实体预览视图
*参数=>layoutNums:必填。布局的格式数字;$div:必填。生成元素的父容器;
*/
layoutsbil.func.createContainerByLayoutNum = function (layoutNums, $acept) {
    var temp = 0,
        html = '<div class="accept-children"></div>';
    if (!$acept.prev().hasClass('accept-children')) {
        $(html).insertBefore($acept);
    }
    if (!$acept.next().hasClass('accept-children')) {
        $(html).insertAfter($acept);
    }
    html = '<span class="drag label"><i class="icon-move"></i>拖动</span>'
        + '<span class="drag label label-remove"><i class="icon-remove icon-white"></i>删除</span>';
    $acept.empty();
    for (var i = 0; i < layoutNums.length; i++) {
        var num = layoutNums[i];                   
        html += '<div class="span' + num + '"><div class="sbck"><div class="accept"></div></div></div>';
    }
    $acept.append(html).attr('class', 'bilbox');
    return $acept;
}
/*
*生成容器实体预览视图-方法2(父容器的Class为bilmovetemp的生成规则)
*参数=>layoutNums:必填。布局的格式数字;$div:必填。生成元素的父容器;
*/
layoutsbil.func.createContainerByLayoutNum2 = function (layoutNums, $acept) {
    var temp = 0,
        $par = $acept.parent(),
        html = '<div class="accept-children"></div>';
    if (!$par.prev().hasClass('accept-children')) {
        $(html).insertBefore($par);
    }
    if (!$par.next().hasClass('accept-children')) {
        $(html).insertAfter($par);
    }
    html = '<span class="drag label"><i class="icon-move"></i>拖动</span>'
        + '<span class="drag label label-remove"><i class="icon-remove icon-white"></i>删除</span>';
    $par.empty();
    for (var i = 0; i < layoutNums.length; i++) {
        var num = layoutNums[i];
        html += '<div class="span' + num + '"><div class="sbck"><div class="accept"></div></div></div>';
    }
    $par.append(html).attr('class', 'bilbox');
    return $par;
}


layoutsbil.start = function () {
    var lay = new layoutsbil.layout();
    return lay;
}
/*
*   布局类
*/
layoutsbil.layout = function () {
    this.$destRows = $(layoutsbil.element.destRows);
    this.$bilacept = $(layoutsbil.element.bilacept);
    this.obj = {
        event : new this.event(this)
    };
    this.start(this.obj.event);
}
//事件-(独立的类,使用时已经被实例化obj.event)
layoutsbil.layout.prototype.event = function (layout) {
    var _self = this,
        //layout对象
        layout = this.layout = layout;
        //变量放置区
    this.vars = {
        laydrag: {}
    };
    //主/子容器 悬停
    this.bilacept = function () {
        layout.$bilacept.on('mouseover', '', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType) {
                if (moveType === "container") {
                    _self.func.containerDragLeave(_self, $this);
                } else if (moveType === "layoutspan") {
                    _self.func.dragToBilaceptLeave(_self, $this);
                }
            }
        }).on('mouseenter', '.accept', function (e) {
            return;
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType === "container") {
                console.log('create');
                _self.func.containerDragEnter(_self, $this);
            } else if (moveType === "layoutspan") {
                _self.func.dragToBilaceptEnter(_self, $this);
            }
        }).on('mouseover', '.accept', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType === "container") {
                _self.func.containerDragEnter(_self, $this);
            } else if (moveType === "layoutspan") {
                _self.func.dragToBilaceptEnter(_self, $this);
            }
        }).on('mouseleave', '.accept', function (e) {
            return;
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType) {
                if (moveType === "container") {
                    _self.func.containerDragLeave(_self, $this);
                } else if (moveType === "layoutspan") {
                    _self.func.dragToBilaceptLeave(_self, $this);
                }
            }
        }).on('mouseout', '.accept', function (e) {
            return;
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType) {
                if (moveType === "container") {
                    _self.func.containerDragLeave(_self, $this);
                } else if (moveType === "layoutspan") {
                    _self.func.dragToBilaceptLeave(_self, $this);
                }
            }
        }).on('mouseenter', '.accept-children', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType) {
                if (moveType === "container") {
                    _self.func.containerDragEnter(_self, $this);
                } else if (moveType === "layoutspan") {
                    _self.func.dragToBilaceptEnter(_self, $this);
                }
            }
        }).on('mouseover', '.accept-children', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType === "container") {
                _self.func.containerDragEnter(_self, $this);
            } else if (moveType === "layoutspan") {
                _self.func.dragToBilaceptEnter(_self, $this);
            }
        }).on('mouseover', '.bilmovetemp', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType === "container") {
                _self.func.containerDragEnter(_self, $this);
            } else if (moveType === "layoutspan") {
                _self.func.dragToBilaceptEnter(_self, $this);
            }
        }).on('mouseleave', '.bilmovetemp', function (e) {
            e.stopPropagation();
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType) {
                if (moveType === "container") {
                    _self.func.containerDragLeave(_self, $this);
                } else if (moveType === "layoutspan") {
                    _self.func.dragToBilaceptLeave(_self, $this);
                }
            }
            
        }).on('mouseenter', '.bilbox', function (e) {
            e.stopPropagation();
        })/*.on('mouseover', '.billadding', function (e) {
            e.stopPropagation();
            console.log(NowMousePosition);
            var $this = $(this),
                moveType = _self.vars.laydrag.movetype;
            if (moveType === "container") {
                _self.func.containerDragEnter(_self, $this);
            } else if (moveType === "layoutspan") {
                _self.func.dragToBilaceptEnter(_self, $this);
            }
        })*/;
    }
    //左侧菜单拖动-input
    this.layinput = function () {
        layout.$destRows.on('keyup', '.bilrow.ui-draggable > .preview > input', function (e) {
            var $this = $(this),
                $par = $this.parents('.bilrow.ui-draggable'),
                $span = $par.children('.drag'),
                vals = layoutsbil.func.getLayoutNum($this.val());
            if (vals.length < 1) {
                _self.func.layinputwrong($this, $this.parent().prev());
                $par.children('.preview-wind').empty();
                //$span.hide();
                return;
            } else {
                //$span.show();
                _self.func.layinputok($this, $this.parent().prev());
                layoutsbil.func.createDivByLayoutNum(vals, $par.children('.preview-wind').empty());
            }
        });
    }
    //左侧菜单拖动-span
    this.laydrag = function () {
        layout.$destRows.on('mousedown', '.bilrow.ui-draggable > .drag', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $this = $(this);
            //全局当鼠标移动（任意时候）
            AddMouseMoveFunc("addlaydragListen_move", function () {
                _self.func.previewDivMove(_self, $this);
            });
            //全局当鼠标左键弹上时
            AddMouseUpFunc("addlaydragListen_mouseup", function () {
                _self.func.previewDivMoveEnd(_self, $this);
                removeMMRFunc("addlaydragListen_move");
                removeMURFunc("addlaydragListen_mouseup");
            });
        }).on('mouseenter', '.bilrow.ui-draggable > .drag', function () {
            var $this = $(this),
                $par = $this.parent(),
                $input = $par.children('.preview').children('input'),
                vals = layoutsbil.func.getLayoutNum($input.val());
            $input.focus();
            if (vals.length > 0) {
                layoutsbil.func.createDivByLayoutNum(vals, $par.children('.preview-wind').empty());
                $par.children('.preview-wind').addClass('show');
            } else {
                $par.children('.preview-wind').removeClass('show');
            }
        }).on('mouseleave', '.bilrow.ui-draggable > .drag', function () {
            var $this = $(this),
                $par = $this.parent();
            $par.children('.preview').children('input').blur();
            $par.children('.preview-wind').removeClass('show');
        });
     
    }
    //容器拖动
    this.containdrag = function () {
        layout.$bilacept.on('mousedown', '.bilbox > span.label:not(.label-remove)', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $this = $(this);
            //全局当鼠标移动（任意时候）
            AddMouseMoveFunc("addlaydragListen_move", function () {
                _self.func.containMove(_self, $this);
            });
            //全局当鼠标左键弹上时
            AddMouseUpFunc("addlaydragListen_mouseup", function () {
                _self.func.containEnd(_self, $this);
                removeMMRFunc("addlaydragListen_move");
                removeMURFunc("addlaydragListen_mouseup");
            });
        }).on('mousedown', '.bilbox > span.label-remove', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    //容器删除
    this.containremove = function () {
        layout.$bilacept.on('click', '.bilbox > span.label-remove', function (e) {
            e.stopPropagation();
            var $this = $(this);

            _self.func.containRemove(_self, $this);
        })
    }
    //特有函数
    this.func = {
        //布局的input含有非法内容
        layinputwrong: function ($input, $span) {
            $input.css({ 'text-decoration': 'line-through' }).addClass('wrong');
        },
        //布局的input合法内容
        layinputok: function ($input, $span) {
            $input.css({ 'text-decoration': 'inherit' }).removeClass('wrong');
        },
        //每次拖拽完成后,检查多余临时元素,如果存在进行删除
        removeTempDiv: function ($container) {
            var temps = ['.bilmovetemp'];
            for (var i = 0; i < temps.length; i++) {
                $container.children(temps[i]).each(function () {
                    $(this).remove();
                });
            }
        },
        //小型预览视图移动
        //参数=>eobj:必填。event对象;$drag:必填。被拖动的元素;
        previewDivMove: function (eobj, $drag) {
            if (eobj.vars.laydrag.move) {
                eobj.vars.laydrag.move.css({ 'left': NowMousePosition[0]+5 + 'px', 'top': NowMousePosition[1]+5 + 'px','display':'block' });
            } else {
                var $cl = $drag.parent().children('.preview-wind');
                eobj.vars.laydrag.move = $cl.clone().css("display", "none").insertAfter($('body'));
                eobj.vars.laydrag.drag = $drag;
                eobj.vars.laydrag.movetype = 'layoutspan';
                $cl.attr('class', 'preview-wind-drag')
            }
        },
        //小型预览视图移动结束
        //参数=>eobj:必填。event对象;$drag:必填。被拖动的元素;
        previewDivMoveEnd: function (eobj, $drag) {
            if (eobj.vars.laydrag.move) {
                var $cl = $drag.parent().children('.preview-wind-drag');
                $cl.attr('class', 'preview-wind');

                if (eobj.vars.laydrag.to) {
                    
                    var vals = layoutsbil.func.getLayoutNumByDiv(eobj.vars.laydrag.move.children());
                    
                    if (vals.length > 0) {
                        eobj.vars.laydrag.to.parent().hasClass('bilmovetemp') ?
                            eobj.vars.laydrag.to = layoutsbil.func.createContainerByLayoutNum2(vals, eobj.vars.laydrag.to) :
                            eobj.vars.laydrag.to = layoutsbil.func.createContainerByLayoutNum(vals, eobj.vars.laydrag.to);
                    }
                }
                
                eobj.vars.laydrag.move.remove();
                if (eobj.vars.laydrag.to) eobj.func.upDivBil(eobj.vars.laydrag.to.parents('.accept'));
            }
            eobj.vars.laydrag.move = null;
            eobj.vars.laydrag.drag = null;
            eobj.vars.laydrag.to = null;
        },
        //拖拽新布局 接受的容器enter监听
        dragToBilaceptEnter: function (eobj, $acept) {
            if (eobj.vars.laydrag.move && eobj.vars.laydrag.drag) {
                
                if (eobj.vars.laydrag.acept) {
                    if (eobj.vars.laydrag.acept[0] === $acept[0]) {
                        return;
                    }
                }
                if (eobj.vars.laydrag.to) {
                    if (eobj.vars.laydrag.to) eobj.func.upDivBil(eobj.vars.laydrag.to.parents('.accept'));
                    eobj.vars.laydrag.to.remove();
                }
                var $biladd = null;
                if ($acept.hasClass('accept-children')) {
                    $acept.attr('class', 'bilmovetemp');
                    if (!$acept.prev().hasClass('accept-childrened')) {
                        
                        $('<div class="accept-childrened"></div>').appendTo($acept);
                    } 
                    $biladd = $('<div class="biladding"></div>').appendTo($acept);
                    $('<div class="accept-childrened"></div>').appendTo($acept);
                } else {
                    $biladd = $('<div class="biladding"></div>').appendTo($acept);
                }
                eobj.vars.laydrag.to = $biladd;
                eobj.vars.laydrag.acept = $acept;
            }
        },
        //拖拽新布局 接受的容器leave监听
        dragToBilaceptLeave: function (eobj, $acept) {
            if (eobj.vars.laydrag.to) {
                              
                var $par = eobj.vars.laydrag.to.parent();
                if ($par.hasClass('bilmovetemp')) {
                    $par.empty().attr('class', 'accept-children');
                } else {
                    eobj.vars.laydrag.to.remove();
                }
                eobj.func.upDivBil($par);
                
            }
            eobj.vars.laydrag.to = null;
            eobj.vars.laydrag.acept = null;
        },
        //容器删除
        containRemove: function (eobj, $label) {
            var $bilbox = $label.parent('.bilbox'),
                $par = $bilbox.parents('.accept');
               
            $bilbox.remove();
            eobj.func.upDivBil($par);
        },

        //容器移动
        containMove: function (eobj, $label) {
            if (eobj.vars.laydrag.move) {
                eobj.vars.laydrag.move.css({ 'left': NowMousePosition[0] + 5 + 'px', 'top': NowMousePosition[1] + 5 + 'px', 'display': 'block' });
                
            } else {
                var vals = layoutsbil.func.getLayoutNumByDiv($label.siblings());
                if (vals.length > 0) {
                    var $par = $label.parent().hide();
                    //var $par = $label.parent().attr('class', 'biladdinged').empty();
                    eobj.vars.laydrag.move = layoutsbil.func.createDivByLayoutNum(vals, $('<div class="preview-wind show"></div>').insertAfter($('body')));
                    eobj.vars.laydrag.drag = $par;
                    eobj.vars.laydrag.movetype = 'container';
                    var $prev = $par.prev(),
                        $next = $par.next();
                    if (!$prev.prev().hasClass('bilbox')) {
                        $prev.hide();
                    }
                    if (!$next.next().hasClass('bilbox')) {
                        $next.hide();
                    }
                    //eobj.vars.laydrag.next = $('<div class="accept-children"></div>').insertAfter($par);
                }
            }
        },
        //容器移动结束
        containEnd: function (eobj, $label) {
            var $acc = null;
            var $prev = eobj.vars.laydrag.drag.prev(),
                    $next = eobj.vars.laydrag.drag.next();
            if (eobj.vars.laydrag.move) eobj.vars.laydrag.move.remove();
            if (eobj.vars.laydrag.acept) {
                if (eobj.vars.laydrag.acept.hasClass('bilmovetemp')) {
                    
                    if ($prev.is(":hidden")) {
                        $prev.insertAfter(eobj.vars.laydrag.acept).show();
                    } else {
                        $('<div class="accept-children"></div>').insertAfter(eobj.vars.laydrag.acept);
                    }
                    eobj.vars.laydrag.drag.show().insertAfter(eobj.vars.laydrag.acept);
                    if ($next.is(":hidden")) {
                        $next.insertAfter(eobj.vars.laydrag.acept).show();
                    } else {
                        $('<div class="accept-children"></div>').insertAfter(eobj.vars.laydrag.acept);
                    }
                    eobj.vars.laydrag.acept.remove();
                } else {
                    if (eobj.vars.laydrag.to) {

                        if ($prev.is(":hidden")) {
                            $prev.insertAfter(eobj.vars.laydrag.to).show();
                        }
                        eobj.vars.laydrag.drag.insertAfter(eobj.vars.laydrag.to).show();
                        if ($next.is(":hidden")) {
                            $next.insertAfter(eobj.vars.laydrag.to).show();
                        }
                        eobj.vars.laydrag.to.remove();
                    } else {
                        if ($prev.is(":hidden")) {
                            $prev.show();
                        }
                        eobj.vars.laydrag.drag.show();
                        if ($next.is(":hidden")) {
                            $next.show();
                        }
                    }
                }
            }
            eobj.func.upDivBil(eobj.vars.laydrag.to.parents('.accept'));
            eobj.vars.laydrag.move = null;
            eobj.vars.laydrag.drag = null;
            eobj.vars.laydrag.to = null;
            eobj.vars.laydrag.movetype = null;
            eobj.vars.laydrag.acept = null;
            
        },
        //拖拽容器 接受的容器enter监听
        containerDragEnter: function (eobj, $acept) {
            if (eobj.vars.laydrag.move && eobj.vars.laydrag.drag) {
                if (eobj.vars.laydrag.acept) {
                    
                    if (eobj.vars.laydrag.acept[0] === $acept[0]) {
                        return;
                    } else {
                        if (eobj.vars.laydrag.to) {
                            var $acpt = eobj.vars.laydrag.to.parents('.accept');
                            if (eobj.vars.laydrag.to) eobj.vars.laydrag.to.remove();
                            eobj.func.upDivBil($acpt);
                        }
                    }
                }
                var $biladd = null;
                if ($acept.hasClass('accept-children')) {
                    $acept.attr('class', 'bilmovetemp');
                    $biladd = $acept;
                    if (!$acept.prev().hasClass('accept-childrened')) {
                        $('<div class="accept-childrened"></div>').appendTo($acept);
                    } 
                    $('<div class="biladding"></div>').appendTo($acept);
                    $('<div class="accept-childrened"></div>').appendTo($acept);
                } else {
                    $biladd = $('<div class="biladding"></div>').appendTo($acept);
                }
                
                eobj.vars.laydrag.to = $biladd;
                eobj.vars.laydrag.acept = $acept;
            }
        },
        //拖拽容器 接受的容器leave监听
        containerDragLeave: function (eobj, $acept) {
            return;
            if (eobj.vars.laydrag.to) {
                if (eobj.vars.laydrag.drag) {
                    console.log(eobj.vars.laydrag.drag.html(), $acept.html())
                } else {
                    var $par = eobj.vars.laydrag.to.parent();
                    if ($par.hasClass('bilmovetemp')) {
                        $par.empty().attr('class', 'accept-children');
                    } else {
                        eobj.vars.laydrag.to.remove();
                    }
                }
            }
            eobj.vars.laydrag.to = null;
        },
        //拖拽完成之后,div调整成合理div格式
        upDivBil: function ($accept) {
            var index = 0,
                $childs = $accept.children(),
                leng = $childs.length;
            //accept容器里只能够含有bilbox和accept-children 两种元素
            $childs.each(function () {
                var $this = $(this),
                    cls = $this.attr('class');
                if (cls.indexOf('accept-children') > -1) {
                    if (index === 0) {
                        index++;
                        return;
                    }
                    if ($this.prev().hasClass('accept-children')) {
                        leng -= 1;
                        if (leng === 1) {
                            $this.prev().remove();
                        }
                        $this.remove();
                        return;
                    }
                    if (index === leng - 1) {
                        return;
                    }
                    var $prev = $this.prev();
                    if ($prev.hasClass('accept-children')) {
                        $this.remove();
                        leng -= 1;
                        return;
                    }
                } else if (cls.indexOf('bilbox') > -1) {
                    if (index === 0) {
                        $('<div class="accept-children"></div>').insertBefore($this);
                        index++;
                        return;
                    }
                    if (index === leng - 1) {
                        $('<div class="accept-children"></div>').insertAfter($this);
                        return;
                    }
                    var $prev = $this.prev();
                    if ($prev.hasClass('bilbox')) {
                        $('<div class="accept-children"></div>').insertBefore($this);
                        index++;
                        return;
                    }
                } else {
                    $this.remove();
                }
                index++;
                
            });
        }

    }
}
/*
*启动
*参数=> obj:必填。对象指针; funcs:可选。数组形式的函数字符串名称;
*/
layoutsbil.layout.prototype.start = function (obj, funcs) {
    var nucs = null;
    if (typeof funcs !== "undefined") {
        if (funcs.constructor === Array) {
            nucs = funcs;
        } else {
        }
    } 
    if (arguments.length < 1) {
        return;
    }
    if (typeof obj !== "object") {
        return;
    }
    for (var i in obj) {
        if (typeof obj[i] === "function") {
            if (nucs) {
                if (i in nucs) obj[i]();
            } else {
                obj[i]();
            } 
        }
    }
}


$(function () {
    var lay = layoutsbil.start();
});