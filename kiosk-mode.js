(function () {
    'use strict';

    var params = new URLSearchParams(window.location.search);
    var isKioskEnabled = params.get('kiosk') === '1' || params.get('mode') === 'kiosk';

    if (!isKioskEnabled) {
        return;
    }

    var INACTIVITY_MS = 90000;
    var CURSOR_HIDE_MS = 4000;
    var inactivityTimer = null;
    var cursorTimer = null;

    function goHome() {
        if (window.location.hash !== '#screen-1') {
            window.location.hash = '#screen-1';
        }

        var lightboxClose = document.querySelector('.lb-close');
        if (lightboxClose) {
            lightboxClose.click();
        }
    }

    function showCursor() {
        document.body.classList.remove('kiosk-hide-cursor');
    }

    function hideCursorSoon() {
        window.clearTimeout(cursorTimer);
        cursorTimer = window.setTimeout(function () {
            document.body.classList.add('kiosk-hide-cursor');
        }, CURSOR_HIDE_MS);
    }

    function resetInactivityTimer() {
        window.clearTimeout(inactivityTimer);
        inactivityTimer = window.setTimeout(goHome, INACTIVITY_MS);
        showCursor();
        hideCursorSoon();
    }

    function blockKeys(event) {
        var key = (event.key || '').toLowerCase();
        var blocked = false;

        if (key === 'f12' || key === 'f11' || key === 'f5') {
            blocked = true;
        }

        if (event.ctrlKey && (key === 'u' || key === 's' || key === 'p' || key === 'r')) {
            blocked = true;
        }

        if (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
            blocked = true;
        }

        if (blocked) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function createHomeButton() {
        var existing = document.getElementById('kiosk-home-btn');
        if (existing) {
            return;
        }

        var button = document.createElement('button');
        button.id = 'kiosk-home-btn';
        button.type = 'button';
        button.className = 'kiosk-home-btn';
        button.setAttribute('aria-label', 'Voltar para o inicio');
        button.textContent = 'Inicio';

        button.addEventListener('click', function () {
            goHome();
            resetInactivityTimer();
        });

        document.body.appendChild(button);
    }

    function initKioskMode() {
        document.documentElement.classList.add('kiosk-mode');
        document.body.classList.add('kiosk-mode');

        createHomeButton();

        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        document.addEventListener('dragstart', function (event) {
            event.preventDefault();
        });

        document.addEventListener('keydown', blockKeys, true);

        ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach(function (eventName) {
            document.addEventListener(eventName, resetInactivityTimer, { passive: true });
        });

        window.addEventListener('hashchange', resetInactivityTimer);

        resetInactivityTimer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKioskMode);
        return;
    }

    initKioskMode();
}());
