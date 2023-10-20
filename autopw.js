(function () {
  function mega(pw) {
    const interval = setInterval(() => {
      const pwInput = document.querySelector("#password-decrypt-input");
      const pwConfirm = document.querySelector("button.decrypt-link-button");
      if (!pwInput || !pwConfirm) return;
      clearInterval(interval);
      pwInput.value = pw;
      pwConfirm.click();
      setTimeout(() => {
        pwInput.focus();
      }, 500);
    }, 100);
  }
  function kiosk(pw) {
    // enter pw
    const pwInput = document.querySelector("input.swal2-input");
    const pwConfirm = document.querySelector(
      "div.swal2-actions > button.swal2-confirm.swal2-styled"
    );
    pwInput.value = pw;
    pwConfirm.click();
    setTimeout(() => {
      pwInput.focus();
    }, 500);
  }

  // get pw from chrome storage
  let pw = "";
  chrome.storage.sync.get([window.location.href], function (result) {
    pw = result[window.location.href];
    if (pw) {
      const domain = window.location.href.match(/https?:\/\/(.+?)\//)[1];
      switch (domain) {
        case "mega.nz":
          mega(pw);
          break;
        case "kioskloud.io":
          kiosk(pw);
          break;
        default:
          break;
      }
    }
  });
})();
