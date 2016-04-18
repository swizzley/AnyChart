goog.provide('anychart.themes.wines');


/**
 * @this {*}
 * @return {*}
 */
var returnDarkenSourceColor = function() {
  return window['anychart']['color']['darken'](this['sourceColor']);
};


/**
 * @this {*}
 * @return {*}
 */
var returnLightenSourceColor = function() {
  return window['anychart']['color']['lighten'](this['sourceColor']);
};


window['anychart'] = window['anychart'] || {};
window['anychart']['themes'] = window['anychart']['themes'] || {};
window['anychart']['themes']['wines'] = {
  'palette': {
    'type': 'distinct',
    'items': ['#6f3448', '#857600', '#f1a122', '#a50b01', '#400001', '#a98b80', '#c08081', '#86614e', '#c26364', '#615060']
  },
  'ordinalColor': {
    'autoColors': function(rangesCount) {
      return window['anychart']['color']['blendedHueProgression']('#f1a122', '#a50b01', rangesCount);
    }
  },
  'defaultFontSettings': {
    'fontColor': '#3e2723'
  },
  'defaultBackground': {
    'fill': {
      'src': 'https://cdn.anychart.com/images/themes/brickwall.png',
      'mode': 'tile'
    },
    'stroke': '#e3e3e3',
    'cornerType': 'round',
    'corners': 3
  },
  'defaultSeparator': {
    'fill': '#CECECE'
  },
  'defaultTooltip': {
    'background': {
      'fill': '#e3e3e3',
      'stroke': '#d4d4d4'
    },
    'padding': {'top': 8, 'right': 15, 'bottom': 10, 'left': 15}
  },
  'defaultColorRange': {
    'stroke': '#bdbdbd',
    'ticks': {
      'stroke': '#bdbdbd', 'position': 'outside', 'length': 7, 'enabled': true
    },
    'minorTicks': {
      'stroke': '#bdbdbd', 'position': 'outside', 'length': 5, 'enabled': true
    },
    'marker': {
      'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
      'fill': '#37474f',
      'hoverFill': '#37474f'
    }
  },
  'defaultScroller': {
    'fill': '#e3e3e3',
    'selectedFill': '#d0d0d0',
    'thumbs': {
      'fill': '#F9FAFB',
      'stroke': '#bdc8ce',
      'hoverFill': '#bdc8ce',
      'hoverStroke': '#e9e4e4'
    }
  },
  'chart': {
    'padding': {'top': 20, 'right': 25, 'bottom': 10, 'left': 15}
  },
  'cartesianBase': {
    'defaultSeriesSettings': {
      'candlestick': {
        'risingFill': '#6f3448',
        'risingStroke': '#6f3448',
        'hoverRisingFill': returnLightenSourceColor,
        'hoverRisingStroke': returnDarkenSourceColor,
        'fallingFill': '#f1a122',
        'fallingStroke': '#f1a122',
        'hoverFallingFill': returnLightenSourceColor,
        'hoverFallingStroke': returnDarkenSourceColor,
        'selectRisingStroke': '3 #6f3448',
        'selectFallingStroke': '3 #f1a122',
        'selectRisingFill': '#333333 0.85',
        'selectFallingFill': '#333333 0.85'
      },
      'ohlc': {
        'risingStroke': '#6f3448',
        'hoverRisingStroke': returnDarkenSourceColor,
        'fallingStroke': '#f1a122',
        'hoverFallingStroke': returnDarkenSourceColor,
        'selectRisingStroke': '3 #6f3448',
        'selectFallingStroke': '3 #f1a122'
      }
    }
  },
  'map': {
    'unboundRegions': {'enabled': true, 'fill': '#e3e3e3', 'stroke': '#bdbdbd'},
    'linearColor': {'colors': ['#f1a122', '#a50b01']},
    'defaultSeriesSettings': {
      'base': {
        'stroke': '#eceff1',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'connector': {
        'stroke': '1.5 #6f3448',
        'hoverStroke': '1.5 #37474f',
        'selectStroke': '1.5 #000',
        'markers': {
          'stroke': '1.5 #e3e3e3',
          'fill': '#857600'
        },
        'hoverMarkers': {
          'fill': '#857600'
        }
      }
    }
  },
  'sparkline': {
    'padding': 0,
    'background': {'stroke': '#e3e3e3'},
    'defaultSeriesSettings': {
      'area': {
        'stroke': '1.5 #6f3448',
        'fill': '#6f3448 0.5'
      },
      'column': {
        'fill': '#6f3448',
        'negativeFill': '#f1a122'
      },
      'line': {
        'stroke': '1.5 #6f3448'
      },
      'winLoss': {
        'fill': '#6f3448',
        'negativeFill': '#f1a122'
      }
    }
  },
  'bullet': {
    'background': {'stroke': '#e3e3e3'},
    'defaultMarkerSettings': {
      'fill': '#6f3448',
      'stroke': '2 #6f3448'
    },
    'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
    'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
    'rangePalette': {
      'items': ['#868686', '#969696', '#A6A6A6', '#BCBCBC', '#D2D2D2']
    }
  },
  'heatMap': {
    'stroke': '1 #e3e3e3',
    'hoverStroke': '1.5 #e3e3e3',
    'selectStroke': '2 #e3e3e3',
    'labels': {
      'fontColor': '#212121'
    }
  },
  'treeMap': {
    'headers': {
      'background': {
        'enabled': true,
        'fill': '#e3e3e3',
        'stroke': '#bdbdbd'
      }
    },
    'hoverHeaders': {
      'fontColor': '#3e2723',
      'background': {
        'fill': '#bdbdbd'
      }
    },
    'labels': {
      'fontColor': '#212121'
    },
    'selectLabels': {
      'fontColor': '#fafafa'
    },
    'stroke': '#bdbdbd',
    'selectStroke': '2 #eceff1'
  }
};