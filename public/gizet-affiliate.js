(function () {
  var params = new URLSearchParams(window.location.search);
  var creator = params.get("affiliate_creator");
  var click = params.get("affiliate_click");
  var keyCreator = "gizet_affiliate_creator";
  var keyClick = "gizet_affiliate_click";

  if (creator) localStorage.setItem(keyCreator, creator);
  if (click) localStorage.setItem(keyClick, click);
  creator = creator || localStorage.getItem(keyCreator);
  click = click || localStorage.getItem(keyClick);
  if (!creator) return;

  fetch("/cart/update.js", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      attributes: {
        affiliate_creator_id: creator,
        affiliate_click_id: click || "",
        affiliate_source: params.get("utm_source") || "creator"
      }
    })
  }).catch(function () {});
})();
