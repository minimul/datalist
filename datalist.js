/*  Datalist was created by Christian Pelczarski
 *  and is freely distributable under the terms of an MIT-style license.
/*--------------------------------------------------------------------------*/
var Datalist = Class.create( Autocompleter.Local.prototype , {
  initialize: function(element, json, options, updateStyles) {
    var options = Object.extend( {
          array: $H(json),
          IE6Shim: false,
          disabledMsgDuration: 2,
          disableButtonForIE: [],
          activityIndicator: true,
          fullSearch: true,
          minChars: 2,
          noButton: false,
          dropLimit: 650
        },options || {} );
    // update gets moved to options
    var update = options.update || 'autocomplete_choices';
    // baseInitialize is from controls.js
    this.baseInitialize(element, update, options);
    this.callback = options.callback || function(ret,element){ element.value = ret.inside };
    this.ieVersion = parseFloat(navigator.appVersion.split(';')[1].strip().split(' ')[1]);
    this.styles = Object.extend( { width: '200px',height: '250px' }, updateStyles);
    if(!this.options.noButton){
      // You can pass the exact button id in or it is assumed
      // to be right next to the element id
      this.button = options.button || this.element.next();
      if( this.options.disableButton ||
          this.options.disableButtonForIE.find(function(v){ return v == this.ieVersion; }.bind(this)) ||
          this.options.array.values().length > this.options.dropLimit ){
        $(this.button).observe('click',this.disabled.bindAsEventListener(this));
      }else{
        $(this.button).observe('click',this.trigger.bindAsEventListener(this) );
      }
      $(this.button).setStyle({ cursor: 'pointer' });
    }// end of !this.options.noButton

    // We need to override some of Autocompleter.Local's methods
    // Override .onShow
    this.options.onShow = this.onDisplay.bind(this);
    // Override .show
    this.show = this.display.bind(this);
    // Override .selectEntry
    this.selectEntry = this.chooseEntry.bind(this);
    // Override .options.selector
    this.options.selector = this.selector.bind(this);
  },
  onDisplay: function(){
    if(!this.update.style.position || this.update.style.position=='absolute') {
      this.update.style.position = 'absolute';
      // if element is blank then drop down button was hit else it is the typing autocomplete action
      var s = $H(this.styles);
      var styles = this.element.value.empty() ? s.merge({ overflow: 'auto' }) : s.merge({ height: '',width: this.styles.width || '' });
      this.update.setStyle(styles.toObject());
      var clone_opts = {
        setHeight: false,
        setWidth: false,
        setTop: true,
        setLeft: true,
        offsetTop: this.element.offsetHeight,
        offsetLeft: this.styles.offsetLeft || 0
      }
        this.update.clonePosition(this.element,clone_opts );
      }
    /* do not use this.update.appear(): the following is more reliable */
    Effect.Appear(this.update,{duration:0.15});

    if(this.options.activityIndicator){
      this.removeActivityIndicator();
    }
    // We need to make sure that that the div is scroll to the top; however, since
    // Firefox, doesn't support .scrollTop if the div is hidden we need
    // to wait until until doing the scrollTop
    (function(){ this.update.scrollTop = 0; }.bind(this)).delay(.2);
  },
  display: function(){
    if(!this.update.visible()){ this.options.onShow(this.element,this.update); }
    if(this.ieVersion == 6 && this.options.IE6Shim){
      if(!this.iefix && Prototype.Browser.IE && this.update.getStyle('position') == 'absolute') {
        this.createIE6Shim();
      }
      if(this.iefix){ this.showIE6Shim(); }
    }
  },
  chooseEntry: function(){
    this.active = false;
    var ret = this.extract(this.getCurrentEntry());
    this.callback(ret,this.element);
  },
  trigger: function(){
    // If this.update is visible then don't do anything
    var isVis = this.update.visible();
    if(!isVis){
      if(this.options.activityIndicator) this.startActivityIndicator();
      var savedValue = this.element.value;
      // Need to blank out the value so the whole list is
      // obtained in a dropdown
      this.element.value = '';
      (function(){
          // activate() is from controls.js
          this.activate();
          this.element.value = savedValue || '';
        }.bind(this)
      ).delay(.2);// this must remain at 200/.2 for best results

      this.shroudEvent = this.shroud.bindAsEventListener(this);
      document.observe('mousedown',this.shroudEvent);
    }
  },
  shroud: function(event){
     var updateClicked = this.clicked(this.update,event);
     if(!updateClicked){
       this.onBlur();
       // Just precautionary : make sure activity indicator is removed
       if(this.options.activityIndicator){
        this.removeActivityIndicator();
       }
       document.stopObserving('mousedown',this.shroudEvent );
     }
  },
  clicked: function(element,event){
    var o = element.cumulativeOffset();
    var pointer = event.pointer();
    var dim = element.getDimensions();
    var rt    = o.left + dim.width;
    var btm   = o.top + dim.height;
    var clicked = (pointer.x > o.left && pointer.x < rt && pointer.y > o.top && pointer.y < btm);
    return clicked;
  },
  extract: function(obj){
    var r = $H();
    var ins = obj.select('.inside').first().innerHTML;
    r.set('inside',ins.stripTags());
    var out = obj.select('.outside').first().innerHTML;
    r.set('outside',out.stripTags());
    return r.toObject();
  },
  selector: function(){
    /* this method is heavy borrowed from Thomas Fuchs http://mir.aculo.us/ Autocompleter.Local class
     * with the method name of selector */
    var ret = [];
    var partial   = []; // Inside matches
    var entry     = this.getToken();
    var count     = 0;
    var opt = this.options;
    var element = this.element;
    if(this.options.array.toQueryString() == '=' || this.options.array.toQueryString().empty()){
      this.options.array.unset('');
      this.options.array.set( '', 'nothing in dropdown');
      this.styles.width  = '140px';
      this.styles.height = '25px';
    }
    this.options.array.each( function(pair){
      var elem = pair.value;
      var inside = '<span class="inside" style="display:none;">' + pair.key + '</span><span class="outside">';
      // Long lists will not display unless we have this if
      // condition here; by checking if the element is empty we know
      // the dropdown button was pushed
      if(element.value.empty()){
        ret.push('<li>' + inside + elem + '</span></li>');
      }else{
        var foundPos = opt.ignoreCase ?
          elem.toLowerCase().indexOf(entry.toLowerCase()) :
          elem.indexOf(entry);
        while (foundPos != -1) {
          if (foundPos == 0 && elem.length != entry.length) {
            ret.push('<li>' + inside + '<strong>' + elem.substr(0, entry.length) + "</strong>" +
              elem.substr(entry.length) + "</span></li>");
            break;
          } else if (entry.length >= opt.partialChars &&
            opt.partialSearch && foundPos != -1) {
            if (opt.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
              partial.push("<li>" + inside + elem.substr(0, foundPos) + "<strong>" +
                elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                foundPos + entry.length) + "</span></li>");
              break;
            }
          }
          foundPos = opt.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
            elem.indexOf(entry, foundPos + 1);
        }
      }
    });
    if (partial.length)
      ret = ret.concat(partial.slice(0, this.options.choices - ret.length))
    return "<ul>" + ret.join('') + "</ul>";
  },
  disabled: function(event){
    var msg = "This list is too long to display.<br/>Type directly into the field<br/>(minimum of " + this.options.minChars;
    msg += " characters)<br/>for more focused results";
    var p = event.pointer();
    this.element.activate();
    var dis = new Element('div',{ 'class': 'dataListDisabledMsg' });
    dis.update(msg);
    var tp = p.y - 40;
    tp = tp < 0 ? 0 : tp;
    dis.setStyle({ top: tp + 'px', left: p.x + 'px' });
    $(document.body).insert(dis);
    // Adjust the position after DOM entry
    var lft = p.x - dis.getWidth()
    dis.setStyle({ left: lft + 'px' });
    // Remove automatically
    (function(){ dis.remove(); }).delay(this.options.disabledMsgDuration);
  },
  createIE6Shim: function(){
    var opts = { 'id': this.update.id + '_iefix',
                 src: "javascript:false;", frameborder: "0", scrolling: "no" };
    this.iefix = new Element('iframe',opts);
    this.iefix.setStyle({ display: 'none',position: 'absolute',filter: 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)',zIndex: 1 });
    $(document.body).insert(this.iefix);
  },
  showIE6Shim: function(){
    (function(){
        this.iefix.clonePosition(this.update);
        this.update.setStyle({ zIndex: 2 });
        this.iefix.show();
      }.bind(this)
    ).delay(.2);
  },
  startActivityIndicator: function(){
    var o = this.element.cumulativeOffset();
    var dim = this.element.getDimensions();
    var imgTag = '';
    var lft = (o.left + dim.width) - 6;// 6 is size of indicator
    this.activityDiv = new Element('div',{ 'class': 'dataListActivityIndicator' });
    this.activityDiv.setStyle({ top: o.top + 'px', left: lft + 'px', position:'absolute' });
    $(document.body).insert(this.activityDiv);
  },
  removeActivityIndicator: function(){
    try{ this.activityDiv.remove(); } catch(e){}
  }

});

