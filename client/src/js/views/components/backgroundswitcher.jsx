/**
 * React Class Background Switcher
 * @class
 */
var BackgroundSwitcher = React.createClass({

  /**
   *
   */
  getInitialState: function () {
    return {
      displayMode: 'hidden',
      displayModeClass: 'fa fa-plus-circle'
    }
  },

  /**
   *
   */
  componentDidMount: function () {
    this.backgroundSwitcherModeChanged();
    this.props.model.on('change:backgroundSwitcherMode', () => {
      this.backgroundSwitcherModeChanged()
    });
  },

  /**
   *
   */
  componentWillUnmount: function () {
    this.props.model.off('change:backgroundSwitcherMode');
  },

  /**
   *
   */
  backgroundSwitcherModeChanged: function () {
    var mode = this.props.model.get('backgroundSwitcherMode')
    ,   cls  = (this.props.model.get('backgroundSwitcherMode') === 'hidden') ? 'fa fa-plus-circle' : 'fa fa-minus-circle'
    ;
    this.setState({
      displayMode: mode,
      displayModeClass: cls
    });
  },

  /**
   *
   */
  setBlackBackground: function () {
    this.clear();
    $('#map').css({background: 'black'});
  },

  /**
   *
   */
  setWhiteBackground: function () {
    this.clear();
    $('#map').css({background: 'white'});
  },

  /**
   *
   */
  clear: function() {
    this.props.layers.forEach(baselayer => {
      baselayer.setVisible(false);
      baselayer.getLayer().setVisible(false);
    });
  },

  /**
   *
   */
  setBackgroundLayer: function (layer) {
    $('#map').css({background: 'white'});
    this.props.layers.forEach(baselayer => {
      var visible = baselayer.id === layer.id;
      baselayer.setVisible(visible);
      baselayer.getLayer().setVisible(visible);
    });
  },

  /**
   *
   */
  setVisibility: function() {
    this.props.model.set('backgroundSwitcherMode',
      this.props.model.get('backgroundSwitcherMode') === 'hidden' ? '' : 'hidden'
    );
  },

  /**
   *
   */
  getSelected: function (layer) {
    if (this.state && this.state.selected) {
      if (this.state.selected === layer.get('id')) {
        return true;
      }
    }
    return this.props.layers.filter(l =>
      l.getVisible() && l.id === layer.id
    ).length === 1;
  },

  /**
   *
   */
  renderLayers: function () {
    return (
      this.props.layers.map((layer, i) => {
        var index = "background-layer-" + i
        ,   checked = this.getSelected(layer);
        return (
          <li key={index}>
            <input id={index} name="background" type="radio" defaultChecked={checked} onChange={() => this.setBackgroundLayer(layer) }></input>
            <label htmlFor={index}>{layer.get('caption')}</label>
          </li>
        );
      })
    )
  },

  /**
   *
   */
  render: function () {
    return (
      <div className="background-switcher">
        <h3 onClick={this.setVisibility} ><span className={this.state.displayModeClass}></span>&nbsp;Bakgrundskartor</h3>
        <ul className={this.state.displayMode}>
          <li key="-2">
            <input id="-2" name="background" type="radio" defaultChecked="false" onChange={() => this.setWhiteBackground() }></input>
            <label htmlFor="-2">Vit bakgrund</label>
          </li>
          <li key="-1">
            <input id="-1" name="background" type="radio" defaultChecked="false" onChange={() => this.setBlackBackground() }></input>
            <label htmlFor="-1">Svart bakgrund</label>
          </li>
          {this.renderLayers()}
        </ul>
      </div>
    );
  }
});

module.exports = BackgroundSwitcher;