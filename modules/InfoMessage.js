define(['./jquery-ui-support', 'text!./html/InfoMessage.html!strip'], function ($, TEMPLATE) {

    return function(title, message, ttl) {
        var jqMessage = $(TEMPLATE);
        var jqTitle = $('.title', jqMessage).text(title);
        var jqText = (typeof message == 'string')
            ? $('.message', jqMessage).text(message)
            : $('.message', jqMessage).append(message);

        var infoMessages = $('#info-messages');
        jqMessage.prependTo(infoMessages.length ? infoMessages : $('body'));
        
        setTimeout(function() {
            jqMessage.fadeOut(ttl / 2, function() {
                jqMessage.remove();
            });
        }, ttl / 2);

        return {
            close: function() {
                jqMessage.remove();
                return this;
            }
        };
    };
});