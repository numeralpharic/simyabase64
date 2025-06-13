
console.log("contentscript.js loaded");
function tryGenerateRJLink(pTag){
  const upper = pTag.textContent.toUpperCase();
  console.log(upper);
  // match RJXXXXXX or 거XXXXXX (digits doesn't matter)
  const match = upper.match(/RJ(\d+)|거(\d+)/);
  console.log(match);
  if (!match) return pTag;
  const rjcode = match[1] || match[2];
  const urlBase = `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjcode}.html`
  // append href to pTag
  const a = document.createElement("a");
  pTag.appendChild(a);
  a.href = urlBase;
  a.target = "_blank";
  a.innerText = "(link)";
  return pTag;
}
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
function filterBase64Chars(str) {
  return str.replace(/[^A-Za-z0-9+/=]/g, "");
}
function decodeBase64Recursively(base64, maxDepth = 5) {
  if (maxDepth <= 0) return base64;
  if (base64.startsWith("http")) return base64;
  try {
    const decoded = atob(base64);
    if (!decoded) return base64;
    return decodeBase64Recursively(decoded, maxDepth - 1);
  } catch (e) {
    return base64;
  }
}
function savepw(url, pw) {
  // exclude domain, take only path
  const path = url.match(/https?:\/\/.+?(\/.+)$/)[1];
  chrome.storage.local.set({ [path]: pw }, function () {
    console.log("saved pw: " + pw + " for " + path);
  });
  // remove on beforeunload
  window.addEventListener("beforeunload", function () {
    chrome.storage.local.remove([path], function () {
      console.log("removed pw for " + path);
    });
  });
}

