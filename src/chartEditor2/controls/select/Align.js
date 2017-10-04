goog.provide('anychart.chartEditor2Module.controls.select.Align');

goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');



/**
 * @param {boolean=} opt_inverse
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.select.DataFieldSelect}
 */
anychart.chartEditor2Module.controls.select.Align = function(opt_inverse) {
  anychart.chartEditor2Module.controls.select.Align.base(this, 'constructor');

  var alignSelectMenu = this.getMenu();
  alignSelectMenu.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);

  var options = [
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'center', icon: 'ac ac-position-center'},
    {value: 'right', icon: 'ac ac-position-right'}
  ];

  for (var i = 0; i < options.length; i++) {
    this.addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption: options[i].value,
      value: options[i].value,
      icon: options[i].icon
    }));
  }

  this.inverse_ = opt_inverse;
};
goog.inherits(anychart.chartEditor2Module.controls.select.Align, anychart.chartEditor2Module.controls.select.DataFieldSelect);


/**
 * @type {string}
 * @private
 */
anychart.chartEditor2Module.controls.select.Align.prototype.orientation_ = '';


/**
 * @type {string}
 * @private
 */
anychart.chartEditor2Module.controls.select.Align.prototype.orientationKey_ = 'orientation';


/** @param {string|Array.<string>} value */
anychart.chartEditor2Module.controls.select.Align.prototype.setOrientationKey = function(value) {
  this.orientationKey_ = goog.isArray(value) ? value[0] : value;
};


/**
 * Icons of thyis select depend of value of orientation select value.
 * @param {string} orientationValue
 */
anychart.chartEditor2Module.controls.select.Align.prototype.updateIcons = function(orientationValue) {
  // console.log("Align updateIcons()");
  // this.noDispatch = true;
  // if (this.orientation_ != orientationValue) {
  //   this.orientation_ = orientationValue;
  //   if (orientationValue == 'top' || orientationValue == 'bottom') {
  //     this.setIcons(['ac ac-position-left', 'ac ac-position-center', 'ac ac-position-right']);
  //   } else if (orientationValue == 'left' && !this.inverse_) {
  //     this.setIcons(['ac ac-position-bottom', 'ac ac-position-center2', 'ac ac-position-top']);
  //   } else {
  //     this.setIcons(['ac ac-position-top', 'ac ac-position-center2', 'ac ac-position-bottom']);
  //   }
  //   this.updateOptions();
  // }
  // this.noDispatch = false;
};
