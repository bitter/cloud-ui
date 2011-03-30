define(['./AWS'], function(AWS) {
    return function() {

        var aws = {
            invoke: function(request, callback) {
                return $.ajax({
                           url: aws.createURL(request, callback),
                           success: request.success,
                           error: request.error
                       });
            },
            createURL: function(request, callback) {
                return "aws/examples/" + request.action + ".xml";
            }
        };
        aws.instance_types = AWS.INSTANCE_TYPES;
        
        return aws;
    };
});