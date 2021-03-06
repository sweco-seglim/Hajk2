/**
 * Backbone Class Navigation Model
 * @class
 * @augments Backbone.Model
 */
var NavigationModel = Backbone.Model.extend({
  /** @member {object} defaults - Default settings */
  defaults: {
    /** @member {Array<object>} panels */
    panels: [],
    /** @member {boolean} visible. Default: false */
    visible: false,

    toggled: false,
    /** @member {boolean} activePanel */
    activePanel: undefined
  },
  /**
   * Creates a navigation model.
   *
   * @constructor
   * @param {object} options - Default options
   */
  initialize: function (options) {

    options.panels.forEach(panel => {
      panel.model.on("change:visible", this.onPanelVisibleChanged, this);
    });

    this.on('change:visible', (s, visible) => {
      if (this.get('activePanel') && !visible) {
        this.get('activePanel').model.set('visible', visible);
      }
    });
  },

  navigate: function(panelRef, type) {
    if (panelRef) {
      this.set("activePanelType", type);
      this.set("activePanel", panelRef);
      if (!this.get("visible")) {
        this.set("visible", true);
      }
    } else {
      this.set("visible", false);
    }
  },

  /**
   * Handler for toggle events of panels.
   *
   * @param {object} panel
   * @param {boolean} visible
   */
  onPanelVisibleChanged: function (panel, visible) {
    var type = (panel.get('panel') || '').toLowerCase();
    var panelRef = _.find(this.get("panels"), panel => (panel.type || '').toLowerCase() === type);
    var activePanel = this.get("activePanel");

    if (visible) {

      if (activePanel) {
        activePanel.model.set("visible", false);
        if (activePanel.model.filty) {

          this.set('alert', true);

          this.ok = () => {
            this.navigate(panelRef, type);
          };

          this.deny = () => {
            if (panelRef) {
              panelRef.model.set('visible', false);
            }
          }

        }
      }

      if (!this.get('alert')) {
        this.navigate(panelRef, type);
      }

    }
  }
});

module.exports = NavigationModel;
