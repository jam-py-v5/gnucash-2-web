(function($, task) {
"use strict";

function Events1() { // gnucash 

	function on_page_loaded(task) { 
		
		$("title").text(task.item_caption);
		$("#app-title").text(task.item_caption); 
	
		if (task.small_font) {
			$('html').css('font-size', '14px');
		}
		if (task.full_width) {
			$('#container').removeClass('container').addClass('container-fluid');
		}
		  
		if (task.safe_mode) {
			$("#user-info").text(task.user_info.role_name + ' ' + task.user_info.user_name);
			$('#log-out')
			.show() 
			.click(function(e) {
				e.preventDefault();
				task.logout();
			}); 
		}
	
		$('#container').show();
	
		task.create_menu($("#menu"), $("#content"), {
			splash_screen: '<h1 class="text-center">Jam.py Demo Application</h1>',
			view_first: true
		});
	
		$("#menu-right #admin a").click(function(e) {
			var admin = [location.protocol, '//', location.host, location.pathname, 'builder.html'].join('');
			e.preventDefault();
			window.open(admin, '_blank');
		});
		
		$("#menu-right #about a").click(function(e) {
			e.preventDefault();
			task.message(
				task.templates.find('.about'),
				{title: 'Jam.py framework', margin: 0, text_center: true, 
					buttons: {"OK": undefined}, center_buttons: true}
			);
		});
	
		$("#menu-right #pass a").click(function(e) {
			e.preventDefault();
			task.change_password.open({open_empty: true});
			task.change_password.append_record();
		});
	
		// $(document).ajaxStart(function() { $("html").addClass("wait"); });
		// $(document).ajaxStop(function() { $("html").removeClass("wait"); });
	} 
	
	function on_view_form_created(item) {
		var table_options_height = item.table_options.height,
			table_container;
	
		// item.paginate = false; 
		// item.table_options.show_paginator = false;
		// item.table_options.show_scrollbar = true;
		
		item.clear_filters();
		
		item.view_options.table_container_class = 'view-table';
		item.view_options.detail_container_class = 'view-detail';
		item.view_options.open_item = !item.virtual_table;
		
		if (item.view_form.hasClass('modal-form')) {
			item.view_options.width = 1060;
			item.table_options.height = $(window).height() - 300;
		}
		else {
			if (!item.table_options.height) {
				item.table_options.height = $(window).height() - $('body').height();
			}
		}
		
		if (item.can_create()) {
			item.view_form.find("#new-btn").on('click.task', function(e) {
				e.preventDefault();
				if (item.master) {
					item.append_record();
				}
				else {
					item.insert_record();
				}
			});
		}
		else {
			item.view_form.find("#new-btn").prop("disabled", true);
		}
	
		item.view_form.find("#edit-btn").on('click.task', function(e) {
			e.preventDefault();
			item.edit_record();
		});
	
		if (item.can_delete()) {
			item.view_form.find("#delete-btn").on('click.task', function(e) {
				e.preventDefault();
				item.delete_record();
			});
		}
		else {
			item.view_form.find("#delete-btn").prop("disabled", true);
		}
		
		create_print_btns(item);
	
		task.view_form_created(item);
		
		if (!item.master && item.owner.on_view_form_created) {
			item.owner.on_view_form_created(item);
		}
	
		if (item.on_view_form_created) {
			item.on_view_form_created(item);
		}
		
		item.create_view_tables();
		
		if (!item.master && item.view_options.open_item) {
			item.open(true);
		}
	
		if (!table_options_height) {
			item.table_options.height = undefined;
		}
		
		translate_btns(item.view_form.find('.form-footer'));
		return true;
	}
	
	function on_view_form_shown(item) {
		item.view_form.find('.dbtable.' + item.item_name + ' .inner-table').focus();
	}
	
	function on_view_form_closed(item) {
		if (!item.master && item.view_options.open_item) {	
			item.close();
		}
	}
	
	function on_edit_form_created(item) {
		item.edit_options.inputs_container_class = 'edit-body';
		item.edit_options.detail_container_class = 'edit-detail';
		
		item.edit_form.find("#cancel-btn").on('click.task', function(e) { item.cancel_edit(e) });
		item.edit_form.find("#ok-btn").on('click.task', function() { item.apply_record() });
		if (!item.is_new() && !item.can_modify) {
			item.edit_form.find("#ok-btn").prop("disabled", true);
		}
		
		task.edit_form_created(item);
		
		if (!item.master && item.owner.on_edit_form_created) {
			item.owner.on_edit_form_created(item);
		}
	
		if (item.on_edit_form_created) {
			item.on_edit_form_created(item);
		}
			
		item.create_inputs(item.edit_form.find('.' + item.edit_options.inputs_container_class));
		item.create_detail_views(item.edit_form.find('.' + item.edit_options.detail_container_class));
	
		translate_btns(item.edit_form.find('.form-footer'));
		return true;
	}
	
	function on_edit_form_shown(item) {
		if (item.check_field_value) {
			item.each_field( function(field) {
				var input = item.edit_form.find('input.' + field.field_name);
				input.blur( function(e) {
					var err;
					if ($(e.relatedTarget).attr('id') !== "cancel-btn") {
						err = item.check_field_value(field);
						if (err) {
							item.alert_error(err);
							input.focus();			 
						}
					}
				});
			});
		}
	}
	
	function on_edit_form_close_query(item) {
		var result = true;
		if (item.is_changing() && item.is_new()) {
			result = false;
			if (item.is_modified()) {
				item.yes_no_cancel(task.language.save_changes,
					function() {
						item.apply_record();
					},
					function() {
						item.cancel_edit();
					}
				);
			}
			else {
				item.cancel_edit(); // GH358
			}
		}
		return result;
	}
	
	function on_filter_form_created(item) {
		item.filter_options.title = item.item_caption + ' - filters';
		item.filter_form.find("#cancel-btn").on('click.task', function() {
			item.close_filter_form();
		});
		item.filter_form.find("#ok-btn").on('click.task', function() {
			item.set_order_by(item.view_options.default_order);
			item.apply_filters(item._search_params);
		});
		if (!item.master && item.owner.on_filter_form_created) {
			item.owner.on_filter_form_created(item);
		}
		if (item.on_filter_form_created) {
			item.on_filter_form_created(item);
		}
		item.create_filter_inputs(item.filter_form.find(".edit-body"));	
		translate_btns(item.filter_form.find('.form-footer'));	
		return true;
	}
	
	function on_param_form_created(item) {
		item.param_form.find("#cancel-btn").on('click.task', function() { 
			item.close_param_form();
		});
		item.param_form.find("#ok-btn").on('click.task', function() { 
			item.process_report();
		});
		if (item.owner.on_param_form_created) {
			item.owner.on_param_form_created(item);
		}
		if (item.on_param_form_created) {
			item.on_param_form_created(item);
		}
		item.create_param_inputs(item.param_form.find(".edit-body"));	
		translate_btns(item.filter_form.find('.form-footer'));
		return true;
	}
	
	function on_before_print_report(report) {
		var select;
		report.extension = 'pdf';
		if (report.param_form) {
			select = report.param_form.find('select');
			if (select && select.val()) {
				report.extension = select.val();
			}
		}
	}
	
	function on_view_form_keyup(item, event) {
		if (event.keyCode === 45 && event.ctrlKey === true){
			if (item.master) {
				item.append_record();
			}
			else {
				item.insert_record();				
			}
		}
		else if (event.keyCode === 46 && event.ctrlKey === true){
			item.delete_record(); 
		}
	}
	
	function on_edit_form_keyup(item, event) {
		if (event.keyCode === 13 && event.ctrlKey === true){
			item.edit_form.find("#ok-btn").focus(); 
			item.apply_record();
		}
	}
	
	function create_print_btns(item) {
		var i,
			$ul,
			$li,
			reports = [];
		if (item.reports) {
			for (i = 0; i < item.reports.length; i++) {
				if (item.reports[i].can_view()) {
					reports.push(item.reports[i]);
				}
			}
			if (reports.length) {
				$ul = item.view_form.find("#report-btn ul");
				for (i = 0; i < reports.length; i++) {
					$li = $('<li><a class="dropdown-item" href="#">' + reports[i].item_caption + '</a></li>');
					$li.find('a').data('report', reports[i]);
					$li.on('click', 'a', function(e) {
						e.preventDefault();
						$(this).data('report').print(false);
					});
					$ul.append($li);
				}
			}
			else {
				item.view_form.find("#report-btn").hide();
			}
		}
		else {
			item.view_form.find("#report-btn").hide();
		}
	}
	
	function translate_btns(container) {
		container.find('.btn').each(function() {
			let btn = $(this).clone();
			btn.find('i', 'small').remove()
			let text = btn.text().trim();
			text = text.split()[0].split('[')[0];
			text = text.trim();
			let translation = task.language[text.toLowerCase()];
			if (translation) {
				$(this).html($(this).html().replace(text, translation)) 
			}
		});
	}
	this.on_page_loaded = on_page_loaded;
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_view_form_closed = on_view_form_closed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_filter_form_created = on_filter_form_created;
	this.on_param_form_created = on_param_form_created;
	this.on_before_print_report = on_before_print_report;
	this.on_view_form_keyup = on_view_form_keyup;
	this.on_edit_form_keyup = on_edit_form_keyup;
	this.create_print_btns = create_print_btns;
	this.translate_btns = translate_btns;
}

task.events.events1 = new Events1();

})(jQuery, task)