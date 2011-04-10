define(['./jquery-ui-widget-support', './jquery.pjstApply'], function($) {

     $.widget("ui.iconResizeMultiplier",
     {
         // default options
         options: {
             originalIconWidth: 128,
             originalIconHeight: 128,
             maxSize: 1,
             size: 1,
             numberOfIcons: 1,
             zIndex: this.numberOfIcons,
             zIndexer: -1
         },
         _create: function() {
             if (!this.options.icon) {
                 throw "Missing required parameter icon";
             }
             this.element.addClass("ui-icon-presenter ui-widget");
             this.options.icon.addClass("ui-icon-presenter-icon");
             this.options.icon.css('position', 'absolute');
         },
	 _destroy: function() {
	     this.element.removeClass( "ui-icon-presenter ui-widget");
	 },
         numberOfIcons: function(value) {
             if (value === undefined) {
                 return this.options.numberOfIcons;
             }
             if (value < 0) {
                 throw "Minimum number of icons must be equal or larger than zero.";
             }
             this.options.numberOfIcons = value;
             this.redraw();
             return this;
         },
         sizeOfIcons: function(value) {
             if (value === undefined) {
                 return this.options.size;
             }
             if (value < 0) {
                 throw "Minimum size of icons must be equal or larger than zero.";
             }
             if (value > this.options.maxSize) {
                 throw "Maximum size of icons must be equal or smaller than 'maxSize' (" + value + ">" + this.options.maxSize + ").";
             }
             this.options.size = value;
             this.redraw();
             return this;
         },
         redraw: function() {

             // Add or remove instances
             var self = this;
             var jqIconBox = self.element;
             var jqIcons = $(".ui-icon-presenter-icon", jqIconBox), currentNumberOfIcons = jqIcons.length;
             for (; currentNumberOfIcons < self.options.numberOfIcons; currentNumberOfIcons++) {
                 jqIconBox.append(self.options.icon.clone());
             }
             for (; currentNumberOfIcons > self.options.numberOfIcons; currentNumberOfIcons--) {
                 $(".ui-icon-presenter-icon", jqIconBox).last().remove();
             }
             
             // Calculate instance images size and positions
             var jqIconBoxMinSize = Math.min(jqIconBox.height(), jqIconBox.width());
             var iconWidth = jqIconBoxMinSize / self.options.maxSize * self.options.size;
             var iconHeight = jqIconBoxMinSize / self.options.maxSize * self.options.size;
                    
             var maxIconHeight = (jqIconBox.height() - iconHeight), iconOffsetY = -maxIconHeight / 2;
             var maxIconWidth = (jqIconBox.width() - iconWidth) / self.options.numberOfIcons, iconOffsetX = maxIconWidth / 2;
             $(".ui-icon-presenter-icon", jqIconBox).each(function(index, icon)
             {
                 var adjustmentX = maxIconWidth * index + iconOffsetX + jqIconBox.position().left;
                 var adjustmentY = maxIconHeight * 1 + iconOffsetY + jqIconBox.position().top;
                 $(icon).css({
                                 left: adjustmentX + "px",
                                 top: adjustmentY + "px",
                                 width: iconWidth,
                                 height: iconWidth,
                                 'z-index': self.options.zIndex + index * self.options.zIndexer
                             });
             });
             return this;
         }
     });
});
