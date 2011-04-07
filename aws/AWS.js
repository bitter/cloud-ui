define(['./date-format-0.9.9', './sha256', './base64'], function() 
{
    function merge(config, defaults, depth) {
        if (config && depth)
            for (var key in defaults)
                config[key] = merge(config[key], defaults[key], depth - 1);
        return config == undefined ? defaults : config;
    }

    function sortAndEvaluate(parameters) {
        var names = [];

        // Add request parameters
        for (var name in parameters) {
            // Evaluate functions
            if (parameters[name] instanceof Function) {
                parameters[name] = parameters[name].call(AWS);
            }
            // Expand arrays
            if (parameters[name] instanceof Array) {
                for (var i in parameters[name]) {
                    parameters[name + '.' + i] = parameters[name][i];
                    names.push(name + '.' + i);
                }
                delete parameters[name];
            // Normal string value
            } else {
                names.push(name);
            }
        }
        names.sort();
        return names;
    }

    function sign(key, string) {
        var signature = hmac_sha256(key, string, true);
        var signatureString = "";
        for (var b in signature) {
            signatureString += String.fromCharCode(signature[b]);
        }
        return base64.encode(signatureString);
    }
    var AWS = function(config) {

        config = merge(config, AWS.DEFAULT_CONFIG, 2);
        var aws = {

            invoke: function(request) {
                return $.ajax({
                           url: aws.createURL(request),
                           success: request.success,
                           error: request.error
                       });
            },
            createURL: function(request) {
                request = merge(request, config, 2);
                request.params = merge(request.params, {
                                           AWSAccessKeyId: request.accessKey,
                                           Action: request.action,
                                           SignatureMethod: 'HmacSHA256',
                                           SignatureVersion: '2',
                                           Timestamp: new Date().toFormattedString("yyyy-MM-ddThh:mm:ssZ"),
                                           Version: '2011-01-01'
                                       }, 2);
                var parameterNames = sortAndEvaluate(request.params);

                var query = [];
                for (var i in parameterNames) {
                    var name = parameterNames[i];
                    query.push(name + "=" + encodeURIComponent(request.params[name]));
                }
                var queryString = query.join("&");
                var base64Signature = sign(request.secretKey, "GET\n" + request.host + "\n" + request.uri + "\n" + queryString);
                var baseUrl = request.proxyUri || request.protocol + "://" + request.host + request.uri;
                return baseUrl + "?" + queryString + "&Signature=" + encodeURIComponent(base64Signature);
            }
        };
        aws.instance_types = AWS.INSTANCE_TYPES;

        return aws;
    };

    AWS.DEFAULT_CONFIG = {
        protocol: 'https',
        host: 'ec2.amazonaws.com',
        uri: '/'
    };

    AWS.INSTANCE_TYPES = [
        { key: 't1.micro', label: "Micro" },
        { key: 'm1.small', label: "Small" },
        { key: 'm1.large', label: "Large" },
        { key: 'm1.xlarge', label: "Extra Large" },
        { key: 'c1.medium', label: "High-CPU Medium"},
        { key: 'c1.xlarge', label: "High-CPU Extra Large"},
        { key: 'm2.xlarge', label: "High-Memory Extra Large" },
        { key: 'm2.2xlarge', label: "High-Memory Double Extra Large" },
        { key: 'm2.4xlarge', label: "High-Memory Quadruple Extra Large" },
        { key: 'cc1.4xlarge', label: "Cluster Compute Quadruple Extra Large" }
    ];
    return AWS;
});