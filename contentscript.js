(function () {
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    function filterBase64Chars(str) {
        return str.replace(/[^A-Za-z0-9+/=]/g, '')
    }
    function decodeBase64Recursively(base64, maxDepth = 5) {
        if (maxDepth <= 0) return base64
        if (base64.startsWith("http")) return base64
        try {
            const decoded = atob(base64)
            if (!decoded) return base64
            return decodeBase64Recursively(decoded, maxDepth - 1)
        } catch (e) {
            return base64
        }
    }
    const article = document.querySelector("div.article-body > div.article-content")
    if (!article) return

    const pLines = article.querySelectorAll("p")

    pLines.forEach(line => {
        try {
            const original = line.innerHTML;
            const text = line.textContent
            // check if original has strikethrough
            const strike = original.includes("<s>");
            const testdecoded = atob(filterBase64Chars(text))
            if (testdecoded) {
                const fullydecoded = decodeBase64Recursively(testdecoded)
                if (!fullydecoded.startsWith("http")) return
                const html = `<a href=${fullydecoded} target="_blank">${(strike?"<s>":"")+fullydecoded+(strike?"</s>":"")}</a> (decoded from base64) `
                line.innerHTML = html;
                //add revert button
                const revertButton = document.createElement("a")
                revertButton.href = "javascript:void(0)"
                revertButton.innerHTML = "Revert"
                function undo() {
                    line.innerHTML = original
                    line.innerText += " "
                    line.appendChild(revertButton)
                    revertButton.innerHTML = "Decode"
                    revertButton.onclick = redo;
                }
                function redo() {
                    line.innerHTML = html;
                    line.appendChild(revertButton)
                    revertButton.innerHTML = "Revert"
                    revertButton.onclick = undo;
                }
                revertButton.onclick = undo;
                line.appendChild(revertButton)
            }
        } catch (e) { console.log(e) }
    })


    const brLines = article.innerHTML.split(/<br\s*[\/]?>/gi)
    brLines.forEach(line => {
        try {
            const testdecoded = atob(filterBase64Chars(line))
            const strike = line.includes("<s>");
            if (testdecoded) {
                const fullydecoded = decodeBase64Recursively(testdecoded)
                if (!fullydecoded.startsWith("http")) return
                const id = uuidv4()
                const html = `<a href=${fullydecoded} target="_blank">${(strike?"<s>":"")+fullydecoded+(strike?"</s>":"")}</a> (decoded from base64) `
                article.innerHTML = article.innerHTML.replace(line, `<p id=${'symyabase64-' + id}></p>`)
                document.getElementById('symyabase64-' + id).innerHTML = html;
                // add revert button
                const revertButton = document.createElement("a")
                revertButton.href = "javascript:void(0)"
                revertButton.innerHTML = "Revert"
                function undo() {
                    document.getElementById('symyabase64-' + id).innerHTML = line + " "
                    revertButton.innerHTML = "Decode"
                    revertButton.onclick = redo;
                    document.getElementById('symyabase64-' + id).appendChild(revertButton)
                }
                function redo() {
                    document.getElementById('symyabase64-' + id).innerHTML = html;
                    revertButton.innerHTML = "Revert"
                    revertButton.onclick = undo;
                    document.getElementById('symyabase64-' + id).appendChild(revertButton)
                }
                revertButton.onclick = undo;
                document.getElementById('symyabase64-' + id).appendChild(revertButton)



            }
        } catch (e) { console.log(e) }
    })

})()