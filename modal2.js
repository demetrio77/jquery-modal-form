function dkmodal()
{
	var self = this;
	this.id = '';
	this.div = undefined;
	this.title = '';
	this.body = undefined;
	this.footer = undefined;
	this.buttons = [];
	
	this.init = function() {
		var id = Math.round(Math.random()*100000);
		do {
			this.id = 'modal'+id;
			id++;
		}
		while($('#'+this.id).length>0);
		
		$('body').append('<div id="'+this.id+'"></div>');
		this.div = $('#'+this.id);
		this.div.addClass('modal')
				.addClass('fade')
				.attr('role','dialog')
				.attr('aria-labelledby','myLargeModalLabel')
				.attr('aria-hidden',true)
				.html('<div class="modal-dialog"><div class="modal-content"><div class="modal-header">'+
			       		'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">'+
			       		'</h4></div><div class="modal-body"></div><div class="modal-footer"></div></div></div>');
		
		this.div.on('hidden.bs.modal', function (e) {
			self.div.remove();
			delete self;
		});
		this.title  = $('.modal-title', this.div);
		this.body   = $('.modal-body' , this.div);
		this.footer = $('.modal-footer', this.div);		
	}
	
	this.init();
	
	this.close = function() {
		this.div.modal('hide');
	};
	
	this.open = function() {
		console.log( $('#'+this.id).attr('id') );
		this.div.modal('show');
	};
	

	function buttons(buttons)
	{
		this.items = [];
		
		this.add = function(elem) {
			var button = {
				type: 'submit',
				caption: '',
				hidden: false,
				saveUrl: '',
				action: function(){},
				beforeSave: function(){return true;},
				afterSave: function(){},
				target: undefined,
				loading: false,
				id:''
			};
			$.extend(button, elem);
			
			switch (button.type) {
				case 'dismiss':
					self.footer.append('<button '+(button.id ? 'data-button-id="'+button.id+'"' : '')+'type="button" class="btn btn-default" data-dismiss="modal">'+button.caption+'</button>');
				break;
			
				case 'function':
					var b = new $('<button>');
					$(b).attr('type','button').addClass('btn').addClass('btn-primary').text(button.caption);
					if (button.id) {
						$(b).data('button-id', button.id);
					}
					if (button.hidden!=undefined && button.hidden) {
						$(b).css('display','none');
					}
					var action = button.action;
					$(b).click(function(){
						if (button.beforeSave()) {
							action();
							button.afterSave();
							self.close();
						}
					});
					self.footer.append(b);
				break;
				
				case 'submit':
				default:
					var b = new $('<button>');
					$(b).attr('type','button').addClass('btn').addClass('btn-primary').text(button.caption);
					if (button.loading!==false) {
						$(b).attr('data-loading-text', button.loading);
					}
					if (button.id) {
						$(b).data('button-id', button.id);
					}
					if (button.hidden!=undefined && button.hidden) {
						$(b).css('display','none');
					}
					$(b).click(function(){
						$('.errorMessage', $this).hide();
						$('.errorSummary', $this).hide();
						if (button.beforeSave()) {
							var btn = $(this);
							if (button.loading!==false) {
							    btn.button('loading');
							}
							$.ajax({
								data: $('form', self.body ).serialize(),
								dataType:'json',
								type:'POST',
								url: button.saveUrl,
								success: function(h) {
									switch(h.status) {
										//все хорошо, все сделано, больше ничего не надо, закрываем окно
										case 'success' : button.afterSave();  self.close(); break;
										//форма не прошла валидацию, она пришла в поле html
										case 'validate': 
											self.body.html(h.html); 
											button.afterValidate();
										break;
										//обновим страницу
										case 'refresh': location.reload(); break;
										//перейдем по ссылке в href
										case 'redirect': location.href = h.href; break;
										//обновим страницу, код в html, что обновляем в target ответа, или в target buttona
										case 'update': $(button.target?button.target:h.target).html(h.html); button.afterSave(); self.close(); break;
									}
								}
							}).always(function () {
								btn.button('reset');
						    });
						}
					});
					self.footer.append(b);
				break;
			}
			this.items[elem.id] = elem;
		};
		
		this.remove = function(id) {
			var button = $('button[data-button-id="'+id+'"]');
			if (button) {
				delete this.items[id];
				button.remove();
			}
		};
		this.hide = function(id){
			var button = $('button[data-button-id="'+id+'"]');
			if (button) {
				button.css('display', 'none');
				this.items[id].hidden = true;
			}
		};
		this.show = function(id){
			var button = $('button[data-button-id="'+id+'"]');
			if (button) {
				button.css('display', 'inline-block');
				this.items[id].hidden = false;
			}
		};
		
		self.footer.html('');
		for (i in buttons) {
			this.add(buttons[i]);
		}
	};
	
	this.form = function(options) {
		var settings = {
			title : '',
			url   : '',
			buttons    : {},
			afterLoad  : function() {}
		};
		
		if (options) {
			$.extend(settings, options);
		}
		
		this.body.load(
			settings.url, function(){
				self.title.text(settings.title);
				self.buttons = new buttons(settings.buttons);
				settings.afterLoad();
				self.open();
			}
		);
	}
	
	this.message = function(options){
		
	}
}