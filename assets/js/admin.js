;(function() {

	jQuery( function( $ ) {

		setTimeout(function () {
			
			jQuery( document ).on( 'click', '#patreon-image-lock-icon', function( e ) {
				
				var attachment_id = jQuery(this).attr('pw_attachment_id');

				var image_lock_icon = jQuery( document ).find( '#patreon-image-toolbar' );
				pos_x = jQuery( image_lock_icon ).attr('place_modal_x');
				pos_y = jQuery( image_lock_icon ).attr('place_modal_y');
				pw_image_source = jQuery( image_lock_icon ).attr('pw_image_source');
				
				jQuery.ajax( ajaxurl, {
					type: "POST",
					dataType : 'html',
					data: {
						action: "patreon_make_attachment_pledge_editor",
						patreon_attachment_id: attachment_id,
						pw_image_source: pw_image_source,
					},
					beforeSend: function(e) {
					},
					success: function(response) {
						
						if ( jQuery( document ).find( '#patreon_image_lock_modal' ).length ) {
							// Remove modal if it exists
							jQuery( document ).find( '#patreon_image_lock_modal' ).remove();				
						}
						
						modal = '<div id="patreon_image_lock_modal" class="patreon_image_lock_modal">' + response + '</div>';
						
						// Add the fresh
						jQuery( modal ).appendTo("body");
						
						var image_locker = jQuery( document ).find( '#patreon_image_lock_modal' );
						
						// if not tinymce and gutenberg editor is here
						
						if( jQuery( document ).find( '#editor' ).length ) {
											
							pos_x = pos_x - ( image_locker.width() /2 );
							pos_y = pos_y - ( image_locker.height() /2 );
							
							image_locker.css({
								display : 'block',
								top: pos_y + "px",
								left: pos_x + "px"
							});
							
						}
						if( typeof tinymce !== 'undefined' && jQuery( document ).find( '#editor' ).length == 0 ) {
							// Tinymce, not gutenberg
							// Place at the center of the screen with scroll
							
							pos_x = ( jQuery(window).width() / 2 ) - ( image_locker.width() /2 );
							pos_y = ( jQuery(window).height() / 2 ) - ( image_locker.height() /2 ) + jQuery(window).scrollTop();
									
							image_locker.css({
								display : 'block',
								top: pos_y + "px",
								left: pos_x + "px"
							});
							
						}	
						
					},
				});			
				
			})
		}, 1000 );
		
		// Centers image lock interface modal on window resize
		jQuery( window ).resize(function() {
			
			if ( jQuery( document ).find( '#patreon_image_lock_modal' ).length ) {

				pos_x = ( jQuery(window).width() / 2 ) - ( image_locker.width() /2 );
				pos_y = ( jQuery(window).height() / 2 ) - ( image_locker.height() /2 ) + jQuery(window).scrollTop();
						
				image_locker.css({
					top: pos_y + "px",
					left: pos_x + "px"
				});
		
			}
			
		});
		
		jQuery( document ).on( 'submit', '#patreon_attachment_patreon_level_form', function( e ) {
			e.preventDefault();
			jQuery.ajax({
				url: ajaxurl,
				data: jQuery( '#patreon_attachment_patreon_level_form' ).serialize(),
				dataType: 'html',
				type: 'post',
				beforeSend: function(e) {
					jQuery( document ).find( '#patreon_image_locking_interface_message' ).html('Updating...');
				},
				success: function( response ) {
					jQuery( document ).find( '#patreon_image_lock_modal' ).html(response);
				}
			});	
		});
		
	// Hook to image click events for classic editor below

	setTimeout( function () {
		
		if( typeof tinymce === 'undefined' || jQuery( document ).find( '#editor' ).length) {
			return;
		}
		for ( var i = 0; i < tinymce.editors.length; i++ ) {
			
			tinymce.editors[i].on( 'click', function ( e ) {
				
				if( e.target.nodeName == 'IMG' ) {
					var $ = tinymce.dom.DomQuery;
					var tinymce_iframe_offset = jQuery( '#content_ifr' ).offset();
					var clicked_image_inside_frame_offset = $( e.target ).offset();
					
					// Add a special attribute to easily find the item because tinymce's domquery doesnt have functions to get width of the relevant element - we have to get it from jquery from outside the iframe. 
					
					$( e.target ).attr( 'data-patreon-selected-image', '1' );
					
					// Get the clicked image inside iframe
					var clicked_image = jQuery( '#content_ifr' ).contents().find( '[data-patreon-selected-image="1"]' );
					var pw_image_source = clicked_image.attr('src');
					var clicked_image_width = clicked_image.width();
					
					// Remove the added attribute
					$( e.target ).removeAttr( 'data-patreon-selected-image' );
					
					// if done out of this context of tinymce, the placement goes haywire so this code to show the lock icon is repeated here
					
					jQuery( '<div id="patreon-image-toolbar"><div id="patreon-image-lock-icon"><img src="' + pw_admin_js.patreon_wordpress_assets_url + '/img/patreon-image-lock-icon.png" /></div></div>' ).appendTo("body");
					
					jQuery( '#patreon-image-lock-icon' ).css({
						border: '1px solid #c0c0c0'
					});
				
					jQuery( '#patreon-image-toolbar' ).css({
							position : 'absolute',
							top: tinymce_iframe_offset.top + clicked_image_inside_frame_offset.top + 20 + "px",
							left: tinymce_iframe_offset.left + clicked_image_inside_frame_offset.left + clicked_image_width + 10 + "px"
					}).show();
					
					
					jQuery( document ).find(  '#patreon-image-toolbar' ).attr('place_modal_x', tinymce_iframe_offset.top + clicked_image_inside_frame_offset.top );
					jQuery( document ).find(  '#patreon-image-toolbar' ).attr('place_modal_y', tinymce_iframe_offset.left + clicked_image_inside_frame_offset.left + clicked_image_width + 10);
					jQuery( document ).find(  '#patreon-image-toolbar' ).attr('pw_image_source', pw_image_source);
					jQuery( document ).find(  '#patreon-image-toolbar' ).show();	
					
				}
				else {
					// Need this here again despite the global hook to cover for tinymce cases - tinymce still keeps context on image if text inside an editor window which also has an image is clicked
					if( jQuery( document ).find( '#patreon-image-toolbar' ).length ) {
						jQuery( document ).find( '#patreon-image-toolbar' ).hide();
					}
				}
					
			});
		}
	}, 1000);


	jQuery(document).ready(function(){
		
		// Gutenberg variant - interim solution
		// Need to bind to event after tinymce is initialized - so we hook to all tinymce instances after a timeout
		
		jQuery(document).on( 'click', '#editor img', function(e) {
			
			pw_launch_image_lock_toolbar( jQuery(this),e.pageX,e.pageY );
			
		});
		
		jQuery(document).on( 'click', function(e) {
			
			if ( jQuery( e.target ).is('img') ) {
				// Potential future use
			}
			else {
				if( jQuery( document ).find( '#patreon-image-toolbar' ).length ) {
					jQuery( document ).find( '#patreon-image-toolbar' ).hide();
				}
			}
			
		});

	});

	function pw_launch_image_lock_toolbar(image_var, pos_x, pos_y) {
		
		var image = jQuery(image_var);
		var clicked_image_inside_frame_offset = image.offset();
		var clicked_image_inside_frame_pos = image.position();
		var clicked_image_width = image.width();
		var clicked_image_height = image.height();
								
		// Remove the added attribute
		
		jQuery( '<div id="patreon-image-toolbar"><div id="patreon-image-lock-icon"><img src="' + pw_admin_js.patreon_wordpress_assets_url + '/img/patreon-image-lock-icon.png" /></div></div>' ).appendTo("body");
		
		jQuery( '#patreon-image-toolbar' ).css({
				position : 'absolute',
				top: pos_y + "px",
				left: pos_x + "px",
		});
		
		jQuery( '#patreon-image-lock-icon' ).css({
			border: '1px solid #c0c0c0'
		});
		
		jQuery( document ).find(  '#patreon-image-toolbar' ).attr('place_modal_x', clicked_image_inside_frame_pos.left + clicked_image_inside_frame_offset.left + ( clicked_image_width / 2 )  );
		jQuery( document ).find(  '#patreon-image-toolbar' ).attr('place_modal_y', clicked_image_inside_frame_offset.top);
		jQuery( document ).find(  '#patreon-image-toolbar' ).attr('pw_image_source', image.attr('src'));
		jQuery( document ).find(  '#patreon-image-toolbar' ).show();	

	}


		jQuery(document).on( 'click', '.patreon_image_lock_modal_close', function(e) {
			e.preventDefault();
			jQuery( document ).find( '#patreon_image_lock_modal' ).hide();
			jQuery( document ).find( '#patreon-image-toolbar' ).hide();
		});	
		
		jQuery(document).on( 'click', '.patreon-wordpress .notice-dismiss', function(e) {

			jQuery.ajax({
				url: ajaxurl,
				type:"POST",
				dataType : 'html',
				data: {
					action: 'patreon_wordpress_dismiss_admin_notice',
					notice_id: jQuery( this ).parent().attr( "id" ),
				}
			});
		});	
		
		// Doing the below via jQuery because we have to submit some POST info inside another form. Avoided using a link inside button to account for older devices
		
		jQuery(document).on( 'click', '#patreon_wordpress_disconnect_from_patreon', function(e) {
			e.preventDefault();
			var target = jQuery(this).attr( 'target' );
			window.location.replace( target );
		});
		
		// Doing the below via jQuery because we have to submit some POST info inside another form. Avoided using a link inside button to account for older devices
		
		jQuery(document).on( 'click', '#patreon_wordpress_reconnect_to_patreon', function(e) {
			e.preventDefault();
			var target = jQuery(this).attr( 'target' );
			window.location.replace( target );
		});
		
		jQuery(document).on( 'click', '.patreon-wordpress-admin-toggle', function(e) {
			
			e.preventDefault();
			
			var toggle_id = jQuery( this ).attr( 'toggle' );
			var toggle_target = document.getElementById( toggle_id );

			jQuery( toggle_target ).slideToggle();
			
			if( jQuery( this ).attr( 'togglestatus' ) == 'off' ) {
				
				jQuery( this ).html( jQuery( this ).attr( 'ontext' ) );
				jQuery( this ).attr( 'togglestatus', 'on' );
				
			}
			else if( jQuery( this ).attr( 'togglestatus' ) == 'on' ) {
				
				jQuery( this ).html( jQuery( this ).attr( 'offtext' ) );
				jQuery( this ).attr( 'togglestatus', 'off' );
				
			}
					
			jQuery.ajax({
				url: ajaxurl,
				type:"POST",
				dataType : 'html',
				data: {
					action: 'patreon_wordpress_toggle_option',
					toggle_id: toggle_id,
				}
			});		
			
		});
		
		jQuery(document).on( 'click', '#patreon_wordpress_start_post_import', function(e) {
			
			e.preventDefault();
			var pw_input_target = jQuery( this ).attr( 'pw_input_target' );
			
			jQuery.ajax({
				url: ajaxurl,
				type:"POST",
				dataType : 'html',
				data: {
					action: 'patreon_wordpress_start_post_import',
				},
				success: function( response ) {
					jQuery( '#patreon_wp_post_import_status' ).empty();
					jQuery( '#patreon_wp_post_import_status' ).html( 'Started a post import' );
					jQuery( '#patreon_wp_post_import_status' ).css( 'color', '#129500' );
					
				},
			});		
			
		});
		
		jQuery(document).on( 'click', '.patreon_wordpress_interface_toggle', function(e) {
			
			e.preventDefault();
			
			var toggles = jQuery( this ).attr( 'toggle' );
			var toggle_array = toggles.split(" ");
			toggle_array.forEach( function( toggle_id, index, toggle_array ) {
				var toggle_target = document.getElementById( toggle_id );

				jQuery( toggle_target ).slideToggle();
								
			}, jQuery( this ) );
			
		});	
		
		// Sync the exact amount value to select value if select is changed
		jQuery( "#patreon_level_select" ).on( 'change', function() {
			jQuery( "#patreon-level-exact" ).val( this.value );
		});
		
		jQuery( ".patreon_toggle_admin_sections" ).on( 'click', function (e) {
			
			if ( jQuery( e.target ).hasClass( 'patreon_setting_section_help_icon' ) ) { 
				return 
			};
			
			jQuery( '#footer-thankyou' ).remove();
			var patreon_target = jQuery( this ).parent('.patreon_admin_health_content_box').find( jQuery( this ).attr( 'target' ) );
			e.preventDefault();
			if ( jQuery( this ).find( 'span:first' ).hasClass( 'dashicons-arrow-down-alt2' ) ) {
				jQuery( this ).find( 'span:first' ).removeClass( 'dashicons-arrow-down-alt2' );
				jQuery( this ).find( 'span:first' ).addClass( 'dashicons-arrow-up-alt2' );
			}
			else if ( jQuery( this ).find( 'span:first' ).hasClass( 'dashicons-arrow-up-alt2' ) ) {
				jQuery( this ).find( 'span:first' ).removeClass( 'dashicons-arrow-up-alt2' );
				jQuery( this ).find( 'span:first' ).addClass( 'dashicons-arrow-down-alt2' );
			}
			jQuery( patreon_target ).toggle( 'slow' );
		});
		
		jQuery( '#patreon_copy_health_check_output' ).on( 'click', function (e) {
			e.preventDefault();
			// Some of below is from stack https://stackoverflow.com/questions/23048550/how-to-copy-a-divs-content-to-clipboard-without-flash
			var textarea = document.createElement( 'textarea' );
			  textarea.id = 'patreon_temp_element'
			  // Optional step to make less noise on the page, if any!
			  textarea.style.height = 0
			  // Now append it to your page somewhere, I chose <body>
			  document.body.appendChild( textarea )
			  // Give our textarea a value of whatever inside the div of id=containerid
			  textarea.value = jQuery( '#patreon_health_check_output_for_support' ).text();
			  // Now copy whatever inside the textarea to clipboard
			  var selector = document.querySelector( '#patreon_temp_element' );
			  selector.select();
			  document.execCommand('copy');
			  // Remove the textarea
			  document.body.removeChild(textarea);
			jQuery( "#patreon_copied" ).text( "Copied!" ).show().fadeOut( 1000 );
		});

		// Only trigger if the select dropdown is actually present
		
		jQuery(document).on( 'click', '#patreon_level_refresh', function(e) {
			
			var pw_input_target = jQuery( "#patreon_level_select" );
			var pw_post_id = pw_input_target.attr( 'pw_post_id' );
			
			jQuery.ajax({
				url: ajaxurl,
				async: true, // Just to make sure
				type:"POST",
				dataType : 'html',
				data: {
					action: 'patreon_wordpress_populate_patreon_level_select',
					pw_post_id: pw_post_id,
				},
				beforeSend: function( e ) {
					jQuery( pw_input_target ).html( '<option value="">Loading...</option>' );				
				},
				success: function( response ) {
					jQuery( pw_input_target ).empty();
					jQuery( pw_input_target ).html( response );
					
				},
				error: function( response ) {
					jQuery( pw_input_target ).empty();
					jQuery( pw_input_target ).html( response );
				},
				statusCode: {
					500: function(error) {
						jQuery( pw_input_target ).empty();
						jQuery( pw_input_target ).html( 'Sorry - error (500)' );
					}
				}
			});	
			
		});
		
		jQuery.fn.pw_screen_center = function () {
			this.css( "position", "absolute" );
			this.css( "top", Math.max(0, ((jQuery(window).height() - $(this).outerHeight()) / 2) + jQuery(window).scrollTop()) + "px");
			this.css( "left", Math.max(0, ((jQuery(window).width() - $(this).outerWidth()) / 2) + jQuery(window).scrollLeft()) + "px");
			return this;
		}	
		
	});
	
})()