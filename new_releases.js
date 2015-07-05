//alert('the new_releases.js is loaded on '+window.location.href);

(function() {
  var cached_stored_titles, cached_title_els;

  var pathMatch = function() {
    var path_match = document.location.pathname.match(/\/([^\/]+)/);
    return path_match ? path_match[1] : '';
  };

  var storageKey = function(date, key_str) {
    var key = ['ndiff'];

    key.push('' + date.getFullYear() +'-'+ date.getMonth() +'-'+ date.getDate());

    key.push(pathMatch());

    if(key_str !== undefined)
      key.push(key_str);

    return key.join(':');
  };

  var getMonday = function(d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };
  var thisMonday = function(d) {
    return getMonday(new Date());
  };
  var lastMonday = function() {
    var d = new Date();
    d.setDate(d.getDate() - 7);
    return getMonday(d);
  };

  //getMonday(new Date());

  var storedTitles = function() {
    if(cached_stored_titles === undefined)
      cached_stored_titles = JSON.parse(
        localStorage.getItem(storageKey(lastMonday()))
      ) || {};
    return cached_stored_titles;
  };
  var titleEls = function() {
    if(cached_title_els === undefined)
      cached_title_els = document.getElementsByClassName('now-thumbnail-textlink');
    return cached_title_els;
  };

  // Iterate over the current list of titles.
  // If the title was available last week, hide it.
  var showNewTitles = function() {
    if(alreadyNewFiltered()) {
      console.log('already filtered. Not hiding anything else.');
      return;
    }

    console.log('hiding all old movies');
    var title_els = titleEls(),
      current_titles = {},
      title = '';
    for (var i = title_els.length - 1; i >= 0; i--) {
      title = title_els[i].innerHTML;
      // hide everything that's not new
      if(!storedTitles()[title]) {
        var list_el = title_els[i];
        while(list_el.tagName != 'LI' && list_el.parentElement) {
          list_el = list_el.parentElement;
        }
        if(list_el.tagName == 'LI')
          list_el.style.display = 'none';
      }
    }

    addNewLabelEl();
  };

  var alreadyNewFiltered = function() {
    return document.querySelector('.filters .new') !== null;
  };

  var addNewLabelEl = function() {
    var selected_filter_el = document.querySelector('.filters .selected'),
      new_el = document.createElement('span');
    new_el.className = 'new';
    new_el.style.fontSize = '0.7em';
    new_el.style.display = 'inline-block';
    new_el.style.width = '0px';
    new_el.style.paddingLeft = '6px';
    new_el.style.marginRight = '-6px';
    new_el.innerHTML = "(New)";

    selected_filter_el.appendChild(new_el);
  };

  var removeNewLabelEl = function() {
    console.log('running removeNewLabelEl');
    var new_el = document.querySelector('.filters .new');
    if(new_el) new_el.remove();
  };

  // Save the current list of titles to localStorage.
  // When next week rolls around, we'll start comparing against this list.
  var updateThisWeekTitles = function () {
    var title_els = titleEls(),
      current_titles = {},
      title = '';

    for (var i = title_els.length - 1; i >= 0; i--) {
      title = title_els[i].innerHTML;
      // build up the list of current titles
      current_titles[title] = 1;
    }
    console.log('stored '+title_els.length+' titles to '+storageKey(thisMonday()));
    localStorage.setItem(storageKey(thisMonday()), JSON.stringify(current_titles));
  };

  // For testing, set last week's list of cached movies
  // to be a random subset of this week's movies.
  setRandomLastWeek = function() {
    var titles = storedTitles(),
      title, size;
    size = 0; for(title in titles) { size += 1; }
    console.log("starting with "+size+" titles");
    for(title in titles) { if(Math.random() > 0.75) delete(titles[title]); }
    size = 0; for(title in titles) { size += 1; }
    console.log('stored '+size+' titles to '+storageKey(lastMonday()));
    localStorage.setItem(storageKey(lastMonday()), JSON.stringify(titles));
  };

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log((sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension") +
                  " " + JSON.stringify(request)

      );
      showNewTitles();
    }
  );

  setTimeout(updateThisWeekTitles, 1000);
  setTimeout(function() {
    var filter_els = document.querySelectorAll('.filters a'),
      filter_el;
    for (var i = filter_els.length - 1; i >= 0; i--) {
      filter_el = filter_els[i];
      console.log('added click listener to '+filter_el);
      filter_el.addEventListener('click', removeNewLabelEl);
    }
  }, 1100);
  //setTimeout(setRandomLastWeek, 2000);

})();
