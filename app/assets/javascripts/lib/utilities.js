AutocompleteRedis.Utilities = {
  selectedText: function() {
    var html, sel, container, div, text, i;

    html = "";

    if (typeof window.getSelection !== "undefined") {
      sel = window.getSelection();
      if (sel.rangeCount) {
        container = document.createElement("div");
        for (i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
      }
    } else if (typeof document.selection !== "undefined") {
      if (document.selection.type === "Text") {
        html = document.selection.createRange().htmlText;
      }
    }

    // Strip out any .click elements from the HTML before converting it to text
    div = document.createElement("div");
    div.innerHTML = html;
    text = div.textContent || div.innerText || "";

    return String(text).trim();
  }
}
