define(['./jquery-ui-support', 'text!./html/ErrorDialog.html!strip'], function ($, TEMPLATE) {

    return function(title, error) {
        var jqDialog = $(TEMPLATE);
        $('.title', jqDialog).text(title);
        $('.message', jqDialog).text(error);

        jqDialog.appendTo('body').dialog(
        {
            modal: true, 
            buttons: {
		Ok: function() {
		    $(this).dialog( "close" );
		}
	    },
            close: function(event, ui) {
                $(this).remove();
            }
        });

        return {
            close: function() {
                jqDialog.dialog('close');
                return this;
            }
        };
    };
});