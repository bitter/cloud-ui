define(['./jquery-ui-support', 'text!./html/ProgressDialog.html!strip'], function ($, TEMPLATE) {       

    return function(title, abortCallback) {

        var jqDialog = $(TEMPLATE);
        var jqProgressbar = $('.progressbar', jqDialog).progressbar();
        var jqProgresstext = $('.progresstext', jqDialog);

        var autoprogress;

        jqDialog.appendTo('body').dialog(
        {
            title: title,
            modal: true, 
            buttons: {
		Abort: function() {
                    jqDialog.dialog('close');
		}
	    },
            close: function(event, ui) {
                autoprogress = false;
                if (abortCallback) {
                    abortCallback.call(this);
                }
                jqDialog.remove();
            }
        });
        
        return {
            autoprogress: function(enable, progressText) {
                if (enable) {
                    jqProgresstext.text(progressText);
                    if (!autoprogress) {
                        function tick() {
                            if (autoprogress) {
                                var value = jqProgressbar.progressbar('value');
                                jqProgressbar.progressbar('value', value + ((100 - value) / 100));
                                autoprogress = setTimeout(tick, 1000);
                            }
                        }
                        autoprogress = setTimeout(tick, 1000);
                    }

                } else {
                    autoprogress = false;
                }
                return this;
            },
            progress: function(progress, progressText) {
                jqProgresstext.text(progressText);
                jqProgressbar.progressbar('value', progress);
                return this;
            },
            close: function() {
                jqDialog.dialog('close');
                return this;
            }
        };
    };
});