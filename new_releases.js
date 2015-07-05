//alert('the new_releases.js is loaded on '+window.location.href);

(function() {
  var getMonday = function(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  //getMonday(new Date());

  var stored_titles = JSON.parse(localStorage.getItem("titles-")) || {};

  //alert("stored: "+stored_titles);

  var title_els,
    titles = {};

  title_els = document.getElementsByClassName('now-thumbnail-textlink');
  for (var i = title_els.length - 1; i >= 0; i--) {
    titles[title_els[i].innerHTML] = 1;
  }

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log((sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension") +
                  " " + JSON.stringify(request)

      );
    }
  );

})();
