/* ==========================
 * used for demonstrate tree structure data
 * author: yang.yuan
 * date:2013.11.3
 * 
 *===========================*/

!function($) {

  	"use strict"; // jshint ;_;

    $.fn.Shutter = function(option) {
        return new Shutter(this, option);
    }

    var Shutter = function(el, option) {
    	var	self = this,
        	ul = $('<ul class="sidebar-menu"></ul>'),
            branch = '.sub-menu > a',
            node = ':not(.sub-menu) > a',
            target = option && option.target,
            data = this.data = option && option.data,
            hrefMap = option && option.hrefMap, //this method is always bound to the node key
            el = this.srcEl = $(el);

		this.cookieName = option && option.cookieName;

        el.append(ul.html(this.getUlHtml(data, hrefMap)));      
        el.on('click', branch, function() {$.proxy(self.open, this)();}); 
        el.on('click', node, function() {$.proxy(self.activate, this, self)();});
        self.gotoNode(target || '');  
    }

    Shutter.prototype = {

        getUlHtml: function(json, getHref) {
            //在严格模式在不能用arguments.callee 所以这里不能用匿名函数
            var getStr = function(data, str) {
                var str = '';
                for(var i = 0; i < data.length; i++) {
                    var item = data[i];

                    if(item.children) {
                        str += '<li class="sub-menu">';
                        str += '<a href="javascript:;" data-key="' + item.key + '"><span>' + item.title + '</span><i class="cus-chevron-right"></i></a>';
                        str += '<ul class="sub">' + getStr(item.children) + '</ul>';
                        str += '</li>'
                    }
                    else {
                        var targetUrl = getHref && getHref(item.key),
                            targetUrl = targetUrl || 'javascript:;';
                        str += '<li><a href="' + targetUrl + '" data-key="' + item.key + '">' + item.title + '</a></li>';            
                    }
                }
                return str;
            };
            return getStr(json);
        },

        open: function() {
            var subMenu = $(this).next(),
                    tagI = $('i', this),
                    li = $(this).parent(),
                    activeList = li.siblings().filter('.sub-menu.active'),
                    activeList = activeList.find('.sub-menu.active').add(activeList),
                    isShow = subMenu.is(":visible");

            if(subMenu.length === 0) return;

            activeList.removeClass('active').find('.sub').slideUp().end().find('i').removeClass('cus-chevron-down');

            isShow ? (function(){
                    subMenu.slideUp(0);
                    li.removeClass('active');
                    tagI.removeClass('cus-chevron-down');
            })() : (function(){
                    subMenu.slideDown(0);
                    li.addClass('active');
                    tagI.addClass('cus-chevron-down');
            })();
        },

        activate: function(shutter) {
            $(this).addClass('target');
            var target = $(this),
            	key = target.attr('data-key');

            setTimeout(function() {
                var o = (target.offset()),
                	diff = 200 - o.top;

	            if(diff>0)
	                shutter.srcEl.parent().scrollTo("-="+Math.abs(diff)+"px",150, {axis:'y'});
	            else 
	                shutter.srcEl.parent().scrollTo("+="+Math.abs(diff)+"px",150, {axis:'y'});  
                
            },0);
            setCookie(shutter.cookieName, key);
        },

        //search for the specific node in the tree
        getNodePath: function(data, nodeValue, path) {
            var path = path || [],
                realPath = [],
                arr = data;

            for(var i = 0; i < arr.length; i++) {
                path.push(arr[i]['key']);
                this.namePath.push([arr[i]['key'], arr[i]['title']]);

                if(parseInt(nodeValue) === arr[i]["key"]) {         
                    return path;
                }

                if(typeof arr[i]["children"] === 'object' && arr[i]["children"].length > 0) {
                    realPath = this.getNodePath(arr[i]["children"], nodeValue, path);
                    
                    if(realPath.length > 0) {
                        return realPath;
                    }
                }
                path.pop();
                this.namePath.pop();
            }
            return [];
        },

        gotoNode: function(id) {
            this.namePath = []; //this attribute contains both nodename and nodeValue, which is used for show the nodePath on the page.
            var pathArr = this.getNodePath(this.data || [], id);           

            for(var i = 0; i < pathArr.length; i++) {
                //open the brand nodes
                $.proxy(this.open, $('a[data-key=' + pathArr[i] + ']'))();

                //activate the leaf node
                if(i === pathArr.length - 1) {
                    $.proxy(this.activate, $('a[data-key=' + pathArr[i] +']'))(this);
                }            
            }
        }
    }	
}(window.jQuery)