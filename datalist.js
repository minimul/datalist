/*  DataList & DataListLocal are created by Christian Pelczarski
 *  and is freely distributable under the terms of an MIT-style license.
/*--------------------------------------------------------------------------*/
var DataListLocal = Class.create();
Object.extend(Object.extend(DataListLocal.prototype, Autocompleter.Local.prototype), {
  initialize: function(element, update, array, options,styles) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
    this.el = this.element.next();
    this.styles = styles || { width: 200 };
    if(!this.options.noButton){
      this.options.dropLimit = this.options.dropLimit || 150;
      if( this.options.disableButton || this.options.array.values().length > this.options.dropLimit ){
        var min_chars = this.options.partialChars;
        $(this.el).observe('click',function(){ 
          var msg = "This list is too long to display.\nType directly into the field\n(minimum of " + min_chars + " characters)\nfor more focused results";
          this.element.focus();
          alert(msg); 
          }.bind(this) );
      }else{
        $(this.el).observe('click',DataListHelper.trigger.bindAsEventListener(this) );
      }
    }
    // Override onShow
    this.options.onShow = DataListHelper.show.bind(this);
    
    if( array instanceof Hash ){
      this.options.selector = function(){
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
                var foundPos = opt.ignoreCase ? elem.toLowerCase().indexOf(entry.toLowerCase()) : elem.indexOf(entry);
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
     }.bind(this);
   }
  }
});

var DataList = Class.create();
Object.extend(Object.extend(DataList.prototype, Ajax.Autocompleter.prototype), {
  initialize: function(element, update, url, options,styles) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
    this.el = this.element.next();
    this.iefix = true;
    this.styles = styles || { width:200 };
    if(!this.options.noButton){
      if( this.options.disableButton ){
        $(this.el).observe('click',function(){ 
          var msg = "This list is too long to display.\nType directly into the field\n(minimum of 3 characters)\nfor more focused results";
          alert(msg) 
          } );
      }else{
        $(this.el).observe('click',DataListHelper.trigger.bindAsEventListener(this) );
      }
    }
    // Override onShow
    this.options.onShow = DataListHelper.show.bind(this);
  }
});

var DataListHelper = {
  show : function(){ 
    if(!this.update.style.position || this.update.style.position=='absolute') {
      this.update.style.position = 'absolute';
      this.update.scrollTop = 0;
      if(this.element.value.empty()){// if element is blank then drop down button was hit
        if( typeof this.savedValue != 'undefined' ){
          this.styles.overflow = 'auto';
        }else{
          this.styles.overflow = 'visible';
        }
      }else{
        this.styles.height  = '';
        this.styles.width   = this.styles.width || '';
      }
      this.update.setStyle(this.styles);
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
    Effect.Appear(this.update,{duration:0.15});
  },
  trigger : function(){
    // This "if" is to protect against going from select box to select box
    var dvalue = this.update.getStyle('display');
    if(dvalue == 'none'){
      this.savedValue = this.element.value;
      this.element.value = '';
      setTimeout( function(){ 
          this.activate();
          this.element.value = this.savedValue || ''; 
        }.bind(this),200 );// this must remain at 200 for best results

      this.shroud = DataListHelper.shroud.bindAsEventListener(this);
      document.observe('mousedown',this.shroud);
      
      setTimeout( function() { 
          delete this.savedValue;
          }.bind(this),1000 );
    }
  },
  shroud : function(event){
     var a = this.update.clicked(event);
     if(!a && !$(this.el).clicked(event)){
       this.onBlur();
       document.stopObserving('mousedown',this.shroud );
     }
  },
  parse: function(obj,a,b){
    var a = a || 'inside';
    var b = b || 'outside';
    var c = Element.collectTextNodesIgnoreClass( obj,b );
    var d = Element.collectTextNodesIgnoreClass( obj,a );
    a = this.esc(a);
    b = this.esc(b);
    c = this.esc(c);
    d = this.esc(d);
    var json = 'var e = { #{a}: "#{c}", #{b}: "#{d}" };'.interpolate( { 'a': a,'b': b,'c': c,'d': d } );
    eval(json);
    return e;
  },
  esc: function(str){
    return str.replace(/"/g,'\\"');
  },
  scroll: function(event){
    event.stop();// Stop the default behavior of the mousewheel
    // Here is the code that will scroll the div with the mousewheel
    var delta = event.memo.delta;
    var up = delta > 0 ? true : false;
    var abs = Math.abs(delta);
    var t = this.cumulativeScrollOffset().last();
    var incr = 20 * abs;
    this.scrollTop = up ? t - incr : t + incr;
  }

};