function waitForShadowRoot() {
  return new Promise((resolve) => {
    const checkShadowRoot = () => {
      const postContent = document.querySelector("#post_content");
      if (postContent && postContent.shadowRoot) {
        resolve(postContent.shadowRoot.querySelector("div"));
      } else {
        setTimeout(checkShadowRoot, 100); // Check again in 100ms
      }
    };
    checkShadowRoot();
  });
}
async function main(){


  const article = document.location.href.includes("arca.live") ? document.querySelector("div.article-body > div.article-content") : await waitForShadowRoot();
  console.log(article);
  if (!article) return;
  let autopw = "somisoft";
  const pLines = article.querySelectorAll("p");
  
  // find "ㄱㄹ" or "국룰" from article, get token including it, and substitute it with "somisoft". e.g.: #국룰# -> #somisoft#, 123국룰123 -> 123somisoft123
  const token = article.innerText.match(/([^ \-\n\(\)\[\]:]*(?:ㄱ.*?ㄹ|국.*?룰)[^ \-\n\[\]\(\)]*)/g);
  if (token) {
    autopw = token[0];
    autopw = autopw.replace(/ㄱ.*?ㄹ|국.*?룰/g, "somisoft").replace(/\+/g,"");
  }

  pLines.forEach((line) => {
    try {
      const original = line.innerHTML;
      const text = line.textContent;
      tryGenerateRJLink(line);
      // check if original has strikethrough
      const strike = original.includes("<s>");
      const testdecoded = atob(filterBase64Chars(text));
      if (testdecoded) {
        const fullydecoded = decodeBase64Recursively(testdecoded);
        if (!fullydecoded.startsWith("http")) return;
        savepw(fullydecoded, autopw);
        console.log(fullydecoded);
        const html = `<a href=${fullydecoded} target="_blank">${
          (strike ? "<s>" : "") + fullydecoded + (strike ? "</s>" : "")
        }</a> (decoded from base64) `;
        line.innerHTML = html;
        //add revert button
        const revertButton = document.createElement("a");
        revertButton.href = "javascript:void(0)";
        revertButton.innerHTML = "Revert";
        function undo() {
          line.innerHTML = original;
          line.innerText += " ";
          line.appendChild(revertButton);
          revertButton.innerHTML = "Decode";
          revertButton.onclick = redo;
        }
        function redo() {
          line.innerHTML = html;
          line.appendChild(revertButton);
          revertButton.innerHTML = "Revert";
          revertButton.onclick = undo;
        }
        revertButton.onclick = undo;
        line.appendChild(revertButton);
      }
      
      
    } catch (e) {
      
    }
  });

  const brLines = article.innerHTML.split(/<br\s*[\/]?>/gi);
  brLines.forEach((line) => {
    try {
      const filtered = filterBase64Chars(line);
      const testdecoded = atob(filtered);
      const strike = line.includes("<s>");
      if (testdecoded) {
        const fullydecoded = decodeBase64Recursively(testdecoded);
        if (!fullydecoded.startsWith("http")) return;
        savepw(fullydecoded, autopw);
        const id = uuidv4();
        const html = `<a href=${fullydecoded} target="_blank">${
          (strike ? "<s>" : "") + fullydecoded + (strike ? "</s>" : "")
        }</a> (decoded from base64) `;
        article.innerHTML = article.innerHTML.replace(
          filtered,
          `<p id=${"symyabase64-" + id}></p>`
        );
        const tag = document.getElementById("symyabase64-" + id);
        tag.innerHTML = html;
        // add revert button
        const revertButton = document.createElement("a");
        revertButton.href = "javascript:void(0)";
        revertButton.innerHTML = "Revert";
        function undo() {
          tag.innerHTML = line + " ";
          revertButton.innerHTML = "Decode";
          revertButton.onclick = redo;
          tag.appendChild(revertButton);
        }
        function redo() {
          tag.innerHTML = html;
          revertButton.innerHTML = "Revert";
          revertButton.onclick = undo;
          tag.appendChild(revertButton);
        }
        revertButton.onclick = undo;
        tag.appendChild(revertButton);
      }
    } catch (e) {
      
    }
  });

  const unknowns = article.innerText.split(/\s+/);
  unknowns.forEach((unknown) => {
    try {
      const filtered = filterBase64Chars(unknown);
      const testdecoded = atob(filtered);
      if (testdecoded) {
        const fullydecoded = decodeBase64Recursively(testdecoded);
        if (!fullydecoded.startsWith("http")) return;
        savepw(fullydecoded, autopw);
        const id = uuidv4();
        const html = `<a href=${fullydecoded} target="_blank">${fullydecoded}</a> (decoded from base64) `;
        if (article.innerHTML.includes(filtered)) {
          article.innerHTML = article.innerHTML.replace(
            filtered,
            `<p id=${"symyabase64-" + id}></p>`
          );
          const tag = document.getElementById("symyabase64-" + id);
          tag.innerHTML = html;
          // add revert button
          const revertButton = document.createElement("a");
          revertButton.href = "javascript:void(0)";
          revertButton.innerHTML = "Revert";
          function undo() {
            tag.innerHTML = unknown + " ";
            revertButton.innerHTML = "Decode";
            revertButton.onclick = redo;
            tag.appendChild(revertButton);
          }
          function redo() {
            tag.innerHTML = html;
            revertButton.innerHTML = "Revert";
            revertButton.onclick = undo;
            tag.appendChild(revertButton);
          }
          revertButton.onclick = undo;
          tag.appendChild(revertButton);
        } else {
          article.innerHTML += `<p id=${"symyabase64-" + id}></p>`;
          const tag = document.getElementById("symyabase64-" + id);
          tag.innerHTML = html;
          // add revert button
          const revertButton = document.createElement("a");
          revertButton.href = "javascript:void(0)";
          revertButton.innerHTML = "Revert";
          function undo() {
            tag.innerHTML = unknown + " ";
            revertButton.innerHTML = "Decode";
            revertButton.onclick = redo;
            tag.appendChild(revertButton);
          }
          function redo() {
            tag.innerHTML = html;
            revertButton.innerHTML = "Revert";
            revertButton.onclick = undo;
            tag.appendChild(revertButton);
          }
          revertButton.onclick = undo;
          tag.appendChild(revertButton);
        }
      }
    } catch (e) {
      
    }
  });
}
main()
// on url change, run main
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    main();
  }
}).observe(document, {subtree: true, childList: true});
