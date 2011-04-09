define([
           './jquery-ui-support',
           'text!./html/RunInstancesDialog.html!strip',
           './InfoMessage',
           './ProgressDialog',
           './ErrorDialog',
           '../jquery.ui.iconResizeMultiplier'
       ], 
       function ($, TEMPLATE, InfoMessage, ProgressDialog, ErrorDialog) 
{
    return function(aws) {

        var jqRunInstances = $(TEMPLATE).appendTo('body').dialog({ modal: true, autoOpen: false, width: 600 });
        
        var instanceChooser = (function() {

            var jqInstanceBox = $('.instances').iconResizeMultiplier({
                maxSize: aws.instance_types.length,
                icon: $("<span class='instanceImage'>")
            });
            var jqInstanceType = $(".instanceTypeSlider", jqRunInstances).slider({
                orientation: "vertical",
                range: "min",
                min: 0,
                value: 1, max: aws.instance_types.length - 1,
                slide: function(_, ui) { 
                    instanceChooser.redraw(ui.value, undefined);
                } 
            });
            var jqNumberOfInstances = $(".numberOfInstancesSlider", jqRunInstances).slider({
                range: "min",
                min: 1, 
                max: 20, 
                slide: function(_, ui) { 
                    instanceChooser.redraw(undefined, ui.value);
                }
            });
         
            var instanceChooser = {
                instanceType: function() {
                    return jqInstanceType.slider('value');
                },
                numberOfInstances: function() {
                    return jqNumberOfInstances.slider('value');
                },
                redraw: function(instanceType, numberOfInstances) {

                    if (instanceType === undefined && numberOfInstances === undefined) {
                        instanceType = jqInstanceType.slider('value');
                        numberOfInstances = jqNumberOfInstances.slider('value');
                    }

                    if (instanceType !== undefined) { 
                        jqInstanceBox.iconResizeMultiplier('sizeOfIcons', instanceType + 1); 
                    } else if (numberOfInstances !== undefined) {
                        jqInstanceBox.iconResizeMultiplier('numberOfIcons', numberOfInstances); 
                    } 
                    jqInstanceBox.iconResizeMultiplier('redraw');
                    $(".instanceTypeText").text(aws.instance_types[jqInstanceBox.iconResizeMultiplier('sizeOfIcons') - 1].label + " x " + jqInstanceBox.iconResizeMultiplier('numberOfIcons'));
                }
            };

            return instanceChooser;
        })();
        jqRunInstances.dialog('option', 'open', function() { instanceChooser.redraw(); });
        jqRunInstances.dialog('option', 'resize', function() { instanceChooser.redraw(); });
        instanceChooser.redraw();

        return {
            open: function(key, callback) {
                jqRunInstances.dialog('option', 'buttons', {
                    Boot: function() {
                        var numberOfInstances = instanceChooser.numberOfInstances();
                        var instanceType = aws.instance_types[instanceChooser.instanceType()].key;
                        var awsRequest = aws.invoke({
                            action: 'RunInstances',
                            params: {
                                ImageId: key,
                                MinCount: numberOfInstances,
                                MaxCount: numberOfInstances,
                                InstanceType: instanceType
                            },
                            error: function(result) {
                                startInstanceProgress.close();
                                new ErrorDialog('Unable to start instance', $('Message', result.responseText).text());
                            },
                            success: function(result) {
                                startInstanceProgress.progress(100, 'Instance(s) started');
                                startInstanceProgress.close();
                                jqRunInstances.dialog('close');

                                var jqInstanceIds = $('instancesSet > item > instanceId', result);
                                var infoMessage = "<p>Started " + jqInstanceIds.length + " instances:<br>";
                                $('instancesSet > item > instanceId', result).each(function(_, idTag) {
                                    infoMessage += "<br><b>" + $(idTag).text() + "</b>";
                                });
                                infoMessage += "</p>";
                                new InfoMessage('Run Instance', $(infoMessage), 10000);

                                callback.call(jqRunInstances, result);
                            }
                        });
                        var startInstanceProgress = new ProgressDialog('Start instance(s)', awsRequest.abort).
                            autoprogress(true, "Starting " + numberOfInstances + " instances...");
                    }
                });
                jqRunInstances.dialog('open');
            }
        };
    };
});