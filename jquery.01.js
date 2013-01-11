(function($){
			//if (!document.documentElement.ontouchstart){return;}
			
			var events = "touchmove,tap,swiperight,swipeleft,swipeup,swipedown";
			
			var proto = function($e,type,fn){		
				this.$e = $e;		
				this.type = type;
				this.fn = fn;
			};
			proto.prototype = {
				swipeDistance:40,
				startX:0,
				startY:0,
				tempX:0,
				tempY:0,
				startTime:undefined,
				animation:undefined,
				
				touchmove:function(e){			
					var self = e.data;					
					e = e.originalEvent;
					if (e.targetTouches.length >= 1) {
						var touch = e.targetTouches[0];					
												
						if(self._touchmove){							
							self.fn.touchmove.call(this,{
								deltaX:touch.pageX - self.tempX,
								deltaY:touch.pageY - self.tempY,
								x:touch.pageX,
								y:touch.pageY,
								tomSource:self
							});
						}
						
						self.tempX = touch.pageX;
						self.tempY = touch.pageY;
					}
				},
				touchstart:function(e){
					var self = e.data;					
					e = e.originalEvent;
					if (e.targetTouches.length >= 1) {
						var touch = e.targetTouches[0];		
						self.tempX = self.startX = touch.pageX;
						self.tempY = self.startY = touch.pageY;						
						self.animation = undefined;
						self.startTime = +new Date;
						self.fn.touchstart && 
						self.fn.touchstart.call(this,{x:e.pageX,y:e.pageY,tomSource:self});
					}					
				},
				touchend:function(e){					
					var self = e.data;					
					e = e.originalEvent;					
					
					if (e.changedTouches.length >= 1) {
						self.animation = true;
						var touch = e.changedTouches[0]
						   ,now = +new Date()
						   ,dX = touch.pageX - self.startX
						   ,dY = touch.pageY - self.startY
						   ,AdX = Math.abs(dX)
						   ,AdY = Math.abs(dY)
						   ,timeD = now - self.startTime;
						   
						if(
							(timeD < 100 && AdX < 15 && AdY < 15 && self._tap) || 
							(dX > self.swipeDistance && AdX > AdY && self._swiperight) ||
							(-dX > self.swipeDistance && AdX > AdY && self._swipeleft) ||
							(dY > self.swipeDistance && AdY > AdX && self._swipedown)  ||
							(-dY > self.swipeDistance && AdY > AdX && self._swipeup)){							
							self.fn.call(this,{});
						}					
						
						var speedX = dX / timeD;
						var speedY = dY / timeD;
						//d(self.startY + "," + touch.pageY);
						self.fn.touchend &&
						self.fn.touchend.call(this,{
							x:touch.pageX,
							y:touch.pageY,
							speedX:speedX,
							speedY:speedY,
							tomSource:self
						});							
					}
				},
				handle:function(){
					var self = this;
					
					$.each(events.split(',')
						,function(i,item){
							if(item == self.type){
								self[ "_" + item ] = true;
							}
					});
					
					self.$e.bind("touchmove",self,self.touchmove);
					self.$e.bind("touchstart",self,self.touchstart);
					self.$e.bind("touchend",self,self.touchend);
				}
			};			
			
			$.each(events.split(","),function(i,name){
				$.fn[name] = function(fn){
					var touches = new proto($(this),name,fn);	
					touches.handle();
					return $(this);
				}				
			});			
			
			$.fn.touchScroll = function(direction){				
				var X = /x/gi.test(direction)
				   ,Y = /y/gi.test(direction)
				   ,self = this
				   ;
				
				$(this).touchmove({
					touchmove:function(ex){							
						X && $(this).scrollLeft($(this).scrollLeft() - ex.deltaX);
						Y && $(this).scrollTop($(this).scrollTop() - ex.deltaY);						
					},
					touchend:function(e){
						var $self = $(this)
						   ,timeDuration = 3000
						   ,aa = 20
						   ,speedX = e.speedX
						   ,speedY = e.speedY
						   ,source = e.tomSource
						   ;						
						//d(speedY);
						///*
						(function show(time){		
							if(!source.animation){return;}
							source.animation = window.setTimeout(function(){
								if(time > 90){ return; }								
								X && $self.scrollLeft($self.scrollLeft() - ha(time,speedX) * aa );
								Y && $self.scrollTop($self.scrollTop() - ha(time,speedY) * aa );								
								show(++time);
							},aa);
						})(1);
						
						function ha(x,maxSpeed){
							//return maxSpeed / x;//y = 100 / x;
							//return maxSpeed - maxSpeed / 100 * x;// y = -x + 100;
							return (1 - Math.sqrt(10000-(x-100)*(x-100)) / 100) * maxSpeed ;//y = -sqrt(10000-(x-100)2) + 100
						}
						
					}
				});				
				
				return $(this);
			}
			$.fn.touchScrollX = function(){$(this).touchScroll("x");};
			$.fn.touchScrollY = function(){$(this).touchScroll("y");};
		})(jQuery);	
		