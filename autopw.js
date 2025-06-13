(function () {
  console.log("AutoPW is running...");
  function mega(pw) {
    if(!window.location.href.includes("#P!")) return;
    console.log("Waiting for password input...");
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
  async function kioac(pw) {
    console.log("Waiting for password input...");

    let pwInput = document.querySelector("input");
    // poll pwinput
    await new Promise(resolve =>{
      const interval = setInterval(() => {
        pwInput = document.querySelector("input");
        if (pwInput) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    console.log("Found password input");
    const pwConfirm = document.querySelector("button[data-submit='true']");
    if (!pwInput || !pwConfirm) return;
    pwInput.value = pw;
    pwInput.dispatchEvent(new Event("input", { bubbles: true }));
    // wait for event to be processed
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (pwInput.value === pw) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    pwConfirm.click();
    setTimeout(() => {
      pwInput.focus();
    }, 500);
  }
  // get pw from chrome storage
  let pw = "";
  const path = window.location.href.match(/https?:\/\/.+?(\/.+)$/)[1];
  chrome.storage.local.get([path], function (result) {
    
    pw = result[path];
    console.log("pw: " + pw);

    if (pw) {
      const domain = window.location.href.match(/https?:\/\/(.+?)\//)[1];
      switch (domain) {
        case "mega.nz":
          mega(pw);
          break;
        case "kioskloud.io":
          kiosk(pw);
          break;
        case "kio.ac":
          kioac(pw);
          break;
        default:
          break;
      }
    }
  });
})();
