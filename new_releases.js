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

})();
