(function(){
    console.log("kioskautopw.js");
    // get pw from chrome storage
    let pw = "";
    chrome.storage.sync.get([window.location.href], function (result) {
        pw = result[window.location.href];
        if (pw) {

            // enter pw
            const pwInput = document.querySelector("input.swal2-input");
            const pwConfirm = document.querySelector("div.swal2-actions > button.swal2-confirm.swal2-styled");
            pwInput.value = pw;
            pwConfirm.click();
        }
    });


})();