// ==UserScript==
// @name         Moodle AI
// @namespace    http://tampermonkey.net/
// @version      5.1
// @author       Victor
// @include      https://moodle.basischina.com:*/mod/quiz/review.php?attempt=*
// @grant        none
// @description  Solve Moodle easily!
// ==/UserScript==
(function() {
    'use strict';
    function createui() {
        const cont = document.createElement('div');
        cont.style = "position:fixed;top:10px;right:10px;z-index:9999;display:flex;flex-direction:column;gap:5px;background:#f8f9fa;padding:10px;border:1px solid #ccc;border-radius:5px;";
        const remdiv = document.createElement('div');
        cont.innerHTML = "Note: This userscript cannot extract any pictures.<br>Make sure to do the questions with pictures manually.";
        const btne = document.createElement('button');
        btne.innerHTML = "extract questions";
        btne.style = "padding:8px;cursor:pointer;font-weight:bold;";
        btne.onclick = extract;
        const btnf = document.createElement('button');
        btnf.innerHTML = "fill answers";
        btnf.style = "padding:8px;cursor:pointer;font-weight:bold;";
        btnf.onclick = fill;
        cont.appendChild(btne);
        cont.appendChild(btnf);
        cont.appendChild(remdiv);
        document.body.appendChild(cont);
    }
    function extract() {
        const questions = document.querySelectorAll('.que');
        let output = "(Paste this code to any AI of your preference.)\nPlease resolve the following physics problems. For each question, provide the exact text of the correct option. Ensure that individual answers are separated by 'ABC'. Your response must contain no introductory remarks and should exclude any option labels such as a, b, c, or d. Adhere strictly to the original capitalization and do not include line breaks, as the final output must be a single sequence of text.\n\n";
        questions.forEach((q) => {
            const qno = q.querySelector('.qno')?.innerText.replace(/\D/g, '') || "??";
            const qtext = q.querySelector('.qtext')?.innerText.trim() || '';
            const options = Array.from(q.querySelectorAll('.answer div[data-region="answer-label"], .answer label'))
                .map(opt => {
                    let clone = opt.cloneNode(true);
                    clone.querySelectorAll('.accesshide').forEach(el => el.remove());
                    return clone.innerText.trim();
                })
                .filter((text, i, self) => text.length > 0 && self.indexOf(text) === i)
                .join('\n   - ');
            output += `Question ${qno}:\n${qtext}\nOptions:\n   - ${options}\n\n-------------------\n\n`;
        });
        if (output) {
            const win = window.open('', '_blank');
            win.document.write('<pre>' + output + '</pre>');
            win.document.close();
            win.document.title = "Extracted Questions";
        }
    }
    function fill() {
        const input = prompt("paste answers (separated by ABC):");
        if (!input) return;
        const allAnswers = input.split('ABC').map(s => s.trim());
        document.querySelectorAll('.que').forEach(q => {
            const qno = parseInt(q.querySelector('.qno')?.innerText.replace(/\D/g, ''));
            const target = allAnswers[qno - 1];
            if (!target) return;
            q.querySelectorAll('input[type="radio"]').forEach(radio => {
                const lid = radio.getAttribute('aria-labelledby');
                const label = document.getElementById(lid) || radio.closest('label') || radio.parentElement;
                if (label && label.innerText.trim().includes(target)) {
                    radio.click();
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', {bubbles: true}));
                }
            });
        });
    }
    createui();
})();
