# HTML 5 datalist. Have it now. Have it better.

This is HTML 5 datalist on steroids plus you can use it today. Introduction and quick start guide.

### Current implementation of HTML 5 datalist. Hurting, but idea is right.
The <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-datalist-element">HTML 5 datalist</a> is a much needed form element. What it basically does is provides two input points for one form element. One input point is of course the mouse, as with the current HTML select tag. The second input point being the keyboard in the form of autocomplete to find a element in the list. I say much needed because I think it is important to give a user two ways to select an item from a pre-defined data list. Autocomplete, although, more efficient of the two is not always intuitive for the "non-power-user". Not only that, even power users, will sometimes favor mouse selecting from a list if they are browsing with one hand or already performing a mouse action.

### Problems with HTML 5 datalist as it currently stands
<ul id="datalistProblems">
    <li>Doesn't seem high on the list of HTML 5 elements being implemented by different browser vendors. Currently only Opera supports datalist.</li>
    <li>Autocomplete needs to search and find within the any part of a string not just the first characters.  This is especially useful for large datasets. Actually, I don't know much about how autocomplete is supposed to implemented via the spec. Currently, Opera displays the entire list no matter what is keyed in. :P</li>
    <li>Where is the dropdown arrow? There is no visual indicator that clicking on the element will render the list.</li>
    <li>Would be nice to define datalist with JSON rather than current datalist tag soup. Same issue with rendering HTML select element where you have a sea of &lt;option> tags.</li>
    <li>Need to be able to disable the mouse click for displaying datasets too large. For large datasets displaying a huge list is bad for usability. Mouse selecting could take 15 to 20 seconds to find an item in a dataset over, say, a thousand entries. Be able to enforce only autocomplete in these scenarios.</li>
</ul>

HTML 5 datalist in its current implementation by Opera is barely useful to the point of being meaningless. However, the idea of two input points for a HTML form element is a worthy one.

### The anecdote to the sickly HTML 5 datalist: Datalist class.
Born out my need on some client work to provide a dual input form element I created the Datalist class. I created the initial version probably about 4 years ago. Since then I have loving curated it and all features and options come out of real world web application usage. The Datalist class requires [Prototype 1.6.1](http://prototypejs.org) and latest [Scriptaculous](http://script.aculo.us/) (just effects.js and controls.js).

### Quick start guide
Here are the basics for getting the Datalist class up and running locally. Clone the code from http://github.com/minimul/datalist. Then take the following HTML snippet and save it inside the root folder of the downloaded code calling it test.html.

<p class="demoNotice">
Ok, Christian. Enough. Let me see the <a href="http://minimul.com/demo/datalist/index.html" target="_blank">demo page.</a>
</p>

<pre>
<code class="html">
&lt;!DOCTYPE html PUBLIC &quot;-//W3C//DTD XHTML 1.0 Transitional//EN&quot;
  &quot;http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd&quot;&gt;

&lt;html xmlns=&quot;http://www.w3.org/1999/xhtml&quot; xml:lang=&quot;en&quot; lang=&quot;en&quot;&gt;
  &lt;head&gt;
    &lt;title&gt;Datalist class demo&lt;/title&gt;
    &lt;script src=&quot;lib/prototype.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
    &lt;script src=&quot;lib/effects.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
    &lt;script src=&quot;lib/controls.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
    &lt;script src=&quot;lib/data.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
    &lt;script src=&quot;datalist.js&quot; type=&quot;text/javascript&quot;&gt;&lt;/script&gt;
  &lt;style&gt;

    div.autocomplete {
      position: absolute;
      width: 250px; /* will be adjusted by script.aculo.us */
      background-color: white; border: 1px solid #888;
      margin: 0px; padding: 0px;
    }
    div.autocomplete ul {
      list-style-type: none; margin: 0px; padding: 0px;
    }

    div.autocomplete ul li.selected { background-color: #ff9;}
    div.autocomplete ul li {
      list-style-type: none; display: block;
      font-family: sans-serif; font-size: small; color: #444;
      margin: 0; padding: 0.1em;
      line-height: 1.5em;
      cursor: pointer;
    }

    div.dataListDisabledMsg  { position:absolute;padding:2px;background:#ff9;border:1px solid #888;font:400 8pt Tahoma; }
    div.dataListActivityIndicator { width:6px;height:6px;background:red;overflow:hidden; }

  &lt;/style&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div id=&quot;parentContainer&quot;&gt;
      &lt;p&gt;
        &lt;input type=&quot;text&quot; id=&quot;states&quot; value=&quot;&quot; /&gt; &lt;img src=&quot;dropdown_simple.gif&quot; /&gt;
      &lt;/p&gt;
      &lt;div style=&quot;display:none;&quot; class=&quot;autocomplete&quot; id=&quot;autocomplete_choices&quot;&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;script&gt;
      document.observe( 'dom:loaded',function(){
        // states_json comes from data.js
        $('states').datalist(states_json);
      });
    &lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;

</code></pre>

This will get you up and running with a example that is similar to the screenshots up above. Moreover, in the source code is the <a href="http://minimul.com/demo/datalist/index.html" target="_blank">demo</a> page, which is index.html. There are also a rich set of options detailed in the <a href="http://minimul.com/datalist-documentation.html" target="_blank">Datalist documentation</a> page.