var DatalistMouseWheel = {
  on: function(id){
    var id = id || 'autocomplete_choices';
    this.monitor();
    $(id).observe("mouse:wheelDataList",this.scroll);
  },
  scroll: function(event){
    event.stop();// Stop the default behavior of the mousewheel
    // Here is the code that will scroll the div with the mousewheel
    var delta = event.memo.delta;
    var up = delta > 0 ? true : false;
    var abs = Math.abs(delta);
    var t = this.cumulativeScrollOffset();
    var v = this.cumulativeOffset();
    var d = this.getDimensions();
    var incr = 20 * abs;
    var fin = up ? this.scrollTop - incr : this.scrollTop + incr;
    this.scrollTop = fin;
  },
  monitor: function(){
    (function() {
      function wheel(event) {
        var realDelta;
        // normalize the delta
        if (event.wheelDelta) // IE & Opera
          realDelta = event.wheelDelta / 120;
        else if (event.detail) // W3C
          realDelta = -event.detail / 3;
        if (!realDelta) return;

        var customEvent = event.element().fire("mouse:wheelDataList", {
          delta: realDelta
        });
        if (customEvent.stopped) event.stop();
      }

     document.observe("mousewheel",     wheel);
     document.observe("DOMMouseScroll", wheel);
    })();
  }

}

Element.addMethods({
  datalist: function(element, json, options, updateStyles){
    return new Datalist(element, json, options, updateStyles);
  }
});




