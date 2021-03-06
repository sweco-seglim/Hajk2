"use strict";

var types = {
  "wms": require('layers/wmslayer'),
  "wfs": require('layers/wfslayer'),
  "wmts": require('layers/wmtslayer')
};

/**
 * Prototype for creating a layer collecton.
 * @class LayerCollection
 * @augments external:"Backbone.Collection"
 */
var LayerCollection = {
  /**
   * Add layer to openlayers map
   * @param {Layer} layer - Layer model to add
   */
  addToMap: function(layer) {
    var map = this.shell.get('map').getMap()
    ,   olLayer = layer.getLayer();

    layer.set("shell", this.shell);
    if (olLayer) {
      map.addLayer(olLayer);
    }
  },
  /**
   * Remove layer from openlayers map
   * @param {Layer} layer - Layermodel to remove
   */
  removeFromMap: function(layer) {
    var map = this.shell.get('map').getMap()
    ,   olLayer = layer.getLayer();

    if (olLayer) {
      map.removeLayer(olLayer);
    }
  },
  /**
   * Generates a model for this layer
   * @param {object} args
   * @param {object} properties
   * @return {Layer} layer
   */
  model: function (args, properties) {

    function getLegendUrl(args) {
      if (args.legend === "") {
        args.legend = `${args.url}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=32&HEIGHT=32&LAYER=${args.layers[0]}`
      }
      var protocol = /^http/.test(args.legend) ? '' : 'http://';
      return protocol + args.legend;
    }

    var layer_config = {
      type : "wms",
      options: {
        "id": args.id,
        "url": (HAJK2.wmsProxy || "") + args.url,
        "name": args.id,
        "caption": args.caption,
        "visible": args.visibleAtStart,
        "opacity": 1,
        "queryable": args.queryable === false ? false : true,
        "information": args.infobox,
        "resolutions": properties.mapConfig.resolutions,
        "projection": properties.mapConfig.projection || "EPSG:3006",
        "origin": properties.mapConfig.origin,
        "extent": properties.mapConfig.extent,
        "legend" : [{
          "Url": getLegendUrl(args),
          "Description" : "Teckenförklaring"
        }],
        "params": {
          "LAYERS": args.layers.join(','),
          "FORMAT": "image/png",
          "VERSION": "1.1.0",
          "SRS": properties.mapConfig.projection || "EPSG:3006",
          "TILED": args.tiled
        }
      }
    };

    if (args.searchFields && args.searchFields[0] !== "") {
      layer_config.options.search = {
        "url": (HAJK2.searchProxy || "") + args.url.replace('wms', 'wfs'),
        "featureType": args.layers[0].split(':')[1] || args.layers[0].split(':')[0],
        "propertyName": args.searchFields.join(','),
        "displayName": args.displayFields ? args.displayFields : (args.searchFields[0] || "Sökträff"),
        "srsName": properties.mapConfig.projection || "EPSG:3006"
      };
    }

    var Layer = types[layer_config.type];

    if (Layer) {
      return new Layer(layer_config.options, layer_config.type);
    } else {
      throw "Layer type not supported " + layer_config.type;
    }
  },
  /**
   * Constructor method
   * @param {object} options
   * @param {object} args
   */
  initialize: function (options, args) {

    this.shell = args.shell;
    this.initialConfig = options;

    _.defer(_.bind(function () {

      this.forEach(this.addToMap, this);

    }, this));

    this.on("add", this.addToMap, this);
    this.on("remove", this.removeFromMap, this);
  },
  /**
   * Get the objects data state as json-friendly representation.
   * @return {object} state
   */
  toJSON: function () {
    return this.initialConfig.map(layer => {
      var found = this.find(collectionLayer => collectionLayer.get('id') === layer.id);
      if (found) {
        layer.visibleAtStart = found.get('visible');
      }
      return layer;
    });
  }

};

/**
 * Layer collection module.<br>
 * Use <code>require('collections/layercollection')</code> for instantiation.
 * @module LayerCollection-module
 * @returns {LayerCollection}
 */
module.exports = Backbone.Collection.extend(LayerCollection);
